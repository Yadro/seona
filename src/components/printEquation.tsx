///<reference path="../../typings/main.d.ts"/>
///<reference path="../helper/fraction.js.d.ts"/>
import * as React from 'react';
import Fraction = require('fraction');
import {FractionType} from "../helper/fraction.js";

interface Equaltion {
    x?: number;
    word?: number;
    fraction?: FractionType;
}
export default class PrintEquationComp extends React.Component{
    equation: Equaltion[] = [
        {x: 1},
        {word: 0},

        {word: 1},
        {fraction: new Fraction(1,2)},
        {x: 1},
        {word: 1},
        {fraction: new Fraction(-1,2)},
        {x: 2},

        {word: -1},
        {fraction: new Fraction(1,2)},
        {x: 3},
        {word: -1},
        {fraction: new Fraction(-1,2)},
        {x: 4},
    ];
    
    constructor(props) {
        super(props);
    }

    sub(value) {
        return `<sub>${value}</sub>`;
    }

    render() {
        let buf = '';
        let last: Equaltion = {};
        this.equation.forEach((el: any, idx) => {
            if (el.hasOwnProperty('x')) {
                if (idx != 0) {
                    //buf += ' ';
                }
                if (last.hasOwnProperty('fraction')) {
                    buf += '&middot;';
                }
                buf += 'x' + this.sub(el.x);
            } else if (el.hasOwnProperty('word')) {
                switch (el.word) {
                    case 0:
                        buf += ' = ';
                        break;
                    case 1:
                        buf += ' + ';
                        break;
                    case -1:
                        buf += ' - ';
                        break;
                }
            } else if (el.hasOwnProperty('fraction')) {
                let fraction = el.fraction;
                if (last.hasOwnProperty('word') && last.word !== 0) {
                    // "- -1" or "+ -1"
                    if (fraction.s === -1) {
                        buf = buf.slice(0, buf.length - 2);
                        if (fraction.s === last.word) {
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
            } else {
                buf += '{???}';
            }
            last = el;
        });
        return <div dangerouslySetInnerHTML={{__html: buf}} ></div>
    }
    
}

class PrintEquation extends React.Component{
    equation = [
        {x: 1},
        {word: 0},
        {fraction: new Fraction(-1)},
        {x: 2},
        {word: -1},
        {fraction: new Fraction(-1)},
        {x: 3},
    ];

    pushX() {
        
    }
    
    pushWord() {
        
    }
    
    pushFraction() {
        
    }
}