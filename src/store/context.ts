import { defineStore } from 'pinia';
import { modelInputProps } from 'sam/helpers/Interfaces';

interface Context {
    clicks: Array<modelInputProps> | null;
    image: HTMLImageElement | null;
    maskImg: HTMLImageElement | null;
}

export const useContextStore = defineStore('context', {
    state: (): Context => ({
        clicks: null,
        image: null,
        maskImg: null
    }),
    actions: {
        setClicks(clicks: Context['clicks']) {
            this.clicks = clicks;
        },
        setImage(image: Context['image']) {
            this.image = image;
        },
        setMaskImg(maskImg: Context['maskImg']) {
            this.maskImg = maskImg;
        }
    }
});
