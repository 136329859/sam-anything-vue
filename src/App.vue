<script setup lang="ts">
/**
 * segment-anything前端的交互流程
 *
 * 阶段一
 * 0. 拿到需要交互的图片
 * 1. 获取到交互图片的onnx模型
 * 2. 获取到交互图片的npy文件
 *
 * 阶段二
 * 0. 加载交互图片
 * 1. 加载交互图片的模型
 * 2. 加载交互图片的npy文件
 *
 * 阶段三
 * 0. 用户点击图片获取到用户点击在了图片的哪个坐标点
 * 1. 获取到对应点击点的mask数据：利用这个坐标点跑onnx模型获取到对应的mask数据
 *
 * 阶段四
 * 0. 将mask数据转换成图片展示给用户，形成用户交互点击在哪个色块上的效果
 */

import 'sam/assets/scss/App.scss';
import { InferenceSession, Tensor } from 'onnxruntime-web';

import { handleImageScale } from 'sam/helpers/scaleHelper';
import { modelScaleProps } from 'sam/helpers/Interfaces';
import { onnxMaskToImage } from 'sam/helpers/maskUtils';
import { modelData } from 'sam/helpers/onnxModelAPI';

/* @ts-ignore */
import npyjs from 'npyjs';
import * as ort from 'onnxruntime-web';
import { useContextStore } from 'sam/store';
import { ref, onMounted, watch } from 'vue';
import Stage from 'sam/components/Stage.vue';

// Define image, embedding and model paths
const IMAGE_PATH = '/assets/data/truck.jpg';
const IMAGE_EMBEDDING = '/assets/data/sam_embedding.npy';
const MODEL_DIR = '/assets/data/sam_onnx_quantized.onnx';

const contextStore = useContextStore();

const model = ref<InferenceSession | null>(null); // ONNX model
const tensor = ref<Tensor | null>(null); // Image embedding tensor
// The modelScale state variable keeps track of the scale values.
const modelScale = ref<modelScaleProps | null>(null); // The ONNX model expects the input to be rescaled to 1024.

/**
 * 加载原始图片
 */
async function loadImage(url: URL) {
    try {
        const img = new Image();
        img.src = url.href;
        img.onload = () => {
            const { height, width, samScale } = handleImageScale(img);

            modelScale.value = {
                height: height, // 原始图像大小
                width: width, // 原始图像大小
                samScale: samScale // 被调整到最长边长1024的图像的缩放比例
            };

            img.width = width;
            img.height = height;
            contextStore.setImage(img);
        };
    } catch (error) {
        console.log(error);
    }
}

/**
 * 初始化ONNX模型
 */
async function initModel() {
    try {
        if (MODEL_DIR === undefined) return;

        model.value = await InferenceSession.create(MODEL_DIR);
    } catch (e) {
        console.log(e);
    }
}

/**
 * 解码Numpy文件成一个张量
 *
 */
async function loadNpyTensor(tensorFile: string, dType: string) {
    let npLoader = new npyjs();
    const npArray = await npLoader.load(tensorFile);
    // @ts-ignore
    const tensor = new ort.Tensor(dType, npArray.data, npArray.shape);
    return tensor;
}

/**
 *  跑ONNX模型
 */
async function runONNX() {
    try {
        if (
            model.value === null ||
            contextStore.clicks === null ||
            tensor.value === null ||
            modelScale.value === null
        ) {
            return;
        } else {
            // Preapre the model input in the correct format for SAM.
            // The modelData function is from onnxModelAPI.tsx.
            /**
                 * modelScale
                    {
                        height: height, // 原始图像大小
                        width: width, // 原始图像大小
                        samScale: samScale // 被调整到最长边长1024的图像的缩放比例
                    }
                 */
            /**
                 * feeds
                    {
                        image_embeddings: imageEmbedding,
                        point_coords: pointCoordsTensor,
                        point_labels: pointLabelsTensor,
                        orig_im_size: imageSizeTensor,
                        mask_input: maskInput,
                        has_mask_input: hasMaskInput
                    }
                 */
            const feeds = modelData({
                clicks: contextStore.clicks,
                tensor: tensor.value!,
                modelScale: modelScale.value!
            });
            if (feeds === undefined) return;

            // Run the SAM ONNX model with the feeds returned from modelData()
            const results = await model.value?.run(feeds)!;
            const output = results[model.value?.outputNames[0] as any];

            // The predicted mask returned from the ONNX model is an array which is
            // rendered as an HTML image using onnxMaskToImage() from maskUtils.tsx.
            contextStore.setMaskImg(
                onnxMaskToImage(output.data, output.dims[2], output.dims[3])
            );
        }
    } catch (e) {
        console.log(e);
    }
}

onMounted(async () => {
    Promise.all([
        // 1.同时加载图片 + 初始化ONNX模型
        loadImage(new URL(IMAGE_PATH, location.origin)),
        initModel()
    ]).then(() => {
        // 2.load the Segment Anything pre-computed embedding
        Promise.resolve(loadNpyTensor(IMAGE_EMBEDDING, 'float32')).then(
            (embedding) => {
                tensor.value = embedding;
            }
        );
    });
});

watch(
    () => contextStore.clicks,
    () => {
        runONNX();
    }
);
</script>

<template>
    <Stage />
</template>
