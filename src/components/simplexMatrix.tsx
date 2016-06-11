///<reference path="../../typings/index.d.ts"/>

import * as React from 'react';
import PrintEquationComp from "./printEquation";

interface SimplexP {
    log: any[];
    callback: (pos) => any;
}

/**
 * Класс отвечающий за распечатку матрицы
 */
export class SimplexMatrix extends React.Component<SimplexP, any> {

    constructor(props) {
        super(props);
    }

    render() {
        const callback = this.props.callback;
        const _log = this.props.log;
        const len = _log.length - 1;
        const log = _log.map((e, i) => (
            <div key={i}>
                {matrixToHtml(e, (callback && i === len) ? callback : null, 'simplex')}
            </div>
        ));
        return (
            <div>{log}</div>
        )
    }
}

function matrixToHtml(params, callback?: Function, className?) {
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
            headArr.push(<td key={i+1}>{"x" + (head[i])}</td>);
        }
        headArr.push(<td key={i + 1}>_</td>);

        for (let i = 0; i < matrix.height; i++) {
            let row = [];

            // первый столбец
            if (i > left.length - 1) {
                row.push(<td key="0">p</td>);
            } else {
                row.push(<td key="0">{"x" + (left[i])}</td>);
            }

            // остальные элементы
            for (let j = 0; j < matrix.width; j++) {
                let className = (select && select[0] == i && select[1] == j) ? 'select' : '';
                let touchable = callback && i < matrix.height - 1 && j < matrix.width - 1;
                if (touchable) {
                    className += ' touch';
                }
                row.push(
                    <td key={j+1}
                        className={className}
                        onClick={touchable ? callback.bind(null, `${i}x${j}`) : null}>
                        {matrix.matrix[i][j].toFraction()}
                    </td>
                );
            }
            let className = (select && select[0] == i && select[1] == -1) ? 'select' : '';
            table.push(<tr key={i} className={className}>{row}</tr>);
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
            {params.text ? <div>{params.text}</div> : null}
            {params.equation ?
                <PrintEquationComp equation={params.equation}/>
                : null}
            {tableEl}
            {/*callback ? 'last' : 'no last'*/}
        </div>
    )
}