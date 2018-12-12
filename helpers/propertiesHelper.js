'use strict';

const fileutils = require('../utils/fileutils');
const propertiesParser = require('properties-parser')
const PropertiesModel = require('../models/PropertiesModel');

const RECURSIVE = true;
const DIR_CALLBACK = undefined;

module.exports = {
    readPropertiesFromFolders,
    readPropertiesFromFolder,
    writeProperties
}

function readPropertiesFromFolders(folders, isCustom) {
    let outputObject = {bundles: {}};
    return readPropertiesRecursive(folders, outputObject.bundles).then(() => {
        return new PropertiesModel(outputObject, isCustom);
    });
}

function readPropertiesFromFolder(folder, isCustom) {
    let outputObject = {bundles: {}};
    return readProperties(folder, outputObject.bundles).then(() => {
        return new PropertiesModel(outputObject, isCustom);
    });
}

function readPropertiesRecursive(folders, outputObject) {
    if(folders.length > 0) {
        var folder = folders.shift();
        return readProperties(folder, outputObject).then(() => {
            return readPropertiesRecursive(folders, outputObject);
        }).catch((err)=>{
            console.log(`Error: ${err}`);
        });
    } else {
        return Promise.resolve(outputObject);
    }
}

function readProperties(folder, outputObject) {
    return fileutils.processFolderContents(folder, RECURSIVE, processPropertiesFile, DIR_CALLBACK, outputObject).
    then(() => {
        return outputObject;
    });
}

function processPropertiesFile(fileInfo, outputObject) {
    if(fileInfo.extension !== '.properties') {
        return Promise.resolve();
    }
    let parsedFileName = parseFileName(fileInfo.filename);
    let bundleObject = outputObject[parsedFileName.bundle];
    if(!bundleObject) {
        bundleObject = {};
        outputObject[parsedFileName.bundle] = bundleObject;
    }
    let localeObject = bundleObject[parsedFileName.locale];
    if(!localeObject) {
        localeObject = {};
        bundleObject[parsedFileName.locale] = localeObject;
    }
    return parsePropertiesFile(fileInfo.fullPath).then((data) => {
        for(let key in data) {
            localeObject[key] = data[key];
        };
        return outputObject;
    });
}

function parsePropertiesFile(propertiesFile) {
	return new Promise((fulfill, reject) => {
		propertiesParser.read(propertiesFile, ((err, data) => {
	        if (err) {
                console.log(`Error: ${err}`);
	            reject(err);
	        } else {
	        	fulfill(data);
	        }
		}));
	});
}

function parseFileName(filename) {
    let filenameNoExt = filename.split('.').slice(0, -1).join('.');
    let nameComponents = filenameNoExt.split('_');
    if(nameComponents.length >= 2) {
        return {
            bundle: nameComponents[0],
            locale: nameComponents.slice(1).join('_')
        }
    } else {
        return {
            bundle: filenameNoExt,
            locale: 'default'
        };
    }
}

function createFileName(bundleName, localeName) {
    let propertiesFileName = bundleName;
    if(localeName !== 'default') {
        propertiesFileName += `_${localeName}`;
    }
    propertiesFileName += '.properties';
    return propertiesFileName;
}

function writeProperties(jsonContent, folder) {
    let properties = jsonContent.toPropertiesModel();

    let allPropertiesPromises = [];
    for(let bundleName in properties.bundles) {
        let bundleProperties = properties.bundles[bundleName];
        for(let localeName in bundleProperties) {
            let localeProperties = bundleProperties[localeName];
            let localeContent = '';
            for(let labelKey in localeProperties) {
                localeContent += `${labelKey}=${localeProperties[labelKey]}\n`;
            }
            if(localeContent.length > 0) {
                let propertiesFileName = createFileName(bundleName, localeName);
                allPropertiesPromises.push(fileutils.writeFile(`${folder}/${propertiesFileName}`, localeContent));
            }
        }
    }
    return Promise.all(allPropertiesPromises);
}