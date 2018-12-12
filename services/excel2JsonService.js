'use strict';

const fileutils = require('../utils/fileutils');
const jsonHelper = require('../helpers/jsonHelper');
const excelHelper = require('../helpers/excelHelper');

module.exports = {
    process: process
};

function process(inputData) {
    console.log('\n================================================');
    console.log('Creating JSON from excel');
    let readJsonPromise;
    if(fileutils.existsSync(inputData.jsonFile)) {
        readJsonPromise = jsonHelper.readJsonFile(inputData.jsonFile);
    } else {
        readJsonPromise = Promise.resolve();
    }
    return readJsonPromise.then((jsonContent) => {
        return excelHelper.loadTranslationsExcelFile(inputData.excelFile).then((excelContent) => {
            if(jsonContent) {
                jsonContent.mergeCustomValues(excelContent);
            } else {
                jsonContent = excelContent;
            }
            jsonHelper.writeJsonFile(inputData.jsonFile, jsonContent);
            console.log(`Stored JSON data into ${inputData.jsonFile}`);
            console.log('================================================\n');
        });
    });
}