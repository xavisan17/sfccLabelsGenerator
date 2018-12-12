'use strict';

const propertiesHelper = require('../helpers/propertiesHelper');
const jsonHelper = require('../helpers/jsonHelper');
const JsonModel = require('../models/JsonModel');

module.exports = {
    process: process
};

function process(inputData) {
    console.log('\n================================================');
    console.log('Creating properties from JSON');
    return propertiesHelper.readPropertiesFromFolder(`${inputData.sfraCartridge}/cartridge/templates/resources`, false).then((sfraLabels) => {
        return propertiesHelper.readPropertiesFromFolder(`${inputData.customCartridge}/cartridge/templates/resources`, true).then((customLabels) => {
            return jsonHelper.readJsonFile(inputData.jsonFile).then((jsonContent) => {
                let propertiesContent = new JsonModel({});
                sfraLabels.mergeToJson(propertiesContent);
                customLabels.mergeToJson(propertiesContent);
                propertiesContent.mergeCustomValues(jsonContent);
                return propertiesHelper.writeProperties(propertiesContent, `${inputData.customCartridge}/cartridge/templates/resources`).then(() => {
                    console.log(`Stored properties data into folder ${inputData.customCartridge}`);
                    console.log('================================================\n');
                });
            });
        });
    }).catch((err)=>{
        console.log(`Error: ${err}`);
    });
}

