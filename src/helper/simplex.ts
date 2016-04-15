import {MatrixM} from './matrix';
import Fraction = require('fraction');
import {FractionType} from 'fraction.js';

export class Simplex {

    begin_basis: number[];
    matrix: MatrixM;

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

    firstStep() {

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
     * asdfasdf
     * @param k столбец
     * @param s строка
     */
    swap_basis(k, s) {
        let origMatrix = this.matrix.matrix;
        let matrixInst = this.matrix.clone();
        let matrix = matrixInst.matrix;

        let x = this.getLeftIndex(k);
        let y = this.getHeadIndex(s);
        let ks: FractionType = origMatrix[y][x];

        // расчет строки y (s)
        for (let i = 0; i < matrixInst.width; i++) {
            matrix[y][i] = origMatrix[y][i].div(ks);
        }
        // расчет столбца x (k)
        for (let i = 0; i < matrixInst.height; i++) {
            matrix[i][x] = origMatrix[i][x].div(ks.neg());
        }
        matrix[y][x] = new Fraction(1).div(ks);

        matrixInst.log();

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
        }

        let buf = this.head[x];
        this.head[x] = this.left[y];
        this.left[y] = buf;

        this.matrix = matrixInst;
        return matrix;
    }
}