

export function arrayHave<T>(arr: T[], element: T): boolean {
    return arr.indexOf(element) !== -1;
}

export function createMatrix(w: number, h: number) {
    let matrix = [];
    for (let i = 0; i < h; i++) {
        matrix[i] = [];
        for (let j = 0; j < w; j++) {
            matrix[i].push('');
        }
    }
    return matrix;
}