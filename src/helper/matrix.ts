///<reference path="fraction.js.d.ts"/>
import Fraction = require('../../node_modules/fraction.js/fraction');
//import {Fraction} from 'fraction.js';

/**
 * Класс для работы с матрицами
 */
export class Matrix {
    matrix: Fraction[][];

    constructor(w, h) {
        this.matrix = [];
        for (let i = 0; i < w; i++) {
            this.matrix[i] = [];
            for (let j = 0; j < h; j++) {
                this.matrix[i].push(new Fraction(0));
            }
        }
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

    gauss() {
        const mh = this.matrix.length;
        const mw = this.matrix[0].length;
        let tmp;

        for (let i = 0; i < mh; i++) {
            let el = this.matrix[i][i];
            if (el.n == 0) {
                for (let j = i + 1; j < mw; j++) {
                    el = this.matrix[j][i];
                    if (el.n != 0) {
                        for (let k = 0; k < mw; k++) {
                            this.matrix[i][k].add(this.matrix[j][k]);
                        }
                        break;
                    }
                }
            }
            if (el.n != 0) {
                for (let j = i + 1; j < mh; j++) {
                    for (let k = mw - 1; k >= i; k--) {
                        tmp = el.inverse().mul(this.matrix[i][k].neg()).mul(this.matrix[j][i]);
                        this.matrix[j][k] = this.matrix[j][k].add(tmp);
                    }
                }
            }
        }
        return this;
    }

    toString() {
        this.matrix.forEach(row => {
            let str = '[';
            row.forEach(el => {
                str += ' ' + el.toString();
            });
            console.log(str + ']');
        })
    }
}