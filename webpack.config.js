const path = require('path');

module.exports = {
    entry: './componentDragLib/componentDragLib.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'component-drag.min.js',
        library: {
            name: "componentDragLib",
            type: "umd"
        },
    },
    watch: true,
    mode: 'production',
};