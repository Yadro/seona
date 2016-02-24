///<reference path="../typings/react/react.d.ts"/>
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {InputMatrix} from 'components/input_matrix'
import {Matrix} from 'helper/matrix';

class App extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            matrix: []
        };
    }

    render() {
        return (
            <div>
                <h1>Just apply Gauss it</h1>
                <InputMatrix/>
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.querySelector('body'));

let a;
console.log(a = new Matrix(10, 10));
console.log(a.get());