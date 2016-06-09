///<reference path="../../typings/main.d.ts"/>
///<reference path="../helper/fraction.js.d.ts"/>
import * as React from 'react';
import Fraction = require('fraction');
import {FractionType} from "../helper/fraction.js";

interface Equation {
    x?: number;
    sign?: number;
    word?: string;
    fraction?: FractionType;
}

const signs = {
    '-1': ' - ',
    0: ' = ',
    1: ' + ',
    2: '&middot;',
    3: ' : ',
};

interface PrintEquationCompP {
    equation: PrintEquation;
}

export default class PrintEquationComp extends React.Component<PrintEquationCompP, any> {
    /**
     * @example x1 = + 1/2·x1 - 1/2·x2 - 1/2·x3 + 1/2·x4 + 5(-1/2·x4 + 10)
     */
    equation: Equation[] = [
        {x: 1},
        {sign: 0},

        {sign: 1},
        {fraction: new Fraction(1,2)},
        {x: 1},
        {sign: 1},
        {fraction: new Fraction(-1,2)},
        {x: 2},

        {sign: -1},
        {fraction: new Fraction(1,2)},
        {x: 3},
        {sign: -1},
        {fraction: new Fraction(-1,2)},
        {x: 4},

        {sign: 1},
        {fraction: new Fraction(5)},
        {sign: 2},
        {word: '('},
        {fraction: new Fraction(-1,2)},
        {x: 4},
        {sign: 1},
        {fraction: new Fraction(10)},
        {word: ')'},
    ];
    
    constructor(props: PrintEquationCompP) {
        super(props);
        this.equation = props.equation ? props.equation.equation : this.equation;
    }

    sub(value) {
        return `<sub>${value}</sub>`;
    }

    render() {
        let buf = '';
        let last: Equation = {};
        this.equation.forEach((el: Equation, idx) => {
            if (el.hasOwnProperty('x')) {
                if (last.hasOwnProperty('fraction')) {
                    buf += '&middot;';
                }
                buf += 'x' + this.sub(el.x);
            } else if (el.hasOwnProperty('sign')) {
                buf += signs[el.sign];
            } else if (el.hasOwnProperty('fraction')) {
                let fraction = el.fraction;
                if (last.hasOwnProperty('sign') && last.sign !== 0) {
                    // "- -1" or "+ -1"
                    if (fraction.s === -1) {
                        buf = buf.slice(0, buf.length - 2);
                        if (fraction.s === last.sign) {
                            // "- -1" => "+ 1"
                            buf += "+ ";

                        } else {
                            // "+ -1" => "-1"
                            buf += "- ";
                        }
                        fraction = fraction.neg();
                    }
                }
                buf += fraction.toFraction();
            } else if (el.hasOwnProperty('word')) {
                buf += el.word;
            } else {
                buf += '{???}';
            }
            last = el;
        });
        return <div dangerouslySetInnerHTML={{__html: buf}} ></div>
    }
}

export class PrintEquation {
    equation: Equation[] = [];

    constructor() {
        this.equation = [];
    }

    push = {
        x: this.pushX.bind(this),
        sign: this.pushSign.bind(this),
        plus: () => this.pushSign(1),
        minus: () => this.pushSign(-1),
        equal: () => this.pushSign(0),
        word: this.pushWord.bind(this),
        fraction: this.pushFraction.bind(this),
    };

    pushX(num) {
        this.equation.push({x: num});
    }
    
    pushSign(sign) {
        this.equation.push({sign});
    }

    pushWord(word) {
        this.equation.push({word});
    }
    
    pushFraction(fraction) {
        this.equation.push({fraction});
    }
}