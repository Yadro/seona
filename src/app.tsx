///<reference path="../typings/main.d.ts"/>

import * as React from 'react';
//noinspection TypeScriptCheckImport
import * as ReactDOM from 'react-dom';
import {InputMatrix} from 'components/input_matrix'
import {MatrixM} from 'helper/matrix';
import Fraction = require('fraction');
import {Graph} from './components/graph';
import {SimplexC} from './components/simplex'
import {Simplex} from './helper/simplex'
import {getArrIndex} from "./helper/tools";
//import {Fraction} from "helper/fraction.js.ts";

let test = [
    [0,0,0],
    [0,1,3],
    [1,2,2],
    [7,2,10],
    [1,1,1],
];

interface AppS {
    matrix: MatrixM;
    log;
}

class App extends React.Component<any, AppS> {

    constructor(props) {
        super(props);
        this.state = {
            matrix: null,
            simplex: null,
            log: []
        };
    }

    callback(matrix) {
        let simplex = new Simplex([], matrix,
            getArrIndex(0, matrix.width - 2),
            getArrIndex(matrix.width - 1, matrix.width + matrix.height - 3)
        );
        simplex.swap_basis(7, 2);

        this.setState({
            matrix: matrix,
            log: simplex.debug
        });
        
        /*
        let m = matrix.gaussSelect(true, [0, 4, 6]);
        m.debugMatrix.print();
        console.log(m.toString());
        this.setState({matrix: matrix});*/
    }

    render() {
        /*
         <h1>Just apply Gauss it</h1>
         <InputMatrix matrix={this.state.matrix} callback={this.callback.bind(this)}/>
         <Graph matrix={test}/>
        */
        return (
            <div>
                <InputMatrix callback={this.callback.bind(this)}/>
                <SimplexC matrix={test} log={this.state.log}/>
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.querySelector('.react'));
