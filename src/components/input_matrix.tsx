///<reference path="../../typings/main.d.ts"/>

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Fraction = require('../../node_modules/fraction.js/fraction');
import {Matrix} from "../helper/matrix";
//import {Fraction} from '../helper/fraction.js.ts';

function createMatrix(w: number, h: number) {
    let matrix = [];
    for (let i = 0; i < h; i++) {
        matrix[i] = [];
        for (let j = 0; j < w; j++) {
            matrix[i].push('');
        }
    }
    return matrix;
}

interface InputMatrixP {
    matrix;
    callback: Function;
}

interface InputMatrixS {
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
        //let matrix = props.matrix.get();
        this.state = {
            matrix: createMatrix(3, 3),
            width: 3,
            height: 3
        };
    }

    onChange(el, e) {
        const value = e.target.value;
        let matrix = this.state.matrix;
        let pos = el.split(',');
        const i = +pos[0], j = +pos[1];

        if (pos.length == 2 && matrix[i] != null && matrix[i][j] != null) {
            matrix[i][j] = value;
            this.setState({matrix});
        }
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
                this.setState(obj);
            }
        }
    };

    row_render(row: Fraction[], index) {
        let i = 0;
        return row.map(el => {
            return (<input type="text" key={i} value={el} onChange={this.onChange.bind(this, index + ',' + i++)}/>)
        })
    }

    verify() {
        const {matrix, height, width} = this.state;

        let matr = new Matrix(width, height);
        let matrix_ = matr.matrix;

        matrix.forEach((row, i) => {
            row.forEach((el, j) => {
                try {
                    matrix_[i][j] = new Fraction(el);
                } catch(e) {
                    console.error(i + " " + j, e);
                }
            })
        });

        matr.matrix = matrix_;
        this.props.callback(matr);
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
                size
                <input type="text" onChange={this.setSize('height').bind(this)}/>x
                <input type="text" onChange={this.setSize('width').bind(this)}/>
                {matrix_comp}
                <button onClick={this.verify.bind(this)}>gauss</button>
            </div>
        )
    }
}