///<reference path="../../typings/main.d.ts"/>

import * as React from 'react';

interface SimplexP {
    log: any[];
}

export class SimplexC extends React.Component<SimplexP, any> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let log = this.props.log.map((e, i) => <div key={i}>{matrixToHtml(e, 'simplex')}</div>);
        return (
            <div>
                <div>{log}</div>
            </div>
        )
    }
}

function matrixToHtml(params, className?) {
    let tableEl = null;
    if (params.m && params.p) {
        let matrix = params.m,
            head = params.p[0],
            left = params.p[1],
            select = params.select || null;

        let table = [], headArr = [];

        // шапка
        headArr.push(<td key="0"></td>);
        for (var i = 0; i < head.length; i++) {
            headArr.push(<td key={i+1}>{"x" + (head[i] + 1)}</td>);
        }
        headArr.push(<td key={i + 1}>_</td>);

        for (let i = 0; i < matrix.height; i++) {
            let row = [];

            // первый столбец
            if (i > left.length - 1) {
                row.push(<td key="0">p</td>);
            } else {
                row.push(<td key="0">{"x" + (left[i] + 1)}</td>);
            }

            // остальные элементы
            for (let j = 0; j < matrix.width; j++) {
                if (select && select[0] == i && select[1] == j) {
                    row.push(<td key={j+1} className="select">{matrix.matrix[i][j].toFraction()}</td>);
                } else {
                    row.push(<td key={j+1}>{matrix.matrix[i][j].toFraction()}</td>);
                }
            }

            if (select && select[0] == i && select[1] == -1) {
                table.push(<tr key={i} className="select">{row}</tr>);
            } else {
                table.push(<tr key={i}>{row}</tr>);
            }
        }
        tableEl = (
            <table className={className ? className : ''}>
                <thead><tr>{headArr}</tr></thead>
                <tbody>{table}</tbody>
            </table>
        );
    }
    return (
        <div>
            {params.text ? <div>{params.text}</div> : ''}
            {tableEl}
        </div>
    )
}