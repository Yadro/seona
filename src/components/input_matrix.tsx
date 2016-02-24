///<reference path="../../typings/react/react.d.ts"/>
import * as React from 'react';
import * as ReactDOM from 'react-dom';

let matrix = [[1, 2], [3, 4]];

interface InputMatrixProps {
    matrix: Array;
    callback: Function;
}

export class InputMatrix extends React.Component<InputMatrixProps, any> {

    constructor(props) {
        super(props);
    }

    onChange(e, el) {
        console.log(e, el);
    }

    render() {
        let row_render = (row, index) => {
            let i = 0;
            return row.map(el => {
                return (<input type="text" key={i++} value={el} onChange={this.onChange.bind(this, index + ',' + i)}/>)
            })
        };

        let i = 0;
        let matrix_comp = matrix.map((row) => {
            return (
                <div key={i++}>
                    {row_render(row, i)}
                </div>
            )
        });

        return (
            <div>{matrix_comp}</div>
        )
    }
}