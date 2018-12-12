'use strict';

const fileutils = require('../utils/fileutils');
const jsonHelper = require('../helpers/jsonHelper');
const excelHelper = require('../helpers/excelHelper');

module.exports = {
    process: process
};

function process(inputData) {
    console.log('\n================================================');
    console.log('Creating excel from JSON');
    let readExcelPromise;
    if(fileutils.existsSync(inputData.excelFile)) {
        readExcelPromise = excelHelper.loadTranslationsExcelFile(inputData.excelFile);
    } else {
        readExcelPromise = Promise.resolve({});
    }
    return readExcelPromise.then((excelContent) => {
        return jsonHelper.readJsonFile(inputData.jsonFile).then((jsonContent) => {
            return excelHelper.createTranslationsExcelFile(jsonContent, excelContent, inputData.excelFile).then(() => {
                console.log(`Stored excel data into ${inputData.excelFile}`);
                console.log('================================================\n');
            }).catch((err)=>{
                console.log(`Error: ${err}`);
            });
        });

    });
}