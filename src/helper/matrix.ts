///<reference path="../../typings/main.d.ts"/>


import Fraction = require('../../node_modules/fraction.js/fraction');
//import {Fraction} from 'fraction.js';



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
    matrix: Fraction[][];

    debugMatrix: MatrixOperation[] = [];

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

    gauss(debug: boolean = false) {
        const mh = this.matrix.length;
        const mw = this.matrix[0].length;
        let tmp;
        if (debug) {
            this.debugMatrix = [];
        }

        for (let i = 0; i < mh; i++) {
            let el = this.matrix[i][i];
            if (el.n == 0) {
                for (let j = i + 1; j < mw; j++) {
                    el = this.matrix[j][i];
                    if (el.n != 0) {
                        if (debug) {
                            this.debugMatrix.push({
                                matrix: null,
                                operation: `(${i})${arrFractionToStr(this.matrix[i])} + (${j})${arrFractionToStr(this.matrix[j])}`
                            });
                        }

                        for (let k = 0; k < mw; k++) {
                            this.matrix[i][k].add(this.matrix[j][k]);
                        }

                        if (debug) {
                            this.debugMatrix[this.debugMatrix.length - 1].matrix = this.copy();
                        }
                        break;
                    }
                }
            }
            if (el.n != 0) {
                for (let j = i + 1; j < mh; j++) {
                    let c = this.matrix[j][i].neg().div(el);
                    if (c.n == 0) {
                        break;
                    }

                    if (debug) {
                        this.debugMatrix.push({
                            matrix: null,
                            operation: `(${j})${arrFractionToStr(this.matrix[j])} + ${c.toFraction()} * (${i})${arrFractionToStr(this.matrix[i])}`
                        });
                    }

                    for (let k = mw - 1; k >= i; k--) {
                        tmp = c.mul(this.matrix[i][k]);
                        this.matrix[j][k] = this.matrix[j][k].add(tmp);
                    }

                    if (debug) {
                        this.debugMatrix[this.debugMatrix.length - 1].matrix = this.copy();
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

function arrFractionToStr(arr: Fraction[]) {
    let str = arr.reduce((pr, e) => pr + ", " +e.toFraction());
    return `[${str}]`;
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