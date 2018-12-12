'use strict';

const inquirer = require('inquirer');
const actions = require('./actions');

module.exports = {
    process: processInput
};

function processInput() {
    let questions =  [
        {
            type: 'list',
            name: 'action',
            message: 'What do you want to do?',
            choices: [
                {name: 'Read properties files and generate JSON', value: 'properties2Json'},
                {name: 'Read JSON file and generate excel', value: 'json2Excel'},
                {name: 'Read excel file and generate JSON', value: 'excel2Json'},
                {name: 'Read JSON file and generate properties', value: 'json2Properties'},
                new inquirer.Separator(),
                {name: 'Exit', value: 'exit'}
            ]
        }
    ];
    let confirmQuestion = [
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Are you sure you want to proceed?'
        }
    ];
    var processedInput = {};
    return inquirer.prompt(questions).then((input) => {
        if(input.action === 'exit') {
            return Promise.reject();
        }
        Object.assign(processedInput, input);
        return actions.process(input.action);
    }).then((data) => {
        Object.assign(processedInput, {data: data.input});
        return inquirer.prompt(confirmQuestion);
    }).then((input) => {
        if(input.confirm) {
            return processedInput;
        }
    });
}

