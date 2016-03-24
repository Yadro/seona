import {Matrix} from './matrix';


export class Simplex {

    begin_basis: number[];
    matrix;

    head: number[];
    left: number[];

    /**
     * @param beginBasis номера столбцов
     * @param matrix матрица
     */
    constructor(beginBasis: number[], matrix: Matrix) {
        this.begin_basis = beginBasis;
        this.matrix = matrix;
        matrix.gaussSelect(false, beginBasis);
    }

    firstStep() {

    }

    swap_basis() {

    }
}