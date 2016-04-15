///<reference path="../../typings/main.d.ts"/>

import * as React from 'react';
import {matrixToHtml} from "../helper/matrix";

interface SimplexP {
    matrix;
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