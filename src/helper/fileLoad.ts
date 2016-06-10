import * as saveAs from '../../node_modules/filesaver.js/filesaver';

export function downloadFile(json) {
    let blob = new Blob([json], {type: "application/json;charset=utf-8"});
    saveAs(blob, "export.json");
}

export function uploadFile(event, callback) {
    let file = event.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = (e) => {
        const res = JSON.parse(e.target.result);
        console.log(res);
    };
    reader.readAsText(file);
}
