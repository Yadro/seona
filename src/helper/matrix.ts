
export class Matrix {
    matrix:Array;

    constructor(w, h) {
        this.matrix = [];
        for (let i = 0; i < w; i++) {
            this.matrix[i] = [];
            for (let j = 0; j < h; j++) {
                this.matrix[j] = 0;
            }
        }
    }

    get() {
        return this.matrix;
    }

    setEl(el, value) {

    }
}