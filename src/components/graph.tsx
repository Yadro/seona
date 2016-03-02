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
    [0,1,3],
    [1,2,2],
    [7,2,10],
    [1,1,1],
    [1,1,10],
];

export class Graph extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        let graph = new GraphC('#svg', [20, 500], 300, 10);
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

class GraphC {
    paper;
    start;
    angle;
    size;
    count;

    constructor(id, start, size, count) {
        this.paper = Snap(id || 'svg');
        this.start = start || [0, 0];
        this.size = size || 100;
        this.angle = size / count;
        this.count = count;

        this.drawAxis();
        this.drawAxis(true);

        this.drawGraphics(test);
    }

    drawAxis(orientVert?) {
        let paper = this.paper,
            size = this.size,
            count = this.count,
            angle = this.angle;

        let startX = this.start[0] + .5,
            startY = this.start[1] + .5,
            endX, endY;

        if (orientVert) {
            angle *= -1;
            endY = startY - size;
            endX = startX;
        } else {
            endX = startX + size;
            endY = startY;
        }


        let line = paper.line(startX, startY, endX, endY);
        line.attr(lineStyle);

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
            let coord = this.getCoords(equation);
            let sign = 1;
            coord = coord.map((e, i) => {
                if (i%2) sign = -1;
                else sign = 1;
                return start[i % 2] + e * angle * sign;
            });

            this.paper.line(coord[0], coord[1], coord[2], coord[3])
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

        let a = equation[0],
            b = equation[1],
            c = equation[2];

        if (a == 0 && b == 0) {
            return [0, 0, 0, 0];
        }
        if (!a) {
            return [
                0, c / b,
                1, c / b
            ];
        }
        if (!b) {
            return [
                c / a, 0,
                c / a, 1,
            ];
        }

        return [
            c / a, 0, // = x1, x2 = 0
            0, c / b    // = x2, x1 = 0
        ];
    }

}