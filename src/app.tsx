///<reference path="../typings/main.d.ts"/>

import * as React from 'react';
//noinspection TypeScriptCheckImport
import * as ReactDOM from 'react-dom';
import {InputMatrix} from 'components/input_matrix'
import {MatrixM} from 'helper/matrix';
import Fraction = require('fraction');
import {Graph} from './components/graph';
import {SimplexMatrix} from './components/simplexMatrix'
import {Simplex} from './helper/simplex'
import {getArrIndex} from "./helper/tools";

interface AppS {
    matrix: MatrixM;
    simplex;
    log;
    bystep;
}

class App extends React.Component<any, AppS> {

    constructor(props) {
        super(props);
        this.state = {
            matrix: null,
            simplex: null,
            log: [],
            bystep: false
        };
    }

    calc(matrix, polynom) {
        let simplex = new Simplex(polynom, matrix, this.state.bystep);
        simplex.calc();

        this.setState({
            matrix: matrix,
            log: simplex.debug
        } as AppS);
        
        /*
        let m = matrix.gaussSelect(true, [0, 4, 6]);
        m.debugMatrix.print();
        console.log(m.toString());
        this.setState({matrix: matrix});*/
    }

    onClickCheckbox(e) {
        this.setState({bystep: e.target.checked} as AppS);
    }

    render() {
        /*
         <h1>Just apply Gauss it</h1>
         <InputMatrix matrix={this.state.matrix} callback={this.callback.bind(this)}/>
         <Graph matrix={test}/>
        */
        return (
            <div>
                <InputMatrix callback={this.calc.bind(this)}/>
                <span>
                    <input id="checkbox" type="checkbox" onChange={this.onClickCheckbox.bind(this)}/>
                    <label htmlFor="checkbox">по шагам</label>
                </span>
                <SimplexMatrix log={this.state.log}/>
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.querySelector('.react'));
