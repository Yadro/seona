///<reference path="../typings/main.d.ts"/>

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {InputMatrix} from 'components/input_matrix'
import {Matrix} from 'helper/matrix';
import Fraction = require('fraction');
import {Graph} from './components/graph';
import {SimplexC} from './components/simplex'
//import {Fraction} from "helper/fraction.js.ts";

let test = [
    [0,0,0],
    [0,1,3],
    [1,2,2],
    [7,2,10],
    [1,1,1],
];

interface AppState {
    matrix: Matrix;
}

class App extends React.Component<any, AppState> {

    constructor(props) {
        super(props);
        this.state = {
            matrix: new Matrix(3, 3)
        };
    }

    callback(matrix) {
        let m = matrix.gaussSelect(true, [0, 4, 6]);
        //m.debugMatrix.print();
        console.log(m.toString());
        this.setState({matrix: matrix});
    }

    render() {
        /*
         <h1>Just apply Gauss it</h1>
         <InputMatrix matrix={this.state.matrix} callback={this.callback.bind(this)}/>
         <Graph matrix={test}/>
        */
        return (
            <div>
                <InputMatrix matrix={this.state.matrix} callback={this.callback.bind(this)}/>
                <SimplexC matrix={test}/>
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.querySelector('.react'));
