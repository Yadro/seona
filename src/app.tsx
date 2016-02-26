///<reference path="../typings/react/react.d.ts"/>
///<reference path="../typings/react/react-dom.d.ts"/>

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {InputMatrix} from 'components/input_matrix'
import {Matrix} from 'helper/matrix';
import Fraction = require('../node_modules/fraction.js/fraction');
//import {Fraction} from "helper/fraction.js.ts";


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
        let m = matrix.gauss(true);
        m.debugMatrix.forEach(e => {
            console.warn(e.operation.toString());
            console.log(e.matrix.toString());
        });
        console.log(m.toString());
        this.setState({matrix: matrix});
    }

    render() {
        return (
            <div>
                <h1>Just apply Gauss it</h1>
                <InputMatrix matrix={this.state.matrix} callback={this.callback.bind(this)}/>
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.querySelector('.react'));
