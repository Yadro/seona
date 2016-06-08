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
    oninput;
}

class App extends React.Component<any, AppS> {

    simplex: Simplex;

    constructor(props) {
        super(props);
        this.state = {
            matrix: null,
            simplex: null,
            log: [],
            bystep: false,
            oninput: true,
        };
    }

    calc(matrix, polynom) {
        const bystep = this.state.bystep;
        this.simplex = new Simplex(polynom, matrix, bystep);
        if (!bystep) {
            this.simplex.calc();
        }
        this.setState({
            simplex: this.simplex,
            log: this.simplex.debug,
            oninput: false
        } as AppS);
        
        /*
        let m = matrix.gaussSelect(true, [0, 4, 6]);
        m.debugMatrix.print();
        console.log(m.toString());
        this.setState({matrix: matrix});*/
    }

    onPrev() {
        this.simplex.prev();
    }
    
    onNext() {
        this.simplex.next();
        this.setState({log: this.simplex.debug} as AppS);
    }

    selectReference(e: string) {
        const pos = e.split('x');
        if (pos.length != 2) {
            throw new Error('SimplexMatrix: incorrect matrix element');
        }
        const pos_ = pos.map(el => +el);
        try {
            this.simplex.next(pos_);
            this.setState({log: this.simplex.debug} as AppS);
        } catch (err) {
            console.error(err);
        }
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
                <InputMatrix callback={this.calc.bind(this)} showCalc={this.state.oninput}/>
                {this.state.oninput ?
                    <span>
                        <input id="checkbox" type="checkbox" onChange={this.onClickCheckbox.bind(this)}/>
                        <label htmlFor="checkbox">по шагам</label>
                    </span> : null}

                <SimplexMatrix log={this.state.log}
                               callback={this.selectReference.bind(this)}
                               lastIsTouchable="false"/>
                {!this.state.oninput ?
                    <span>
                        <button onClick={this.onPrev.bind(this)}>prev</button>
                        <button onClick={this.onNext.bind(this)}>next</button>
                    </span> : null}

                {!this.state.oninput ?
                    <button onClick={this.onPrev.bind(this)}>clear</button>
                    : null}
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.querySelector('.react'));
