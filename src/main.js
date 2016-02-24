require.config({
    baseUrl: './build',
    paths: {
        react: '../node_modules/react/dist/react',
        'react-dom': '../node_modules/react-dom/dist/react-dom'
    }
});

define(['app'], function (app) {});