require.config({
    baseUrl: './build',
    paths: {
        react: '../node_modules/react/dist/react',
        'react-dom': '../node_modules/react-dom/dist/react-dom',
        fraction: '../node_modules/fraction.js/fraction',
        'snapsvg' : '../node_modules/snapsvg/dist/snap.svg',
        filesaver: '../node_modules/filesaver.js/filesaver'
    }
});

define(['app'], function (app) {});