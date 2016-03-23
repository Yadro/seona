///<reference path="../../typings/main.d.ts"/>

import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface SimplexProps {
    matrix;
}

export class Simplex extends React.Component<SimplexProps, any> {

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