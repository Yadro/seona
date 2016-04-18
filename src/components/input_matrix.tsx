///<reference path="../../typings/main.d.ts"/>

import * as React from 'react';
import Fraction = require('../../node_modules/fraction.js/fraction');
import {MatrixM} from "../helper/matrix";
import {createMatrix, createArray} from  '../helper/tools';

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
        let pos = el.split(',');
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

    setSize(rot: 'width' | 'height') {
        let obj = {};
        return (e) => {
            let size = +e.target.value;
            if (size > 0 && size <= 16) {
                obj[rot] = size;
                if (rot == 'width') {
                    obj['matrix'] = createMatrix(size, this.state.height);
                } else {
                    obj['matrix'] = createMatrix(this.state.width, size);
                }
                obj['polynom'] = createArray(this.state.width);
                this.setState(obj as InputMatrixS);
            }
        }
    };

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
        return (
            <div key={this.state.polynom.length}>{
                this.state.polynom.map((el, index) => {
                    return <input type="text" key={index} value={el} onChange={this.onPolynomChange.bind(this, index)}/>
                })
            }</div>
        );
    }

    row_render(row: Fraction[], index) {
        let i = 0;
        return row.map(el => {
            return (<input type="text" key={i} value={el} onChange={this.onChange.bind(this, index + ',' + i++)}/>)
        })
    }

    render() {
        let i = 0, matrix = this.state.matrix;

        let matrix_comp = matrix.map((row) => {
            return (
                <div key={i}>
                    {this.row_render(row, i++)}
                </div>
            )
        });

        return (
            <div>
                {this.rowPoly()}
                size
                <input type="text" value={this.state.height} onChange={this.setSize('height').bind(this)}/>x
                <input type="text" value={this.state.width} onChange={this.setSize('width').bind(this)}/>
                {matrix_comp}
                <button onClick={this.verify.bind(this)}>calc</button>
            </div>
        )
    }
}