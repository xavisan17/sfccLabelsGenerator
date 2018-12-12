'use strict';

const fs = require('fs.extra');
const path = require('path');

module.exports = {
	processFolderContents,
	removeFolder,
	createFolder,
	removeFolderSync,
	createFolderSync,
	copyRecursive,
	existsSync,
	ensureFilePath,
	writeFile
};

function processFolderContents(folder, recursive, fileCallback, dirCallback, callbackInfo) {
	return getFolderContents(folder, recursive, fileCallback, dirCallback, callbackInfo, '');
}


function getFolderContents(folder, recursive, fileCallback, dirCallback, callbackInfo, relativePath) {
    let readPromise = new Promise((fulfill, reject) => {
	    fs.readdir(folder, function(err, list) {
	        if (err) {
	        	console.log(err);
	            reject(err);
	        } else {
	        	fulfill(list);
	        }
	    });
    });

    return readPromise.then((entries) => {
    	return serialProcessEntries(folder, entries, recursive, fileCallback, dirCallback, callbackInfo, relativePath);
    });
}

function serialProcessEntries(folder, entries, recursive, fileCallback, dirCallback, callbackInfo, relativePath) {
	if(entries.length > 0) {
		let entry = entries.shift();
		return processEntry(folder, entry, recursive, fileCallback, dirCallback, callbackInfo, relativePath).
		then(() => {
			return serialProcessEntries(folder, entries, recursive, fileCallback, dirCallback, callbackInfo, relativePath);
		});
	} else {
		return Promise.resolve();
	}
}

function processEntry(folder, entry, recursive, fileCallback, dirCallback, callbackInfo, relativePath) {
	let entryName = entry;
	var newRelativePath = relativePath ? relativePath + '/' + entryName : entryName;
	entry = folder + '/' + entry;
	let file = path.resolve(entry);
    return new Promise((fulfill, reject) => {
    	fs.stat(file, function(err, stat) {
    		if(!stat) {
				console.log(`No stat for entry ${entry}`);
    			reject();
    		} else if (stat.isDirectory()) {
	    		if(recursive) {
	    			if(dirCallback) {
	    				dirCallback({
	    					path: folder,
							relativePath: newRelativePath,
	    					foldername: entryName
	    				}, callbackInfo);
	    			}
	    			fulfill(getFolderContents(entry, recursive, fileCallback, dirCallback, callbackInfo, newRelativePath));
	    		} else {
					fulfill();
	    		}
            } else {
                if(fileCallback) {
					fulfill(fileCallback(
						{
							relativePath: newRelativePath,
							fullPath: file,
							filename: entryName,
							extension: path.extname(file).toLowerCase()
						}, callbackInfo	
                	));
                } else {
            		fulfill();
            	}
            }
        });
    });
};

function removeFolder(folder) {
	return new Promise((fulfill, reject) => {
		fs.rmrf(folder, (err) =>  {
	        if (err) {
	        	console.log(err);
	            reject();
	        } else {
	        	fulfill();
	        }
		});
	});
}

function removeFolderSync(folder) {
	fs.rmrfSync(folder);
}

function createFolder(folder) {
	return new Promise((fulfill, reject) => {
		fs.mkdirp(folder, (err) =>  {
	        if (err) {
	        	console.log(err);
	            reject();
	        } else {
	        	fulfill();
	        }
		});
	});
}

function createFolderSync(folder) {
	fs.mkdirpSync(folder);
}

function copyRecursive(origin, dest) {
	return new Promise((fulfill, reject) => {
		fs.copyRecursive(origin, dest, {replace: true}, (err) =>  {
	        if (err) {
	        	console.log(err);
	            reject();
	        } else {
	        	fulfill();
	        }
		});
	});
}

function existsSync(path) {
	return fs.existsSync(path);
}

function ensureFilePath(file) {
    if(!fs.existsSync(file)) {
        let path = file.split('/');
        if(path.length > 1) {
            path.pop();
            path.reduce((subpath, folder) => {
                    subpath += folder + '/';
                    if (!fs.existsSync(subpath)){
                        fs.mkdirSync(subpath);
                    }
                    return subpath;
                }, '');
        }
    }
}

function writeFile(file, content) {
	return new Promise((fulfill, reject) => {
		fs.writeFile(file, content, (err) =>  {
	        if (err) {
	        	console.log(err);
	            reject();
	        } else {
	        	fulfill();
	        }
		});
	});
}

