import {Matrix} from './matrix';


export class Simplex {

    begin_basis: number[];
    matrix;

    constructor(beginBasis, matrix: Matrix) {
        this.begin_basis = beginBasis;
        this.matrix = matrix;
        matrix.gauss(false);
    }

    firstStep() {

    }

    swap_basis() {

    }
}