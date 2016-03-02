///<reference path="../../typings/react/react.d.ts"/>



import * as React from 'react';
import * as Snap from '../../node_modules/snapsvg/dist/snap.svg';
import {Snap} from '../../typings/snapsvg/snapsvg.d.ts';
import line = d3.svg.line;

let lineStyle = {
    stroke: '#000'
};

let test = [
    [0,0,0],
    [1,2,0],
    [1,1,1],
    [1,1,10],
];

export class Graph extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        let paper = Snap('#svg');

        let start = [20, 500];
        drawAxis(paper, start, 300, false, 10);
        drawAxis(paper, start, -300, true, 10);

        let angle = 300 / 10;

        drawGraphics(paper, start, angle, test);
    }

    render() {
        return (
            <div>
                <h1>Snap svg</h1>
                <svg id="svg" width="800px" height="600px"/>
            </div>
        )
    }
}


function drawAxis(paper, start, size, orientVert, count) {
    let startX = start[0] + .5,
        startY = start[1] + .5,
        endX, endY;
    if (orientVert) {
        endY = startY + size;
        endX = startX;
    } else {
        endX = startX + size;
        endY = startY;
    }
    endX += .5;
    endY += .5;

    let line = paper.line(startX, startY, endX, endY);
    line.attr(lineStyle);

    let angle = size / count;

    for (let i = 0; i < count; i++) {
        let localX = orientVert ? startX : startX + i * angle;
        let localY = orientVert ? startY + i * angle : startY;

        if (orientVert) {
            if (i != 0) {
                paper.text(localX - 15, localY + 5, ""+i);
            }
            paper.line(localX, localY, localX - 5, localY)
                .attr(lineStyle);
        } else {
            paper.text(localX - 5, localY + 20, ""+i);
            paper.line(localX, localY, localX, localY + 5)
                .attr(lineStyle);
        }
    }
}

function drawGraphics(paper, start: number[], angle, graph: number[][]) {
    graph.forEach(equation => {
        let coord = getCoords(equation);

        paper.line(start[0] + coord[0] * angle, start[1], start[0], start[1] - coord[1] * angle)
            .attr(lineStyle);

    })
}

/**
 * Поиск точек пересечения
 * @param equation
 *
 * @example
 * ax_1 + bx_2 = c
 * x_1 = (-bx_2 + c) / a
 * x_2 = (-ax_1 + c) / b
 */
function getCoords(equation: number[]) {
    if (equation.length < 3) return;

    /*let result = [];
    result.push([(-equation[1] + equation[2]) / equation[0], 0]);
    result.push([0, (-equation[0] + equation[2]) / equation[1]]);
    return result;*/
    let a = equation[0],
        b = equation[1],
        c = equation[2];

    /*if (a ==0 || b == 0) {
        return [
            (-b + c) / a, 1,
            1, (-a + c) / b
        ];
    }

    return [
        c / a, 0, // = x1, x2 = 0
        0, c / b    // = x2, x1 = 0
    ];*/

    return [
        c / a, // = x1, x2 = 0
        c / b    // = x2, x1 = 0
    ];
}

class GraphC {
    paper;
    start;
    angle;

    constructor(id) {
        this.paper = Snap(id);
    }

    drawAxis(start, size, orientVert, count) {
        let paper = this.paper;
        let startX = this.start[0] + .5,
            startY = this.start[1],
            endX, endY;

        if (orientVert) {
            endY = startY + size;
            endX = startX;
        } else {
            endX = startX + size;
            endY = startY;
        }
        endX += .5;


        let line = paper.line(startX, startY, endX, endY);
        line.attr(lineStyle);

        let angle = this.angle;

        for (let i = 0; i < count; i++) {
            let localX = orientVert ? startX : startX + i * angle;
            let localY = orientVert ? startY + i * angle : startY;

            if (orientVert) {
                if (i != 0) {
                    paper.text(localX - 15, localY + 5, "" + i);
                }
                paper.line(localX, localY, localX - 5, localY)
                    .attr(lineStyle);
            } else {
                paper.text(localX - 5, localY + 20, "" + i);
                paper.line(localX, localY, localX, localY + 5)
                    .attr(lineStyle);
            }
        }
    }

    drawGraphics(graph: number[][]) {
        let start = this.start,
            angle = this.angle;



        graph.forEach(equation => {
            let coord = getCoords(equation);
            let sign = 1;
            coord = coord.map((e, i) => {
                if (i == 3) sign = -1;
                return start[i % 2] + e * angle * sign;
            });


            this.paper.line(start[0] + coord[0] * angle, start[1], start[0], start[1] - coord[1] * angle)
                .attr(lineStyle);
        })
    }

        /**
     * Поиск точек пересечения
     * @param equation
     *
     * @example
     * ax_1 + bx_2 = c
     * x_1 = (-bx_2 + c) / a
     * x_2 = (-ax_1 + c) / b
     */
    getCoords(equation: number[]) {
        if (equation.length < 3) return;

        /*let result = [];
         result.push([(-equation[1] + equation[2]) / equation[0], 0]);
         result.push([0, (-equation[0] + equation[2]) / equation[1]]);
         return result;*/
        let a = equation[0],
            b = equation[1],
            c = equation[2];

        if (a == 0 || b == 0) {
            return [
                (-b + c) / a, 1,
                1, (-a + c) / b
            ];
        }

        return [
            c / a, 0, // = x1, x2 = 0
            0, c / b    // = x2, x1 = 0
        ];
    }

}