import {MatrixM, FractMatrix} from './matrix';
import Fraction = require('fraction');
import {FractionType} from 'fraction.js';
import {copyArr, getLastItem, getArrIndex} from "./tools";
import {PrintEquation} from "../components/printEquation";

const debugConf = {
    debug: true,
    debugRowCol: false,
    debugRow: false
};

export class Simplex {
    /** по шагам */
    bystep: boolean;
    polynom: FractionType[];
    polynomDirect: number;
    originPolynomSize: number;
    matrix: MatrixM;
    debug: {
        m?: MatrixM;
        p?;
        text?;
    }[] = [];

    /**
     * Номера элементов колонок
     * нумерация с 1
     */
    head: number[];
    /**
     * Номера элементов строк
     * нумерация с 1
     */
    left: number[];

    /**
     *
     * @type {number}
     */
    isLastStep = false;

    /**
     * @param polynom
     * @param matrix матрица
     * @param bystep
     */
    constructor(polynom: number[], matrix: MatrixM, bystep: boolean) {
        console.clear();
        this.bystep = bystep;

        this.polynomDirect = polynom.pop();
        this.polynom = polynom.map((e) => new Fraction(e));
        this.originPolynomSize = polynom.length - 1;

        this.matrix = matrix;
        this.head = getArrIndex(1, matrix.width - 1);
        this.left = getArrIndex(matrix.width, matrix.width + matrix.height - 1);
        this.firstStep();

        this.debug.push({
            text: 'Polynom:',
            equation: this.polynomEquationAddMin(this.createPolynomCoeffEquation(this.polynom))
        });
        this.pushLog(this.matrix.matrix, [], 'Добавляем строку');
    }

    prev() {

    }

