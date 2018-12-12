'use strict';

const PropertiesModel = require('./PropertiesModel');

function JsonModel(data) {
    for(let key in data) {
        this[key] = data[key];
    }
    this.toPropertiesModel = toPropertiesModel;
    this.mergeCustomValues = mergeCustomValues;
}

module.exports = JsonModel;

function mergeCustomValues(origin) {
    origin.locales.forEach((locale) => {
        if(this.locales.indexOf(locale) < 0) {
            this.locales.push(locale);
        }
    });
    for(let bundleName in origin.bundles) {
        let originBundle = origin.bundles[bundleName];
        let bundle = this.bundles[bundleName];
        if(!bundle) {
            this.bundles[bundleName] = originBundle;
        } else {
            for(let labelKey in originBundle) {
                let originLabel = originBundle[labelKey];
                let label = bundle[labelKey];
                if(!label) {
                    bundle[labelKey] = originLabel;
                } else {
                    label.description = originLabel.description;
                    for(let localeName in originLabel.values) {
                        let originLocaleValue = originLabel.values[localeName];
                        let localeValue = label.values[localeName];
                        if(!localeValue) {
                            label.values[localeName] = originLocaleValue;
                        } else {
                            localeValue.customValue = originLocaleValue.customValue;
                            localeValue.validated = originLocaleValue.validated;
                        }
                    }
                }
            }
        }
    }
}

function toPropertiesModel() {
    let bundles = this.bundles;
    let properties = {bundles: {}};
    for(let bundleName in bundles) {
        let bundleContent = bundles[bundleName];
        let bundleProperties = properties.bundles[bundleName];
        if(!bundleProperties) {
            bundleProperties = {};
            properties.bundles[bundleName] = bundleProperties;
        }
        for(let labelKey in bundleContent) {
            let labelContent = bundleContent[labelKey].values;
            for(let localeName in labelContent) {
                let localeContent = labelContent[localeName];
                let localeProperties = bundleProperties[localeName];
                if(!localeProperties) {
                    localeProperties = {};
                    bundleProperties[localeName] = localeProperties;
                }
                if(localeContent.customValue !== '' && localeContent.customValue !== localeContent.sfraValue) {
                    localeProperties[labelKey] = localeContent.customValue;
                }
            }
        }
    }
    return new PropertiesModel(properties, true);
}