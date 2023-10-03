<script setup lang="ts">
import { modelInputProps } from 'sam/helpers/Interfaces';
import { useContextStore } from 'sam/store';
import * as _ from 'underscore';

const contextStore = useContextStore();
const flexCenterClasses = 'flex items-center justify-center';

function getClick(x: number, y: number): modelInputProps {
    const clickType = 1;
    return { x, y, clickType };
}

/**
 * 获取鼠标位置并将(x, y)坐标缩放回原始图像的比例。\
 * 使用setClicks更新点击状态， 并通过App.tsx中的useEffect ，触发ONNX模型运行生成一个新的mask
 */
function handleMouseMove(e: any) {
    let el = e.nativeEvent.target;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = contextStore.image
        ? contextStore.image.width / el.offsetWidth
        : 1;
    x *= imageScale;
    y *= imageScale;
    const click = getClick(x, y);
    if (click) contextStore.setClicks([click]);
}
</script>

<template>
    <div :class="`${flexCenterClasses} w-full h-full`">
        <div :class="`${flexCenterClasses} relative w-[90%] h-[90%]`">
            <Tool :handleMouseMove="_.throttle(handleMouseMove, 15)" />
        </div>
    </div>
</template>