    // todo сделать проверку на знак числа в нижнем правом углу
    /**
     * пошаговое вычисление
     * @param position
     * @return {boolean} алгоритм завершен
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
        let el = this.matrix.getElem(pos.y, pos.x);
        if (!el || el.n == 0) {
            throw new Error('Simplex: reference element is zero');
        }
        console.log(pos);
        this.oneStep(pos);
        this.pushLog(this.matrix.matrix);

        if (this.isLastStep === true) {
            this.showResult();
            return true;
        } else if (this.matrix.height + this.matrix.width - 2 === this.originPolynomSize && this.isLastStep === false) {
            this.isLastStep = true;
            let coeff = this.lastStepFindToPrintKnownCoeff();
            this.printKnownCoeff(coeff);
            this.printPolynomWithSubstitution(coeff);
            this.createPolynomCoeffEquation(this.polynom);
            this.lastStep();
            this.pushLog(this.matrix.matrix);
        }
        return false;
    }

    /**
     * Один шаг вычисления таблицы
     * @param reference
     */
    oneStep(reference) {
        this.swap(reference.x, reference.y);
        if (this.head[reference.x] > this.originPolynomSize) {
            this.removeCol(reference.x);
        }
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

            this.pushLog(this.matrix.matrix, [], 'Конец вычислений:');
        }
        this.print();
        this.lastStep();
        this.pushLog(this.matrix.matrix);
    }

    /**
     * Подставляем найденные элементы в полином и находим коэффициенты элементов для последней строки матрицы
     * предпоследний шаг
     */
    lastStep() {
        let matr = this.matrix;
        let matrRaw = matr.matrix;
        let row = [];

        // calc coefficients
        this.head.forEach((num, headIdx) => {
            let res = this.polynom[num - 1];
            let equation = new PrintEquation();
            equation.push.x(num).equal().fraction(res);

            for (var j = 0; j < this.matrix.height - 1; j++) {
                let leftRowValue = this.left[j];
                equation.push
                    .plus()
                    .fraction(this.polynom[leftRowValue - 1])
                    .mul()
                    .fraction(matr.getElem(j, headIdx).neg());

                res = res.add(matr.getElem(j, headIdx).neg().mul(this.polynom[leftRowValue - 1]));
            }
            row.push(res);
            equation.push.equal().fraction(res);
            this.debug.push({equation});
        });
        //matrRaw[this.matrix.height - 1] = row;

        // calc last coefficient
        let res = getLastItem(this.polynom);
        let equation = new PrintEquation();
        equation.push
            .word('p')
            .equal();

        let lastCol = this.matrix.width - 1;
        this.left.forEach((leftValue, rowIdx) => {
            equation.push
                .plus()
                .fraction(this.polynom[leftValue - 1])
                .mul()
                .fraction(matr.getElem(rowIdx, lastCol));

            res = res.add(matr.getElem(rowIdx, lastCol).mul(this.polynom[leftValue - 1]));
        });
        row.push(res.neg());
        equation.push
            .plus()
            .fraction(getLastItem(this.polynom))
            .equal()
            .fraction(res);
        this.debug.push({equation});

        matrRaw[this.matrix.height - 1] = row;
    }

    /**
     * Находит, чему равны коэффициенты в стоблце (left)
     */
    lastStepFindToPrintKnownCoeff() {
        let coeff = {};
        const matrix = this.matrix;
        this.left.forEach((k, kIdx) => {
            let equation = new PrintEquation();
            // equation.push.x(k);
            // equation.push.equal();
            for (let i = 0; i < matrix.width; i++) {
                let el = matrix.getElem(kIdx, i);
                if (i !== 0) {
                    equation.push.plus();
                }
                if (i < matrix.width - 1) {
                    equation.push.fraction(el.neg());
                    equation.push.x(this.head[i]);
                } else {
                    equation.push.fraction(el);
                }
            }
            coeff[k] = equation;
        });
        return coeff;
    }

    /**
     * Распечатывает найденные коэффициенты на предпоследнем шаге
     */
    printKnownCoeff(coeffs: {[id: number]: PrintEquation}) {
        for (let k in coeffs) {
            if (coeffs.hasOwnProperty(k)) {
                let equation = new PrintEquation();
                equation.push.x(k);
                equation.push.sign(0);
                equation.push.arr(coeffs[k].equation);
                this.debug.push({equation});
            }
        }
    }

    /**
     * Распечатать полином
     * @param polynom
     */
    createPolynomCoeffEquation(polynom) {
        let equation = new PrintEquation();
        const len = polynom.length - 1;
        polynom.forEach((k, idx) => {
            const id = idx + 1;
            equation.push.fraction(k);
            if (idx !== len) {
                equation.push.sign(2).x(id).plus();
            }
        });
        return equation;
    }

    polynomEquationAddMin(equation: PrintEquation) {
        equation.push.sign(4).word('min');
        return equation;
    }

    /**
     * Печатаем полином с подстановкой известных переменных
     * @param coeffs
     */
    printPolynomWithSubstitution(coeffs: {[id: number]: PrintEquation}) {
        let equation = new PrintEquation();
        const len = this.polynom.length - 1;
        this.polynom.forEach((k, idx) => {
            const id = idx + 1;
            equation.push.fraction(k);
            if (idx === len) {
                return;
            }
            equation.push.sign(2);
            if (coeffs.hasOwnProperty(id)) {
                equation.push.word('(').arr(coeffs[id].equation).word(')');
            } else {
                equation.push.x(id);
            }
            equation.push.plus();
        });
        equation.push.arrowMin();
        this.debug.push({equation});
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
        this.pushLog(matrix, [y, x], 'Находим опорный элемент:');

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
            this.pushLog(matrix, [y, x], 'Вычисляем строку и колонку:');
        }

        // вычисляем остальные строки
        let oporaRow = matrixInst.getRow(y);
        for (let i = 0; i < matrixInst.height; i++) {
            if (i == y) continue;
            let coeff = origMatrix[i][x];
            console.log(i, coeff);
            for (var j = 0; j < matrixInst.width; j++) {
                if (j == x) continue;
                matrix[i][j] = origMatrix[i][j].sub(coeff.mul(oporaRow[j]));
            }
            if (debugConf.debugRow) {
                matrixInst.log();
                this.pushLog(matrix, [i, -1], 'Вычитаем строку:');
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

    /**
     * Вычисляем последнюю строку в матрице
     * и домножаем коэффициенты полинома на -1, если стремится к макс
     */
    firstStep() {
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

        if (this.polynomDirect === 1) {
            this.polynom = this.polynom.map(e => e.neg());
        }
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

    /**
     * Окончательный шаг, вывод коэффициентов
     */
    showResult() {
        let matr = this.matrix;
        let equation = new PrintEquation();
        equation.push
            .word('x*')
            .equal()
            .word('(');

        let coeff = this.getLastColCoeff();
        for (let i = 1; i <= this.originPolynomSize; i++) {
            let num = coeff.hasOwnProperty(i) ? coeff[i] : 0;
            equation.push
                .fraction(num)
                .word(', ');
        }
        equation.push.word(')');
        this.debug.push({equation});
        let equation2 = new PrintEquation();
        equation2.push
            .word('f*')
            .equal()
            .fraction(matr.getElem(matr.height - 1, matr.width - 1));
        this.debug.push({equation: equation2});
    }

    /**
     * Возвращает объект с номером коэффициента и значением в последнем столбце
     */
    getLastColCoeff() {
        let matr = this.matrix;
        const len = matr.height - 1;
        let lastCol = {};
        for (let i = 0; i < len; i++) {
            lastCol[this.left[i]] = matr.getElem(i, matr.width - 1);
        }
        return lastCol;
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