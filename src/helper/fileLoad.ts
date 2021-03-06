import * as saveAs from 'filesaver';

export function downloadFile(json) {
    let blob = new Blob([json], {type: "application/json;charset=utf-8"});
    saveAs(blob, 'simplex-' + Date.now() + '.json');
}

export function uploadFile(callback, event) {
    let file = event.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = (e) => {
        const res = JSON.parse(e.target.result);
        callback(res);
    };
    reader.readAsText(file);
}
