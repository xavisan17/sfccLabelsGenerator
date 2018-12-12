'use strict';

const propertiesHelper = require('../helpers/propertiesHelper');
const jsonHelper = require('../helpers/jsonHelper');
const fileutils = require('../utils/fileutils');

module.exports = {
    process: process
};

function process(inputData) {
    console.log('\n================================================');
    console.log('Creating JSON from properties');
    return jsonHelper.readJsonFile(inputData.jsonFile).then((jsonContent) => {
        return propertiesHelper.readPropertiesFromFolder(`${inputData.sfraCartridge}/cartridge/templates/resources`, false).then((sfraLabels) => {
            return propertiesHelper.readPropertiesFromFolder(`${inputData.customCartridge}/cartridge/templates/resources`, true).then((customLabels) => {
                sfraLabels.mergeToJson(jsonContent);
                customLabels.mergeToJson(jsonContent);
                return jsonHelper.writeJsonFile(inputData.jsonFile, jsonContent).then(() => {
                    console.log(`Stored JSON data into ${inputData.jsonFile}`);
                    console.log('================================================\n');
                    return jsonContent;
                });
            });
        });
    }).catch((err)=>{
        console.log(`Error: ${err}`);
    });
}