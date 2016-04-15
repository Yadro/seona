import {FractionType} from 'fraction.js';

export function arrayHas<T>(arr: T[], element: T): boolean {
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


export function getArrIndex(from: number, to: number): number[] {
    let arr = [];
    for (var i = from; i <= to; i++) {
        arr.push(i);
    }
    return arr;
}

export function copyArr<T>(arr: T[], copy: (elem: T) => T) {
    return arr.map((e) => {
        return copy(e);
    });
}



export function mulVec(vec: FractionType[], f: (el: FractionType, i: number) => FractionType) {
    return vec.map((e, i) => {
        let t = f(e, i);
        return t !== undefined ? t : e;
    })
}
