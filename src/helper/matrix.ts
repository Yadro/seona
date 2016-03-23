///<reference path="../../typings/main.d.ts"/>
///<reference path="fraction.js.d.ts"/>


import Fraction = require('../../node_modules/fraction.js/fraction');
import {FractionType} from './fraction.js';
import {arrayHave} from './tools';


interface MatrixOperation {
    matrix;
    operation;
}

/**
 * Класс для работы с матрицами
 */
export class Matrix {
    width: number;
    height: number;
    matrix: FractionType[][];

    debugMatrix: DebugMatrix;

    constructor(w, h, matrix?) {
        this.width = w;
        this.height = h;
        if (matrix) {
            this.matrix = matrix;
        } else {
            this.matrix = [];
            for (let i = 0; i < h; i++) {
                this.matrix[i] = [];
                for (let j = 0; j < w; j++) {
                    this.matrix[i].push(new Fraction(0));
                }
            }
        }
    }

    copy() {
        let matrix = [];
        this.matrix.forEach((r) => {
            matrix.push(r.slice());
        });
        return new Matrix(matrix[0].length, matrix.length, matrix);
    }

    set(pos: number[], value) {
        let matrix = this.matrix;
        const i = +pos[0], j = +pos[1];
        if (pos.length == 2 && matrix[i] && matrix[i][j]) {
            matrix[i][j] = value;
        } else {
            console.error(pos, matrix, 'out of array');
        }
    }

    get() {
        return this.matrix;
    }

    gauss(debug: boolean, columns?: number[]) {
        const sample = columns != null;
        const height = this.matrix.length;
        const width = this.matrix[0].length;
        let tmp;
        if (debug) {
            this.debugMatrix = new DebugMatrix();
        }

        for (let i = 0; i < height; i++) {
            let el = this.matrix[i][i];
            if (el.n == 0) {
                if (debug) {
                    this.debugMatrix.add(`${i} == 0`);
                }
                for (let j = i + 1; j < width; j++) {
                    el = this.matrix[j][i];
                    if (el.n != 0) {
                        if (debug) {
                            this.debugMatrix.add(
                                `[${i}]${arrFractionToStr(this.matrix[i])}`
                                + ` + ${arrFractionToStr(this.matrix[j])}[${j}]`);
                        }

                        for (let k = 0; k < width; k++) {
                            this.matrix[i][k].add(this.matrix[j][k]);
                        }

                        if (debug) {
                            this.debugMatrix.past(this.copy());
                        }
                        break;
                    }
                }
            }
            if (el.n != 0) {
                // делим i строку на el
                if (debug) {
                    this.debugMatrix.add(`${i} != 0`);
                }
                for (let j = 0; j < width; j++) {
                    this.matrix[i][j] = this.matrix[i][j].div(el);
                }
                el = new Fraction(1);

                // делим последующие строки после i-ой так, чтобы в столбце i были нули
                for (let j = i + 1; j < height; j++) {
                    let c = this.matrix[j][i].neg().div(el);
                    if (c.n == 0) {
                        break;
                    }

                    if (debug) this.debugMatrix.add(
                        `[${j}]${arrFractionToStr(this.matrix[j])} + ${c.toFraction()}`
                        +` * ${arrFractionToStr(this.matrix[i])}[${i}]`
                    );

                    for (let k = width - 1; k >= i; k--) {
                        tmp = c.mul(this.matrix[i][k]);
                        this.matrix[j][k] = this.matrix[j][k].add(tmp);
                    }

                    if (debug) {
                        this.debugMatrix.past(this.copy());
                    }
                }
            }
        }
        return this;
    }

    toString() {
        let buf = '';
        this.matrix.forEach(row => {
            let str = '[';
            row.forEach(el => {
                str += ' ' + el.toFraction();
            });
            buf += str + ']\n';
        });
        return buf;
    }
}


class DebugMatrix {

    log: {
        info: string;
        matrix: Matrix;
    }[] = [];

    add(info: string, matrix?: Matrix) {
        let obj;
        if (matrix) {
            obj = {
                info,
                matrix
            }
        } else {
            obj = {info};
        }
        this.log.push(obj);
    }

    past(m: Matrix) {
        this.log[this.log.length - 1].matrix = m;
    }

    print() {
        this.log.forEach(e => {
            console.info(e.info.toString());
            if (e.hasOwnProperty('matrix')) {
                console.log(e.matrix.toString());
            }
        });
    }
}

function arrFractionToStr(arr: FractionType[]) {
    let str = arr.reduce((pr: string, e: FractionType) => pr + ", " + e.toFraction());
    return `(${str})`;
}

function copyMatrix(matr) {
    let matrix = [];

    matr.forEach((row, i) => {
        matrix.push([]);
        row.forEach(el => {
            matrix[i].push(el);
        });
    });
    return matrix;
}