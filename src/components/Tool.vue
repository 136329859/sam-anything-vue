<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useContextStore } from 'sam/store';
import * as _ from 'underscore';
import { ToolProps } from 'sam/helpers/Interfaces';

interface Props {
    handleMouseMove: ToolProps['handleMouseMove'];
}

const props = defineProps<Props>();

const contextStore = useContextStore();
const imageClasses = '';
const maskImageClasses = `absolute opacity-40 pointer-events-none`;

// Determine if we should shrink or grow the images to match the
// width or the height of the page and setup a ResizeObserver to
// monitor changes in the size of the page
const shouldFitToWidth = ref<boolean>(false);
const bodyEl = document.body;
const fitToPage = () => {
    if (!contextStore.image) return;
    const imageAspectRatio =
        contextStore.image.width / contextStore.image.height;
    const screenAspectRatio = window.innerWidth / window.innerHeight;
    shouldFitToWidth.value = imageAspectRatio > screenAspectRatio;
};
const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
        if (entry.target === bodyEl) {
            fitToPage();
        }
    }
});

onMounted(async () => {
    fitToPage();
    resizeObserver.observe(bodyEl);
});

onUnmounted(async () => {
    resizeObserver.unobserve(bodyEl);
});

watch(
    () => contextStore.image,
    () => {
        fitToPage();
        resizeObserver.observe(bodyEl);
    }
);
</script>

<template>
    <img
        v-if="contextStore.image"
        @mousemove="props.handleMouseMove"
        @mouseout="() => _.defer(() => contextStore.setMaskImg(null))"
        @touchstart="props.handleMouseMove"
        :src="contextStore.image?.src"
        :class="`${shouldFitToWidth ? 'w-full' : 'h-full'} ${imageClasses}`"
    />
    <img
        v-if="contextStore.maskImg"
        :src="contextStore.maskImg?.src"
        :class="`${shouldFitToWidth ? 'w-full' : 'h-full'} ${maskImageClasses}`"
    />
</template>

<style scoped></style>
