import {MatrixM} from "./matrix";

interface StepInfo {
    comment?;
    xValues?: number[][];
    matrix?: MatrixM;
    select?;
}

class StepManager {
    steps: StepInfo[];

    constructor() {
        this.steps = [];
    }
    
    push(params: StepInfo) {
        this.steps.push(params);
    }
    
    back() {
        this.steps.length += 1;
    }
    
    forEach(func) {
        this.steps.forEach(func);
    }
}