///<reference path="../../typings/main.d.ts"/>

import * as React from 'react';
import Fraction = require('../../node_modules/fraction.js/fraction');
import {MatrixM} from "../helper/matrix";
import {createMatrix, createArray, changeSizeMatrix} from  '../helper/tools';

interface InputMatrixP {
    callback: (matr, polynom) => any;
}

interface InputMatrixS {
    polynom: number[]
    matrix;
    width: number;
    height: number;
}

/**
 * Класс рисующий поля для ввода коэффициентов матрицы
 */
export class InputMatrix extends React.Component<InputMatrixP, InputMatrixS> {

    constructor(props) {
        super(props);
        let matr = localStorage.getItem('matrix');
        let polynom = localStorage.getItem('polynom');

        if (matr) {
            matr = JSON.parse(matr);
        } else {
            matr = null;
        }
        if (polynom) {
            polynom = JSON.parse(polynom);
        } else {
            polynom = null;
        }

        let width = matr ? matr[0].length : 3;
        this.state = {
            polynom: polynom || createArray(width),
            matrix: matr || createMatrix(3, 3),
            width: width,
            height:  matr ? matr.length : 3,
        };
    }

    onChange(el, e) {
        const value = e.target.value;
        let matrix = this.state.matrix;
        const pos = el.split(',');
        const i = +pos[0], j = +pos[1];

        if (pos.length == 2 && matrix[i] != null && matrix[i][j] != null) {
            matrix[i][j] = value;
            this.setState({matrix} as InputMatrixS);
        }
    }

    onPolynomChange(n, e) {
        const value = e.target.value;
        let polynom = this.state.polynom;
        polynom[n] = value;
        this.setState({polynom} as InputMatrixS);
    }

    setSize(rot: 'width' | 'height', e) {
        let obj = {};
        const {height, width, matrix} = this.state;
        let size = [width, height];
        let setSize = +e.target.value;
        if (setSize > 0 && setSize <= 16) {
            obj[rot] = setSize;
            if (rot == 'width') {
                size[0] = setSize;
            } else {
                size[1] = setSize;
            }
            obj['matrix'] = changeSizeMatrix(matrix, size);
            obj['polynom'] = createArray(size[0]);
            this.setState(obj as InputMatrixS);
        }
    };

    /**
     * сохраняем матрицу и полином
     */
    verify() {
        const {matrix, polynom} = this.state;
        let matrixFract = [];

        matrix.forEach((row, i) => {
            matrixFract.push([]);
            row.forEach((el, j) => {
                try {
                    matrixFract[i].push(new Fraction(el));
                } catch (e) {
                    console.error(i + " " + j, e);
                }
            })
        });

        localStorage.setItem('matrix', JSON.stringify(matrix));
        localStorage.setItem('polynom', JSON.stringify(polynom));

        this.props.callback(new MatrixM(matrixFract), polynom);
    }

    rowPoly() {
        const polynom = this.state.polynom;
        return (
            <div key={polynom.length}>{
                polynom.map((el, index) => {
                    return <input type="text" key={index} value={el} onChange={this.onPolynomChange.bind(this, index)}/>
                })
            }</div>
        );
    }

    rowRender(row: Fraction[], index) {
        let i = 0;
        return row.map(el => (
            <input type="text" key={i} value={el}
                   onChange={this.onChange.bind(this, index + ',' + i++)}/>)
        );
    }

    render() {
        let i = 0;
        const matrix = this.state.matrix;
        const matrixComp = matrix.map((row) => (
            <div key={i}>
                {this.rowRender(row, i++)}
            </div>
        ));

        return (
            <div>
                {this.rowPoly()}
                size
                <input type="text" value={this.state.height} onChange={this.setSize.bind(this, 'height')}/>x
                <input type="text" value={this.state.width} onChange={this.setSize.bind(this, 'width')}/>
                {matrixComp}
                <button onClick={this.verify.bind(this)}>calc</button>
            </div>
        )
    }
}