import {MatrixM, FractMatrix} from './matrix';
import Fraction = require('fraction');
import {FractionType} from 'fraction.js';
import {copyArr, getLastItem, getArrIndex} from "./tools";

const debugConf = {
    debug: true,
    debugRowCol: false,
    debugRow: false
};

export class Simplex {
    /** по шагам */
    bystep: boolean;
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
     * @param bystep
     */
    constructor(polynom: number[], matrix: MatrixM, bystep: boolean) {
        console.clear();
        this.bystep = bystep;
        this.polynom = polynom.map((e) => new Fraction(e));
        this.matrix = matrix;
        this.head = getArrIndex(1, matrix.width - 1);
        this.left = getArrIndex(matrix.width, matrix.width + matrix.height - 1);
        this.addLastRow();

        this.pushLog(this.matrix.matrix, [], 'Добавляем строку');
    }

    prev() {

    }

    /**
     * пошаговое вычисление
     * @param position
     */
    next(position?) {
        let pos;
        if (typeof position === 'undefined') {
            pos = this.findReference();
        } else {
            pos = {
                y: position[0],
                x: position[1]
            }
        }
        console.log(pos);
        this.oneStep(pos);
        this.pushLog(this.matrix.matrix);
    }

    /**
     * один шаг вычисления таблицы
     * @param reference
     */
    oneStep(reference) {
        this.swap(reference.x, reference.y);
        this.removeCol(reference.x);
    }
    

    /**
     * автоматическое вычисление и вывод результата
     */
    calc() {
        let l = this.matrix.height - 1;
        for (let i = 0; i < l; i++) {
            let opor = this.findReference();
            console.log(opor);

            this.swap(opor.x, opor.y);
            this.removeCol(opor.x);

            this.pushLog(this.matrix.matrix, [], 'Конец вычислений');
        }
        this.print();
        this.lastStep();
        this.pushLog(this.matrix.matrix);
    }

    /**
     * Подставляем найденные элементы в полином и находим коэффициенты элементов
     * todo не правильно вычисляет коэфф последнего эл
     */
    lastStep() {
        let log;
        let matrix = this.matrix.matrix;
        let row = [];

        // calc coefficients
        this.head.forEach((num, i) => {
            num -= 1;
            let res = this.polynom[num];
            log = res.toFraction();

            for (var j = 0; j < this.matrix.height - 1; j++) {
                let leftInd = this.left[j];
                log += ' + ' + matrix[i][j].neg().toFraction() + ' * ' + this.polynom[leftInd].toFraction();
                res = res.add(matrix[i][j].neg().mul(this.polynom[leftInd]));
            }
            row.push(res);

            this.debug.push({text: `x${num+1} = ${log} = ${res.toFraction()}`});
        });
        matrix[this.matrix.height - 1] = row;

        // calc last coefficient
        // res = p_n + sum_left_j(m_0j * p_j)
        let res = getLastItem(this.polynom);
        log = res.toFraction();

        let i = this.matrix.width - 1;
        for (var j = 0; j < this.matrix.height - 1; j++) {
            let leftInd = this.left[j];
            log += ' + ' + matrix[i][j].toFraction() + ' * ' + this.polynom[leftInd].toFraction();
            res = res.add(matrix[i][j].mul(this.polynom[leftInd]));
        }
        row.push(res.neg());

        this.debug.push({text: `p = -(${log}) = ${res.neg().toFraction()}`});

        matrix[this.matrix.height - 1] = row;
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
        let ks: FractionType = origMatrix[y][x];

        console.log("element: "  +ks.toFraction());
        matrixInst.log();
        this.pushLog(matrix, [y, x], 'Находим опорный элемент');

        let buf = this.head[x];
        this.head[x] = this.left[y];
        this.left[y] = buf;

        // расчет строки y (row)
        for (let i = 0; i < matrixInst.width; i++) {
            matrix[y][i] = origMatrix[y][i].div(ks);
        }
        // расчет столбца x (col)
        for (let i = 0; i < matrixInst.height; i++) {
            matrix[i][x] = origMatrix[i][x].div(ks.neg());
        }
        matrix[y][x] = new Fraction(1).div(ks);

        if (debugConf.debugRowCol) {
            matrixInst.log();
            this.pushLog(matrix, [y, x], 'Вычисляем строку и колонку');
        }

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
            if (debugConf.debugRow) {
                matrixInst.log();
                this.pushLog(matrix, [i, -1], 'Вычитаем строку');
            }
        }

        this.matrix = matrixInst;
        return matrix;
    }

    /**
     * Поиск опорного элемента
     * @returns {{x: number, y: number}}
     */
    findReference() {
        const this_matrix = this.matrix;
        let matrix = this_matrix.matrix;
        
        // todo проверить есть ли отриц элементы
        let x = getIndMaxEl(this_matrix.getRow(this_matrix.height - 1).slice(0, this_matrix.width - 2));

        let i = 0;
        while (i < this_matrix.height - 1 && matrix[i][x].s == -1) {
            i++;
        }

        let lastCol = this_matrix.getCol(this_matrix.width - 1);
        let minEl = lastCol[i].div(matrix[i][x]);
        let minId = i;
        for (; i < this_matrix.height - 1; i++) {
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

    print() {
        let obj = {};
        let txt = '';
        let mtx = this.matrix.matrix;
        this.left.forEach((e, i) => {
            txt += `\nx${e} = `;
            let xe = `x${e}`;
            obj[xe] = '';
            for (var j = 0; j < this.matrix.width - 1; j++) {
                let multipler = `${mtx[i][j].neg().toFraction()}*x${this.head[j]} + `;
                obj[xe] += multipler;
                txt += multipler;
            }
            let mul = `${mtx[i][this.matrix.width - 1].toFraction()}`;
            txt += mul;
            obj[xe] += mul;
        });
        console.log(txt);
        console.log(obj);
        return txt;
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

    private addLastRow() {
        let {matrix: mtx, height, width} = this.matrix;
        let row = new Array(width);

        for (let j = 0; j < width; j++) {
            row[j] = 0;
            for (let i = 0; i < height; i++) {
                row[j] += mtx[i][j];
            }
        }
        row = row.map(e => new Fraction(-e));
        this.matrix.pushRow(row);
    }

    private removeCol(col: number) {
        this.matrix.removeCol(col);
        this.head.splice(col, 1);
    }

    /**
     * Печатает матрицу с именами строк и столбцов, и выделяет элемент или всю строку
     * @param matrix
     * @param select
     * @param text
     */
    pushLog(matrix: FractMatrix, select?: number[], text?: string) {
        this.debug.push({
            m: new MatrixM(matrix),
            p: [copyArr(this.head), copyArr(this.left)],
            select: select || null,
            text: text || null
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