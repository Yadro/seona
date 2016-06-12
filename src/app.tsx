///<reference path="../typings/index.d.ts"/>

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
import PrintEquationComp from "./components/printEquation";
import {uploadFile} from './helper/fileLoad';
import Help from "./components/help";

interface AppS {
    matrix: MatrixM;
    simplex;
    log;
    bystep;
    oninput;
    end;
    polynom;
}

class App extends React.Component<any, AppS> {

    simplex: Simplex;

    constructor(props) {
        super(props);
        this.state = {
            matrix: null,
            polynom: null,
            simplex: null,
            log: [],
            bystep: false,
            oninput: true,
            end: false,
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
    }

    onPrev() {
        let res = this.simplex.prev();
        this.setState({
            log: this.simplex.debug,
            end: false
        } as AppS);
    }

    onNext(pos?) {
        let res = this.simplex.next(pos);
        this.setState({
            log: this.simplex.debug,
            end: res
        } as AppS);
    }

    onSelectReference(e: string) {
        const pos = e.split('x');
        if (pos.length != 2) {
            throw new Error('SimplexMatrix: incorrect matrix element');
        }
        const pos_ = pos.map(el => +el);
        try {
            this.onNext(pos_);
        } catch (err) {
            console.error(err);
        }
    }

    onClickCheckbox(e) {
        this.setState({bystep: e.target.checked} as AppS);
    }

    onUploadFile(obj) {
        this.setState({
            matrix: obj.matrix,
            polynom: obj.polynom
        } as AppS);
    }

    render() {

        return (
            <div>
                <Help />
                <input type="file" id="files" name="files[]"
                       onChange={uploadFile.bind(null, this.onUploadFile.bind(this))}/>
                <InputMatrix
                    callback={this.calc.bind(this)}
                    showCalc={this.state.oninput}
                    matrix={this.state.matrix}
                    polynom={this.state.polynom}
                />
                {this.state.oninput ?
                    <span>
                        <input id="checkbox" type="checkbox" onChange={this.onClickCheckbox.bind(this)}/>
                        <label htmlFor="checkbox">по шагам</label>
                    </span> : null}

                <SimplexMatrix log={this.state.log}
                               callback={this.onSelectReference.bind(this)}
                               lastIsTouchable="false"/>
                {!this.state.oninput && !this.state.end ?
                    <span>
                        <button onClick={this.onPrev.bind(this)}>prev</button>
                        <button onClick={this.onNext.bind(this, undefined)}>next</button>
                    </span> : null}
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.querySelector('.react'));
