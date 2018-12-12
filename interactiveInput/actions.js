'use strict';

const inquirer = require('inquirer');
const config = require('../config/labelsConfig');
const fileutils = require('../utils/fileutils');

module.exports = {
    process: processInput
};

function processInput(action) {
    let questions = buildQuestions(action);
    return inquirer.prompt(questions).then((input) => {
        return {
            input: input
        };
    });
}

function checkCartridgePath(path) {
    return fileutils.existsSync(`${path}/cartridge`) ? true : 'Incorrect cartridge path';
}

function checkFilePath(path) {
    return fileutils.existsSync(path) ? true : 'Incorrect file path';
}

function buildQuestions(action) {
    let questions = [];
    if(action === 'properties2Json' || action === 'json2Properties') {
        questions.push({
                type: 'input',
                name: 'sfraCartridge',
                message: `SFRA cartridge path`,
                default: config.DEFAULT_SFRA_CARTRIDGE_LOCATION,
                validate: checkCartridgePath
            });
        questions.push({
            type: 'input', // TODO: Can be type path, and autocomplete be active?
            name: 'customCartridge',
            message: `Custom cartridge path`,
            default: config.DEFAULT_CUSTOM_CARTRIDGE_LOCATION,
            validate: checkCartridgePath
        });
    }

    let jsonFileQuestion = {
        type: 'input',
        name: 'jsonFile',
        message: `JSON file`,
        default: config.DEFAULT_JSON_FILE_LOCATION
    };
    if(action === 'json2Properties' || action === 'json2Excel') {
        jsonFileQuestion.validate = checkFilePath;
    }
    questions.push(jsonFileQuestion);

    if(action === 'excel2Json' || action === 'json2Excel') {
        let excelFileQuestion = {
            type: 'input',
            name: 'excelFile',
            message: `Excel file`,
            default: config.DEFAULT_EXCEL_FILE_LOCATION
        };
        if(action === 'excel2Json') {
            excelFileQuestion.validate = checkFilePath;
        }
        questions.push(excelFileQuestion);
    }
    return questions;
}
