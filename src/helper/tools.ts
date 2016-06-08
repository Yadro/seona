import {FractionType} from 'fraction.js';

export function arrayHas<T>(arr: T[], element: T): boolean {
    return arr.indexOf(element) !== -1;
}

export function createArray(n) {
    let a = [];
    for (var i = 0; i < n; i++) {
        a.push(0);
    }
    return a;
}

export function getLastItem(arr: any[]) {
    return arr[arr.length - 1];
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

export function changeSizeMatrix(matrix: any[][], size: number[]) {
    const width = size[0];
    const height = size[1];
    if (height > matrix.length) {
        for (let i = matrix.length; i < height; i++) {
            matrix.push([]);
        }
    } else {
        matrix.length = height;
    }
    matrix.map((row) => {
        if (width > row.length) {
            for (let i = row.length; i < width; i++) {
                row.push('');
            }
        } else {
            row.length = width;
        }
        return row;
    });
    return matrix;
}

export function getArrIndex(from: number, to: number): number[] {
    let arr = [];
    for (var i = from; i <= to; i++) {
        arr.push(i);
    }
    return arr;
}

/**
 * Создает копию массива либо создает через функцию copy
 * @param arr
 * @param copy
 * @returns {T[]}
 */
export function copyArr<T>(arr: T[], copy?: (elem: T) => T): T[] {
    if (copy) {
        return arr.map((e) => {
            return copy(e);
        });
    } else {
        return arr.slice();
    }
}

export function mulVec(vec: FractionType[], f: (el: FractionType, i: number) => FractionType) {
    return vec.map((e, i) => {
        let t = f(e, i);
        return t !== undefined ? t : e;
    })
}
