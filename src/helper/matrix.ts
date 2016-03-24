///<reference path="../../typings/main.d.ts"/>
///<reference path="fraction.js.d.ts"/>


import Fraction = require('fraction');
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

    clone() {
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
                for (let j = i + 1; j < height; j++) {
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
                            this.debugMatrix.past(this.clone());
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
                        this.debugMatrix.past(this.clone());
                    }
                }
            }
        }
        return this;
    }



    gaussSelect(debug: boolean, columns: number[]) {
        let rows = [];
        const height = this.matrix.length;
        const width = this.matrix[0].length;
        let tmp;
        if (debug) {
            this.debugMatrix = new DebugMatrix();
        }

        for (let i = 0; i < height; i++) {
            if (i > columns.length - 1) {
                break;
            }
            let column = columns[i];

            let el = this.matrix[i][column];
            if (el.n == 0) {
                for (let j = column + 1; j < width; j++) {
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
                            this.debugMatrix.past(this.clone());
                        }
                        break;
                    }
                }
            }
            if (el.n != 0) {
                rows.push(i);

                // делим i строку на el
                for (let j = 0; j < width; j++) {
                    this.matrix[i][j] = this.matrix[i][j].div(el);
                }
                el = new Fraction(1);

                // делим строки после i-ой так, чтобы в столбце i были нули
                for (let row = i + 1; row < height; row++) {
                    let k = this.matrix[row][column].neg().div(el);
                    if (k.n == 0) {
                        break;
                    }

                    if (debug) this.debugMatrix.add(
                        `[${row}]${arrFractionToStr(this.matrix[row])} + ${k.toFraction()}`
                        +` * ${arrFractionToStr(this.matrix[i])}[${i}]`
                    );

                    for (let col = 0; col < width; col++) {
                        tmp = k.mul(this.matrix[i][col]);
                        this.matrix[row][col] = this.matrix[row][col].add(tmp);
                    }

                    if (debug) {
                        this.debugMatrix.past(this.clone());
                    }
                }
            }
        }

        this.debugMatrix.add(function() {
            let msg = rows + ' ' + columns;
            console.warn(msg);
        });

        this.log();
        while (rows.length && columns.length) {
            let numRow = rows.pop();
            let numRol = columns.pop();
            let workRow = this.matrix[numRow];

            console.groupCollapsed(`[${numRow}][${numRol}]`);

            for (let i = 0; i < height; i++) {
                if (i == numRow || this.matrix[i][numRol].n == 0) {
                    continue;
                }
                let iRow = this.matrix[i];
                let k = iRow[numRol].div(workRow[numRol]);

                if (debug ) {
                    console.warn(`[${i}]${arrFractionToStr(iRow)} - ${k}*${arrFractionToStr(workRow)}`);
                }

                for (var col = 0; col < width; col++) {
                    iRow[col] = iRow[col].sub(workRow[col].mul(k));
                }

                if (debug) {
                    this.log();
                }
            }
            console.groupEnd();
        }
        return this;
    }

    rowAdd(row: number, value: FractionType) {
        this.matrix[row] = this.matrix[row].map(e => e.add(value));
    }

    /**
     * Вычесть строку b из строки a
     * @param a
     * @param b
     */
    rowSubRow(a: number, b: Fraction[]) {
        for (var col = 0; col < this.matrix[0].length; col++) {
            this.matrix[a][col] = this.matrix[a][col].sub(b[col]);
        }
    }

    toString() {
        let buf = '';
        this.matrix.forEach(row => {
            let str = '[';
            row.forEach(el => {
                str += '\t' + el.toFraction();
            });
            buf += str + ']\n';
        });
        return buf;
    }

    log() {
        let m = [];
        this.matrix.forEach((row, i) => {
            m.push([]);
            row.forEach(el => {
                m[i].push(el.toFraction());
            });
        });
        console.table(m);
    }
}


class DebugMatrix {

    log: {
        info: string | Function;
        matrix: Matrix;
    }[] = [];

