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
                <h2>Simplex</h2>
                <div>{log}</div>
            </div>
        )
    }
}

function matrixToHtml(params, className?) {
    if (params.text) {
        return (<div>{params.text}</div>);
    }
    let matrix = params.m,
        head = params.p[0],
        left = params.p[1];

    let table = [], headArr = [];
    headArr.push(<td key="0"></td>);
    for (var i = 0; i < head.length; i++) {
        headArr.push(<td key={i+1}>{"x" + (head[i] + 1)}</td>);
    }
    headArr.push(<td key={i + 1}>_</td>);

    for (let i = 0; i < matrix.height; i++) {
        let row = [];
        if (i > left.length - 1) {
            row.push(<td key="0">p</td>);
        } else {
            row.push(<td key="0">{"x" + (left[i] + 1)}</td>);
        }
        for (let j = 0; j < matrix.width; j++) {
            row.push(<td key={j+1}>{matrix.matrix[i][j].toFraction()}</td>);
        }
        table.push(<tr key={i}>{row}</tr>);
    }
    return (
        <table className={className ? className : ''}>
            <thead><tr>{headArr}</tr></thead>
            <tbody>{table}</tbody>
        </table>
    )
}