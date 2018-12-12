'use strict';

function PropertiesModel(data, isCustom) {
    for(let key in data) {
        this[key] = data[key];
    }
    this.isCustom = isCustom;
    this.mergeToJson = mergeToJson;
}

function mergeToJson(jsonModel) {
    jsonModel.locales = jsonModel.locales || [];
    jsonModel.bundles = jsonModel.bundles || {};

    for(let bundleName in this.bundles) {
        let bundleObject = this.bundles[bundleName];
        for(let localeName in bundleObject) {
            if(jsonModel.locales.indexOf(localeName) < 0) {
                jsonModel.locales.push(localeName);
            }
        }
    }

    for(let bundleName in this.bundles) {
        let propertiesBundleObject = this.bundles[bundleName];
        let jsonBundleObject = jsonModel.bundles[bundleName];
        if(!jsonBundleObject) {
            jsonBundleObject = {};
            jsonModel.bundles[bundleName] = jsonBundleObject;
        }
        for(let localeName in propertiesBundleObject) {
            let propertiesLocaleObject = propertiesBundleObject[localeName];
            for(let labelKey in propertiesLocaleObject) {
                let labelValue = propertiesLocaleObject[labelKey];
                let jsonLabelObject = jsonBundleObject[labelKey];
                if(!jsonLabelObject) {
                    jsonLabelObject = {
                        description: '',
                        values: {}
                    };
                    jsonBundleObject[labelKey] = jsonLabelObject;
                }
                if(!jsonLabelObject.values[localeName]) {
                    jsonLabelObject.values[localeName] = {
                        validated: false
                    };
                }
                if(this.isCustom) {
                    // If custom value already exists in middleware JSON, don't overwrite it with properties value
                    if(!jsonLabelObject.values[localeName].customValue) {
                        jsonLabelObject.values[localeName].customValue = labelValue;
                    }
                } else {
                    jsonLabelObject.values[localeName].sfraValue = labelValue;
                }
            }
        }
    }
}

module.exports = PropertiesModel;