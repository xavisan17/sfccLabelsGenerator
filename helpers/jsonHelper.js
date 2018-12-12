'use strict';

const jsonfile = require('jsonfile');
const JsonModel = require('../models/JsonModel');
const fileutils = require('../utils/fileutils');

module.exports = {
    readJsonFile,
    writeJsonFile
}

function readJsonFile(filename) {
    if(fileutils.existsSync(filename)) {
        return new Promise((fulfill, reject) => {
            jsonfile.readFile(filename, (err, obj) => {
                if(err) {
                    reject(err);
                } else {
                    fulfill(new JsonModel(obj));
                }
            });
        });
    } else {
        return Promise.resolve(new JsonModel({}));
    }
}

function writeJsonFile(filename, jsonModel) {
    return new Promise((fulfill, reject) => {
        jsonfile.writeFile(filename, jsonModel, {spaces: 4}, (err, obj) => {
            if(err) {
                reject(err);
            } else {
                fulfill(obj);
            }
        });
    });
}