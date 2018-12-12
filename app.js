'use strict';

const interactiveInput = require('./interactiveInput/main');

processInteractiveInput();

function processInteractiveInput() {
    return interactiveInput.process().then((inputData) => {
        if (!inputData) {
            console.log('Action cancelled');
            return false;
        } else {
            return require(`./services/${inputData.action}Service`).process(inputData.data);
        }
    }).then(() => {
        return processInteractiveInput();
    }).catch((e) => {
        if(e) {
            console.log(e);
            process.exit(1);
        }
        process.exit(0);
    });
}
