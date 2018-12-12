'use strict';

const JsonModel = require('./JsonModel');

function ExcelModel(data) {
    for(let key in data) {
        this[key] = data[key];
    }
    this.toJsonModel = toJsonModel;
}

function toJsonModel() {
    let locales = [];
    let bundles = {};
    let bundleResult, labelResult, localeResult;
    if(this.bundles) {
        for(let bundleName in this.bundles) {
            let sheet = this.bundles[bundleName];
            let labelKey, labelDescription, labelValues, labelData;
            bundleResult = {};
            bundles[bundleName] = bundleResult;
            sheet.forEach((row) => {
                labelValues = {};
                for(let fieldName in row) {
                    switch(fieldName) {
                        case 'KEY':
                            labelKey = row[fieldName];
                            break;
                        case 'DESCRIPTION':
                            labelDescription = row[fieldName];
                            break;
                        case 'DATA':
                            labelData = row[fieldName];
                            break;
                        default:
                            labelValues[fieldName] = row[fieldName];
                            break;
                    }
                }
                labelResult = bundleResult[labelKey];
                if(!labelResult) {
                    labelResult = {
                        description: labelDescription,
                        values: {}
                    };
                    bundleResult[labelKey] = labelResult;
                }
                for(let localeName in labelValues) {
                    if(locales.indexOf(localeName) < 0) {
                        locales.push(localeName);
                    }
                    localeResult = labelResult.values[localeName];
                    if(!localeResult) {
                        localeResult = {};
                        labelResult.values[localeName] = localeResult;
                    }
                    switch(labelData) {
                        case 'SFRA value':
                            localeResult.sfraValue = labelValues[localeName];
                            break;
                        case 'Custom value':
                            localeResult.customValue = labelValues[localeName];
                            break;
                        case 'Validated':
                            localeResult.validated = (labelValues[localeName] && labelValues[localeName].toUpperCase() === 'TRUE');
                            break;
                    }
                }
            });
        }
    }
    return new JsonModel({
        locales,
        bundles
    });
}

module.exports = ExcelModel;