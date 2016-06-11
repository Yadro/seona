///<reference path="../../typings/index.d.ts"/>

import * as React from 'react';
import * as Snap from '../../node_modules/snapsvg/dist/snap.svg';
import {GraphC} from "../helper/graphc";

let test = [
    [0,0,0],
    [0,1,3],
    [1,2,2],
    [7,2,10],
    [1,1,1],
    [1,1,10],
    [1,2,-3],
    [1,2,-20],
];

interface GraphProps {
    matrix;
}

export class Graph extends React.Component<GraphProps, any> {

    graph;

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.graph = new GraphC('#svg', this.props.matrix || test);
    }

    componentDidUpdate() {
        this.graph();
    }

    render() {
        return (
            <div>
                <h1>Snap svg</h1>
                <svg id="svg" width="800px" height="600px"/>
            </div>
        )
    }
}