    add(info: string | Function, matrix?: Matrix) {
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
            if (typeof e.info == "function") {
                e.info();
            } else {
                console.info(e.info.toString());
            }
            if (e.hasOwnProperty('matrix')) {
                console.log(e.matrix.log());
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

export class MatrixM {
    width: number;
    height: number;
    matrix: FractionType[][];
    debugMatrix: DebugMatrix;


    constructor(matrix: FractionType[][] | number[][]) {
        if (!matrix[0].length) {
            throw new Error('matrix is not matrix')
        }
        if (typeof matrix[0][0] != "object") {
            this.matrix = [];
            for (let i = 0; i < matrix.length; i++) {
                this.matrix.push([]);
                for (let j = 0, l = matrix[0].length; j < l; j++) {
                    this.matrix[i].push(new Fraction(matrix[i][j]));
                }
            }
        } else {
            this.matrix = <Array>matrix;
        }
        this.height = matrix.length;
        this.width = matrix[0].length;
    }

    getRow(row): FractionType[] {
        return this.matrix[row];
    }

    getCol(col): FractionType[] {
        let vec = [];
        for (var i = 0; i < this.height; i++) {
            vec.push(this.matrix[i][col]);
        }
        return vec;
    }

    addRow(row: number, vec: FractionType[], k?: FractionType) {
        if (row >= this.height) {
            throw new Error('Index out of bounds');
        }
        if (vec.length != this.width) {
            console.warn(`Length are not equal`);
        }

        if (k) {
            vec = vec.map(v => v.mul(k));
        }
        for (let i = 0, l = Math.min(this.width, vec.length); i < l; i++) {
            this.matrix[row][i] = this.matrix[row][i].add(vec[i]);
        }
    }

    addColumn(col: number, vec: FractionType[], k?: FractionType) {
        if (col >= this.width) {
            throw new Error('Index out of bounds');
        }
        if (vec.length != this.width) {
            console.warn(`Length are not equal`);
        }

        if (k) {
            vec = vec.map(v => v.mul(k));
        }
        for (let i = 0, l = Math.min(this.width, vec.length); i < l; i++) {
            this.matrix[i][col] = this.matrix[i][col].add(vec[i]);
        }
    }

    mulRow(row: number, vec: FractionType[]) {
        if (row >= this.height) {
            throw new Error('Index out of bounds');
        }
        if (vec.length != this.width) {
            console.warn(`Length are not equal`);
        }

        for (let i = 0, l = Math.min(this.width, vec.length); i < l; i++) {
            this.matrix[row][i] = this.matrix[row][i].mul(vec[i]);
        }
    }

    eachRow(row, func: (cur: FractionType, index: number, stop?) => FractionType | number, begin?: number) {
        let br = false;
        if (row >= this.height) {
            throw new Error('Index out of bounds');
        }
        function stop() {
            br = true;
        }

        for (let i = begin || 0, l = this.height; i < l; i++) {
            let tmp = func(this.matrix[row][i], i, stop);
            if (br) {
                break;
            } else {
                if (typeof tmp == "number") {
                    this.matrix[row][i] = new Fraction(tmp);
                } else if (tmp instanceof Fraction) {
                    this.matrix[row][i] = <FractionType>tmp;
                }
            }
        }
    }

    gauss(debug: boolean) {
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
                for (let j = i + 1; j < height; j++) {
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
                            this.debugMatrix.past(this.clone());
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
                        this.debugMatrix.past(this.clone());
                    }
                }
            }
        }
        return this;
    }

    gaussSelect(debug: boolean, columns: number[]) {
        let rows = [];
        const {height, width} = this;
        let tmp;
        if (debug) {
            this.debugMatrix = new DebugMatrix();
        }

        for (let i = 0; i < height; i++) {
            if (i > columns.length - 1) {
                break;
            }
            let column = columns[i];

            let el = this.matrix[i][column];
            if (el.n == 0) {
                for (let j = i + 1; j < height; j++) {
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
                            this.debugMatrix.past(this.clone());
                        }
                        break;
                    }
                }
            }
            if (el.n != 0) {
                rows.push(i);

                // делим i строку на el
                for (let j = 0; j < width; j++) {
                    this.matrix[i][j] = this.matrix[i][j].div(el);
                }
                el = new Fraction(1);

                // делим строки после i-ой так, чтобы в столбце i были нули
                for (let row = i + 1; row < height; row++) {
                    let k = this.matrix[row][column].neg().div(el);
                    if (k.n == 0) {
                        break;
                    }

                    if (debug) this.debugMatrix.add(
                        `[${row}]${arrFractionToStr(this.matrix[row])} + ${k.toFraction()}`
                        +` * ${arrFractionToStr(this.matrix[i])}[${i}]`
                    );

                    for (let col = 0; col < width; col++) {
                        tmp = k.mul(this.matrix[i][col]);
                        this.matrix[row][col] = this.matrix[row][col].add(tmp);
                    }

                    if (debug) {
                        this.debugMatrix.past(this.clone());
                    }
                }
            }
        }

        this.debugMatrix.add(function() {
            let msg = rows + ' ' + columns;
            console.warn(msg);
        });

        this.log();
        while (rows.length && columns.length) {
            let numRow = rows.pop();
            let numRol = columns.pop();
            let workRow = this.matrix[numRow];

            console.groupCollapsed(`[${numRow}][${numRol}]`);

            for (let i = 0; i < height; i++) {
                if (i == numRow || this.matrix[i][numRol].n == 0) {
                    continue;
                }
                if (workRow[numRol].equals(0) == true) {
                    throw new Error('неверное опорное решение'); // fixme
                }

                let iRow = this.matrix[i];
                let k = iRow[numRol].div(workRow[numRol]);

                if (debug ) {
                    console.warn(`[${i}]${arrFractionToStr(iRow)} - ${k}*${arrFractionToStr(workRow)}`);
                }

                for (var col = 0; col < width; col++) {
                    iRow[col] = iRow[col].sub(workRow[col].mul(k));
                }

                if (debug) {
                    this.log();
                }
            }
            console.groupEnd();
        }
        return this;
    }

    equals(matrix: MatrixM): boolean {
        if (this.height != matrix.height || this.width != matrix.width) {
            return false;
        }
        let {width, height} = this;
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (!this.matrix[i][j].equals(matrix[i][j])) {
                    return false;
                }
            }
        }
        return true;
    }

    clone() {
        let matrix = [];
        this.matrix.forEach((r) => {
            matrix.push(r.slice());
        });
        return new Matrix(matrix[0].length, matrix.length, matrix);
    }

    toString() {
        let buf = '';
        this.matrix.forEach(row => {
            let str = '[';
            row.forEach(el => {
                str += '\t' + el.toFraction();
            });
            buf += str + ']\n';
        });
        return buf;
    }

    log() {
        let m = [];
        this.matrix.forEach((row, i) => {
            m.push([]);
            row.forEach(el => {
                m[i].push(el.toFraction());
            });
        });
        console.table(m);
    }
}