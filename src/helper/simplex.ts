import {MatrixM} from './matrix';
import Fraction = require('fraction');
import {FractionType} from 'fraction.js';

export class Simplex {

    begin_basis: number[];
    matrix: MatrixM;
    debug: MatrixM[] = [];

    /** номера элементов колонок */
    head: number[];
    /** номера элементов строк */
    left: number[];

    /**
     * @param beginBasis номера столбцов
     * @param matrix матрица
     * @param head номера элементов колонок
     * @param left номера элементов строк
     */
    constructor(beginBasis: number[], matrix: MatrixM, head, left) {
        this.begin_basis = beginBasis;
        this.matrix = matrix;
        this.head = head;
        this.left = left;
        //matrix.gaussSelect(false, beginBasis);
    }

    getHeadIndex(ind) {
        let i = this.head.indexOf(ind);
        if (i == -1) throw new Error('index not found');
        return i;
    }

    getLeftIndex(ind) {
        let i = this.left.indexOf(ind);
        if (i == -1) throw new Error('index not found');
        return i;
    }

    /**
     * Поиск опорного элемента
     * @returns {{k: number, s: number}}
     */
    findOpor() {
        let matrix = this.matrix.matrix;
        // todo проверить есть ли отриц элементы
        let x = getIndMaxEl(this.matrix.getRow(this.matrix.height - 1).slice(0, this.matrix.width - 2));
        
        let i = 0;
        while (i < this.matrix.height - 1 && matrix[i][x].s == -1) {
            i++;
        }

        let lastCol = this.matrix.getCol(this.matrix.width - 1);
        let minEl = lastCol[i].div(matrix[i][x]);
        let minId = i;
        for (; i < this.matrix.height - 1; i++) {
            if (matrix[i][x].s == -1) continue;

            let el = lastCol[i].div(matrix[i][x]);

            if (el.compare(minEl) < 0) {
                console.log(`${el.toFraction()} < ${minEl.toFraction()}`);
                minEl = el;
                minId = i;
            } else {
                console.log(`${el.toFraction()} >= ${minEl.toFraction()}`);
            }
        }
        return {
            x: x,
            y: minId
        }
    }

    firstStep() {
        let l = this.matrix.height;
        for (let i = 0; i < l; i++) {
            let opor = this.findOpor();
            console.log(opor);
            this.swap(opor.x, opor.y);
        }
    }

    /**
     * Перестановка элементов
     * @param col столбец
     * @param row строка
     */
    swap(col, row) {
        let origMatrix = this.matrix.matrix;
        let matrixInst = this.matrix.clone();
        let matrix = matrixInst.matrix;

        let x = col;
        let y = row;
        let ks: FractionType = origMatrix[y][x];

        // расчет строки y (row)
        for (let i = 0; i < matrixInst.width; i++) {
            matrix[y][i] = origMatrix[y][i].div(ks);
        }
        // расчет столбца x (col)
        for (let i = 0; i < matrixInst.height; i++) {
            matrix[i][x] = origMatrix[i][x].div(ks.neg());
        }
        matrix[y][x] = new Fraction(1).div(ks);

        matrixInst.log();
        this.pushLog(matrix);

        let oporaRow = matrixInst.getRow(y);
        for (let i = 0; i < matrixInst.height; i++) {
            if (i == y) continue;
            let koeff = origMatrix[i][x];
            console.log(i, koeff);
            for (var j = 0; j < matrixInst.width; j++) {
                if (j == x) continue;
                matrix[i][j] = origMatrix[i][j].sub(koeff.mul(oporaRow[j]));
            }
            matrixInst.log();
            this.pushLog(matrix);
        }

        let buf = this.head[x];
        this.head[x] = this.left[y];
        this.left[y] = buf;

        this.matrix = matrixInst;
        return matrix;
    }

    removeCol(col: number) {

    }

    pushLog(matrix) {
        this.debug.push(new MatrixM(matrix));
    }
}

/**
 * Наибольший отрицательный элемент
 * @param arr
 * @returns {number|any}
 */
function getIndMaxEl(arr: FractionType[]): number {
    let max, maxId;
    let i = 0;

    while (i < arr.length && arr[i].s == 1) {
        i++;
    }
    max = arr[i];
    maxId = i;

    for (; i < arr.length; i++) {
        if (arr[i].s == -1 && arr[i].compare(max) > 0) {
            max = arr[i];
            maxId = i;
        }
    }
    return maxId;
}