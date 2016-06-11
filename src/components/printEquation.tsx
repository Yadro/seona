///<reference path="../../typings/index.d.ts"/>
///<reference path="../helper/fraction.js.d.ts"/>
import * as React from 'react';
import Fraction = require('fraction');
import {FractionType} from "../helper/fraction.js";
import {isArray} from '../helper/tools';

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
    4: ' &rarr; '
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
        {fraction: new Fraction(1, 2)},
        {x: 1},
        {sign: 1},
        {fraction: new Fraction(-1, 2)},
        {x: 2},

        {sign: -1},
        {fraction: new Fraction(1, 2)},
        {x: 3},
        {sign: -1},
        {fraction: new Fraction(-1, 2)},
        {x: 4},

        [
            {sign: 1},
            {fraction: new Fraction(5)},
            {sign: 2},
            {word: '('},
            {fraction: new Fraction(-1, 2)},
            {x: 4},
            {sign: 1},
            {fraction: new Fraction(10)},
            {word: ')'},
        ],
    ];

    constructor(props: PrintEquationCompP) {
        super(props);
        this.equation = props.equation ? props.equation.equation : this.equation;
    }

    sub(value) {
        return `<sub>${value}</sub>`;
    }

    parseFunc(el: Equation, idx, buf, last) {
        if (el.hasOwnProperty('x')) {
            if (last.hasOwnProperty('fraction')) {
                buf += '&middot;';
            }
            buf += 'x' + this.sub(el.x);
        } else if (el.hasOwnProperty('sign')) {
            buf += signs[el.sign];
        } else if (el.hasOwnProperty('fraction')) {
            let fraction = el.fraction;
            if (last.hasOwnProperty('sign') && last.sign !== 0 && last.sign !== 2) {
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
            } else if (last.hasOwnProperty('word') && last.word === ')' && fraction.s === -1) {
                // ") -1" => ") - 1"
                buf += " - ";
                fraction = fraction.neg();
            }
            buf += fraction.toFraction();
        } else if (el.hasOwnProperty('word')) {
            buf += el.word;
        } else {
            buf += '{???}';
        }
        return buf;
    }

    parse(arr: Equation[] | Equation[][]) {
        let buf = '';
        let last: Equation = {};
        arr.forEach((el, idx) => {
            if (isArray(el)) {
                buf += this.parse(el);
            } else {
                buf = this.parseFunc(el, idx, buf, last);
            }
            last = el;
        });
        return buf;
    }

    render() {
        let res = this.parse(this.equation);
        return <div dangerouslySetInnerHTML={{__html: res}}></div>
    }
}

export class PrintEquation {
    equation: Equation[] = [];

    constructor() {
        this.equation = [];
    }

    push = {
        x: (num) => {
            this.pushX(num);
            return this.push;
        },
        sign: (sign) => {
            this.pushSign(sign);
            return this.push;
        },
        plus: () => {
            this.pushSign(1);
            return this.push;
        },
        minus: () => {
            this.pushSign(-1);
            return this.push;
        },
        mul: () => {
            this.pushSign(2);
            return this.push;
        },
        equal: () => {
            this.pushSign(0);
            return this.push;
        },
        word: (word) => {
            this.pushWord(word);
            return this.push;
        },
        fraction: (fraction) => {
            this.pushFraction(fraction);
            return this.push;
        },
        arr: (arr) => {
            if (arr.hasOwnProperty('equation')) {
                this.equation.push(arr.equation);
            } else {
                this.equation.push(arr);
            }
            return this.push;
        },
        arrowMin: () => {
            this.push.sign(4).word('min');
            return this.push;
        }
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
        if (typeof fraction === "number") {
            console.log('this is not fraction');
            fraction = new Fraction(fraction);
        }
        this.equation.push({fraction});
    }
}