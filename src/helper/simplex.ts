import {MatrixM, FractMatrix} from './matrix';
import Fraction = require('fraction');
import {FractionType} from 'fraction.js';
import {copyArr, getLastEl} from "./tools";

export class Simplex {
    
    polynom: FractionType[];
    matrix: MatrixM;
    debug: {
        m?: MatrixM;
        p?;
        text?;
    }[] = [];

    /** номера элементов колонок */
    head: number[];
    /** номера элементов строк */
    left: number[];

    /**
     * @param polynom
     * @param matrix матрица
     * @param head номера элементов колонок
     * @param left номера элементов строк
     */
    constructor(polynom, matrix: MatrixM, head, left) {
        this.polynom = copyArr<FractionType>(polynom, (e) => new Fraction(e));
        this.matrix = matrix;
        this.head = head;
        this.left = left;
    }

    /**
     * расчеты
     */
    calc() {
        let l = this.matrix.height - 1;
        for (let i = 0; i < l; i++) {
            let opor = this.findReference();
            console.log(opor);
            this.swap(opor.x, opor.y);
            this.removeCol(opor.x);
        }
        this.pushLog(this.matrix.matrix);
        this.polynomStep();
        this.pushLog(this.matrix.matrix);
    }

    /**
     * Подставляем найденные элементы в полином и находим коэффициенты элементов
     */
    polynomStep() {
        let log;
        let matrix = this.matrix.matrix;

        this.head.forEach((num, i) => {
            let res = this.polynom[num];
            log = res.toFraction();

            for (var j = 0; j < this.matrix.height - 1; j++) {
                let leftInd = this.left[j];
                log += ' + ' + matrix[i][j].neg().toFraction() + ' * ' + this.polynom[leftInd].toFraction();
                res = res.add(matrix[i][j].neg().mul(this.polynom[leftInd]));
            }

            this.debug.push({text: `x${num+1} = ${log} = ${res.toFraction()}`});
            matrix[this.matrix.height - 1][i] = res;
        });

        let res = getLastEl(this.polynom);
        log = res.toFraction();

        // last coefficient
        let i = this.matrix.width - 1;
        for (var j = 0; j < this.matrix.height - 1; j++) {
            let leftInd = this.left[j];
            log += ' + ' + matrix[i][j].toFraction() + ' * ' + this.polynom[leftInd].toFraction();
            res = res.add(matrix[i][j].mul(this.polynom[leftInd]));
        }
        this.debug.push({text: `p = -(${log}) = ${res.neg().toFraction()}`});
        matrix[this.matrix.height - 1][i] = res.neg();
    }

    /**
     * Перестановка элементов
     * @param x столбец
     * @param y строка
     */
    swap(x, y) {
        let origMatrix = this.matrix.matrix;
        let matrixInst = this.matrix.clone();
        let matrix = matrixInst.matrix;

        let buf = this.head[x];
        this.head[x] = this.left[y];
        this.left[y] = buf;

        let ks: FractionType = origMatrix[y][x];
        console.log("element: "  +ks.toFraction());

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

        // вычисляем остальные строки
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

        this.matrix = matrixInst;
        return matrix;
    }

    /**
     * возращает номер столбца элемента
     * @param ind
     * @returns {number}
     */
    getHeadIndex(ind) {
        let i = this.head.indexOf(ind);
        if (i == -1) throw new Error('index not found');
        return i;
    }

    /**
     * возращает номер строки элемента
     * @param ind
     * @returns {number}
     */
    getLeftIndex(ind) {
        let i = this.left.indexOf(ind);
        if (i == -1) throw new Error('index not found');
        return i;
    }

    /**
     * Поиск опорного элемента
     * @returns {{k: number, s: number}}
     */
    findReference() {
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
                minEl = el;
                minId = i;
            }
        }
        return {
            x: x,
            y: minId
        }
    }

    removeCol(col: number) {
        this.matrix.removeCol(col);
        this.head.splice(col, 1);
    }

    pushLog(matrix: FractMatrix) {
        this.debug.push({
            m: new MatrixM(matrix),
            p: [copyArr(this.head), copyArr(this.left)]
        });
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