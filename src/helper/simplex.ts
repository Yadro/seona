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

interface IDebug {
    m?: MatrixM;
    p?: number[][];
    text?;
    select?;
    equation?;
    backup?: boolean;
    isLastStep?: boolean;
}

interface IPrintEquationVal {
    [id: number]: PrintEquation;
}
interface IdAndFractionType {
    [id: number]: FractionType;
}

export class Simplex {
    /** по шагам */
    bystep: boolean;
    polynom: FractionType[];
    polynomDirect: number;
    originPolynomSize: number;
    matrix: MatrixM;
    debug: IDebug[] = [];

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
        this.pushDebug();

        this.debug.push({
            text: 'Приводим задачу к каноническому виду:',
            equation: this.polynomEquationAddMin(
                this.polynomEquationAddFreeMember(
                    this.createPolynomCoeffEquation(this.polynom)))
        });
        this.pushLog(this.matrix.matrix, [], 'Добавляем строку');
    }

    prev() {
        for (let j = this.debug.length - 1; j >= 0; j--) {
            let debug = this.debug.pop();
            if (debug.backup && debug.backup === true && debug.m) {
                this.restoreMatrixFromDebug(debug);
                return;
            }
        }
    }

    /**
     * пошаговое вычисление
     * @param position
     * @return {boolean} алгоритм завершен
     */
    next(position?) {
        let status = this.checkValidSolution();
        if (status === false) {
            console.log('решение не допустимо');
        }
        const optimalSolution = this.checkOptimalSolution();
        if (optimalSolution === false) {
            console.log('решение не оптимально');
        }
        if (this.isLastStep && optimalSolution) {
            this.showResult();
            return true;
        }

        let pos;
        if (typeof position === 'undefined') {
            pos = this.findReference();
        } else {
            pos = {
                y: position[0],
                x: position[1]
            };
        }
        if (!pos) {
            this.debug.push({text: 'Невозможно найти опорный элемент'});
            return true;
        }
        console.log(pos);
        this.oneStep(pos);
        this.pushLog(this.matrix.matrix, [], 'Пересчитываем таблицу:');

        if (
            !this.isLastStep
            && this.matrix.height + this.matrix.width - 2 === this.originPolynomSize
            && this.isLastStep === false
        ) {
            // последний шаг
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
        this.pushDebug();
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
        // matrRaw[this.matrix.height - 1] = row;

        // calc last coefficient
        let res = getLastItem(this.polynom);

        // helper row
        let equationEx = new PrintEquation();
        equationEx.push
            .word('p')
            .equal();
        this.left.forEach((leftValue, rowIdx) => {
            equationEx.push
                .plus().x(leftValue)
                .mul()
                .word('b[').x(leftValue).word(']');
        });
        equationEx.push
            .plus()
            .fraction(getLastItem(this.polynom));
        this.debug.push({equation: equationEx});

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
    lastStepFindToPrintKnownCoeff(): IPrintEquationVal {
        let coeff: IPrintEquationVal = {};
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
    printKnownCoeff(coeffs: IPrintEquationVal) {
        for (let k in coeffs) {
            if (coeffs.hasOwnProperty(k)) {
                let equation = new PrintEquation();
                equation.push.x(k).equal().arr(coeffs[k].equation);
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
                equation.push.mul().x(id).plus();
            }
        });
        return equation;
    }

    polynomEquationAddFreeMember(equation: PrintEquation) {
        let i = this.originPolynomSize + 1;
        this.left.forEach(e => {
            equation.push.plus().x(i++);
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
    printPolynomWithSubstitution(coeffs: IPrintEquationVal) {
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
     * Преобразование таблицы
     * @param x столбец
     * @param y строка
     */
    swap(x, y) {
        let origMatrix = this.matrix.matrix;
        let matrixInst = this.matrix.clone();
        let matrix = matrixInst.matrix;
        let opor: FractionType = origMatrix[y][x];

        console.log("element: " + opor.toFraction());
        matrixInst.log();
        this.pushLog(matrix, [y, x], 'Находим опорный элемент:');

        let buf = this.head[x];
        this.head[x] = this.left[y];
        this.left[y] = buf;

        // расчет строки y (row)
        for (let i = 0; i < matrixInst.width; i++) {
            matrix[y][i] = origMatrix[y][i].div(opor);
        }
        // расчет столбца x (col)
        for (let i = 0; i < matrixInst.height; i++) {
            matrix[i][x] = origMatrix[i][x].div(opor.neg());
        }
        matrix[y][x] = new Fraction(1).div(opor);

        if (debugConf.debugRowCol) {
            matrixInst.log();
            this.pushLog(matrix, [y, x], 'Вычисляем строку и колонку:');
        }

        // вычисляем остальные строки
        let oporaRow = matrixInst.getRow(y);
        for (let i = 0; i < matrixInst.height; i++) {
            if (i === y) continue;
            let coeff = origMatrix[i][x];
            console.log(i, coeff);
            for (let j = 0; j < matrixInst.width; j++) {
                if (j === x) continue;
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
     * выбор столбца по минимальному отрицательному элементу
     * @returns {{x: number, y: number}}
     */
    findReference() {
        const this_matrix = this.matrix;
        const matrix = this_matrix.matrix;
        const height = this_matrix.height;
        const lastCol = this_matrix.getCol(this_matrix.width - 1);
        const minEls = getMinElements(this_matrix.getRow(this_matrix.height - 1).slice(0, this_matrix.width - 1));

        let minId;
        let x;
        for (let j = 0; j < minEls.length; j++) {
            const el = minEls[j];
            x = el.id;

            // индексы ненулевых положительных значений
            let cur;
            let i = 0;
            const possibleIdx = [];
            while (i < height) {
                cur = this_matrix.getElem(i, el.id);
                if (cur.compare(new Fraction(0)) > 0) {
                    possibleIdx.push(i);
                }
                i++;
            }
            if (possibleIdx.length === 0) {
                continue;
            }
            i = possibleIdx[0];
            let minEl = lastCol[i].div(this_matrix.getElem(i, x));
            minId = i;

            for (let k = 1; k < possibleIdx.length; k++) {
                let num = lastCol[possibleIdx[k]].div(this_matrix.getElem(possibleIdx[k], x));
                if (num.compare(minEl) < 0) {
                    minEl = num;
                    minId = possibleIdx[k];
                }
            }
            break;
        }
        if (minId == null) {
            return null;
        }

        return {
            x: x,
            y: minId
        };
    }

    print() {
        let obj = {};
        let txt = '';
        let mtx = this.matrix.matrix;
        this.left.forEach((e, i) => {
            txt += `\nx${e} = `;
            let xe = `x${e}`;
            obj[xe] = '';
            for (let j = 0; j < this.matrix.width - 1; j++) {
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
        if (i === -1) throw new Error('index not found');
        return i;
    }

    /**
     * Вычисляем последнюю строку в матрице
     * и домножаем коэффициенты полинома на -1, если стремится к макс
     * тоже самое с граничными условиями
     */
    firstStep() {
        let matr = this.matrix.matrix;
        let {height, width} = this.matrix;
        matr = matr.map((row: FractionType[]) => {
            if (row[row.length - 1].s === -1) {
                return row.map(e => e.neg());
            }
            return row;
        });
        let row = [];
        for (let j = 0; j < width; j++) {
            row.push(0);
            for (let i = 0; i < height; i++) {
                row[j] += matr[i][j];
            }
        }
        row = row.map(e => new Fraction(-e));
        this.matrix.matrix = matr;
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

    pushDebug() {
        this.debug.push({
            m: new MatrixM(this.matrix.matrix),
            p: [copyArr(this.head), copyArr(this.left)],
            backup: true,
            isLastStep: this.isLastStep
        });
    }

    /**
     * Проверка симплекс таблицы на допустимость
     * ???
     */
    checkValidSolution() {
        const matr = this.matrix;
        const col = matr.getCol(matr.width - 1);
        return col.every((el, idx) => {
            if (idx === matr.height - 1) {
                return true;
            }
            return (el.compare(new Fraction(0)) > 0);
        });
    }

    /**
     * Проверка на оптимальность
     * решение оптимально, если все числа в последней строке больше нуля
     */
    checkOptimalSolution() {
        const matr = this.matrix;
        const lastRow = matr.getRow(matr.height - 1);
        return lastRow.every((el, idx) => {
            if (idx === matr.height - 1) {
                return true;
            }
            return ((el.compare(new Fraction(0))) > 0);
        })
    }

    /**
     * восстановление данных из лога
     * @param debugInfo
     * @returns {boolean}
     */
    restoreMatrixFromDebug(debugInfo: IDebug) {
        if (debugInfo.m && debugInfo.p && debugInfo.p.length === 2) {
            this.matrix = debugInfo.m;
            this.head = debugInfo.p[0];
            this.left = debugInfo.p[1];
            this.isLastStep = debugInfo.isLastStep;
        } else {
            return false;
        }
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
            equation.push.fraction(num);
            if (i !== this.originPolynomSize) {
                equation.push.word(', ');
            }
        }
        equation.push.word(')');

        this.debug.push({text: 'Ответ:'});
        this.debug.push({equation});
        let equation2 = new PrintEquation();
        equation2.push
            .word('f*')
            .equal()
            .fraction(matr.getElem(matr.height - 1, matr.width - 1).neg());
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
 * Минимальный отрицательный элемент
 * @param arr
 * @returns {number|any}
 */
function getIndMinEl(arr: FractionType[]): number {
    let max, maxId;
    let i = 0;

    while (i < arr.length && arr[i].s === 1) {
        i++;
    }
    max = arr[i];
    maxId = i;

    for (; i < arr.length; i++) {
        if (arr[i].s === -1 && arr[i].compare(max) > 0) {
            max = arr[i];
            maxId = i;
        }
    }
    return maxId;
}

/**
 * Минимальный отрицательный элемент
 * @param arr
 * @returns {number|any}
 */
function getMinElements(arr: FractionType[]) {
    const els = [];
    arr.forEach((el, id) => {
        if (el.s === 1 || el.n === 0) return;
        els.push({id, value: el});
    });
    return els.sort((a, b) => {
        return a.value.compare(b.value);
    });
}