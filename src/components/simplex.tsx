///<reference path="../../typings/main.d.ts"/>

import * as React from 'react';

interface SimplexP {
    matrix;
}

export class SimplexC extends React.Component<SimplexP, any> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <h2>Simplex</h2>
        )
    }
}