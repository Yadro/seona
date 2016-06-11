///<reference path="../../typings/index.d.ts"/>

import * as React from 'react';
import Fraction = require('../../node_modules/fraction.js/fraction');
import {MatrixM} from "../helper/matrix";
import {createMatrix, createArray, changeSizeMatrix, isArray} from  '../helper/tools';
import {downloadFile} from "../helper/fileLoad";

interface InputMatrixP {
    matrix;
    polynom;
    callback: (matr, polynom) => any;
    showCalc: boolean;
}

interface InputMatrixS {
    polynom: number[]
    matrix;
    width: number;
    height: number;
    polynomDirect;
}

/**
 * Класс рисующий поля для ввода коэффициентов матрицы
 * Также сохраняет и восстанавливает её из localStorage
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
        let restorePolDir;
        if (polynom) {
            polynom = JSON.parse(polynom);
            restorePolDir = polynom.pop();
        } else {
            polynom = null;
        }

        let width = matr ? matr[0].length : 3;
        this.state = {
            polynom: polynom || createArray(width),
            polynomDirect: restorePolDir || -1,
            matrix: matr || createMatrix(3, 3),
            width: width,
            height:  matr ? matr.length : 3,
        };
        this.selectChange = this.selectChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.hasOwnProperty('polynom') && isArray(nextProps.polynom)
            && nextProps.hasOwnProperty('matrix')) {
            let polynom = nextProps.polynom.slice();
            let polynomDirect = polynom.pop();
            this.setState({
                polynom: polynom,
                polynomDirect,
                matrix: nextProps.matrix,
                width: nextProps.polynom.length,
                height:  nextProps.matrix.length,
            } as InputMatrixS)
        }
    }

    onChange(el, e) {
        const value = e.target.value;
        let matrix = this.state.matrix;
        const pos = el.split(',');
        const i = +pos[0], j = +pos[1];

        if (pos.length == 2 && i < matrix.length && j < matrix[i].length) {
            matrix[i][j] = value;
            this.setState({matrix} as InputMatrixS);
        } else {
            throw new Error("Ошибка ввода параметра матрицы");
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
        const {matrix, polynomDirect} = this.state;
        let polynom = this.state.polynom;
        polynom.push(polynomDirect);
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
                polynom.map((el, index) => (
                    <input type="text" key={index} value={el}
                           onChange={this.onPolynomChange.bind(this, index)}/>
                ))}
                <span>&rarr;</span>
                {this.selectRender()}
            </div>
        );
    }

    selectChange(e) {
        this.setState({polynomDirect: +e.target.value} as InputMatrixS);
    }

    selectRender() {
        return (
            <select defaultValue={this.state.polynomDirect}
                    onChange={this.selectChange}>
                <option value="-1">min</option>
                <option value="1">max</option>
            </select>
        )
    }

    rowRender(row: Fraction[], index) {
        let i = 0;
        return row.map(el => (
            <input type="text" key={i} value={el}
                   onChange={this.onChange.bind(this, index + ',' + i++)}/>)
        );
    }

    saveToJson() {
        let obj = {};
        let poly = this.state.polynom;
        poly.push(this.state.polynomDirect);
        obj['matrix'] = this.state.matrix;
        obj['polynom'] = poly;
        downloadFile(JSON.stringify(obj));
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
                <button onClick={this.saveToJson.bind(this)}>download</button>
                <br/>
                Polynom
                {this.rowPoly()}
                Matrix size
                <input type="text"
                       value={this.state.height}
                       onChange={this.setSize.bind(this, 'height')}/>x
                <input type="text"
                       value={this.state.width}
                       onChange={this.setSize.bind(this, 'width')}/>
                {matrixComp}
                {this.props.showCalc ?
                    <button onClick={this.verify.bind(this)}>calc</button>
                    : null}
            </div>
        )
    }
}
