'use strict';

const xl = require('excel4node');
const X = require('xlsx');
const fs = require('fs');
const ExcelModel = require('../models/ExcelModel');

module.exports = {
    loadTranslationsExcelFile,
    createTranslationsExcelFile,
}

const CONFIG_VALUES = {
    FIRST_TRANSLATION_TABLE_ROW: 1,
    FIRST_TRANSLATION_ENTRY_ROW: 2,
    FIRST_BCC_TABLE_ROW: 2,
    FIRST_BCC_ENTRY_ROW: 3
};

let CELL_STYLES = {
};

function loadTranslationsExcelFile(excelFile) {
    let workbook = loadExcelFile(excelFile);
    return new Promise((fulfill) => {
        fulfill(workbook != null ? workbook.toJsonModel() : null);
    });
}

function createTranslationsExcelFile(jsonModel, currentContent, outputFile) {
    let wb = new xl.Workbook();
    createStyles(wb);
    let allSheetsPromises = [];

    for(let bundleName in jsonModel.bundles) {
        allSheetsPromises.push(generateTranslationsSheet(wb, bundleName, jsonModel.bundles[bundleName], jsonModel.locales));
    }
    return Promise.all(allSheetsPromises).then(()=>{
        wb.write(outputFile);
    });

    function generateTranslationsSheet(wb, bundleName, bundleLabels, locales) {
        let rowIndex = 0;
        let ws = wb.addWorksheet(bundleName);
        generateHeaderRow(ws);
        for(let labelKey in bundleLabels) {
            let labelDescription = bundleLabels[labelKey].description;
            let labelValues = bundleLabels[labelKey].values;
            generateEntryRow(ws, labelKey, labelDescription, labelValues, rowIndex);
            rowIndex += 3;
        }
        ws.row(CONFIG_VALUES.FIRST_TRANSLATION_TABLE_ROW).freeze();
        
        function generateHeaderRow(ws) {
            let colIndex = 1;
            ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_TABLE_ROW, 1, CONFIG_VALUES.FIRST_TRANSLATION_TABLE_ROW, locales.length + 3, false).style(CELL_STYLES.HEADER_CELL);
            ws.column(colIndex).setWidth(25);
            ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_TABLE_ROW, colIndex++).string('KEY');
            ws.column(colIndex).setWidth(50);
            ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_TABLE_ROW, colIndex++).string('DESCRIPTION');
            ws.column(colIndex).setWidth(15);
            ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_TABLE_ROW, colIndex++).string('DATA');
            locales.forEach((language) => {
                ws.column(colIndex).setWidth(50);
                ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_TABLE_ROW, colIndex++).string(language);
            });
        }
        
        function generateEntryRow(ws, key, description, values, entryIndex) {
            let colIndex = 1;
            ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex, 2, CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex + 2, locales.length + 3, false).style(CELL_STYLES.EDITABLE_CELL);
            ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex, 4, CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex, locales.length + 3, false).style(CELL_STYLES.READONLY_CELL);
            ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex, 1, CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex + 2, 1, false).style(CELL_STYLES.LABEL_KEY_CELL);
            ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex, 3, CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex + 2, 3, false).style(CELL_STYLES.LABEL_DATA_KEY_CELL);
            ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex, colIndex, CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex + 2, colIndex++, true).string(key);
            ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex, colIndex, CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex + 2, colIndex++, true).string(description);
            ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex, colIndex).string('SFRA value');
            ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex+1, colIndex).string('Custom value');
            ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex+2, colIndex++).string('Validated');
            locales.forEach((language) => {
                ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex, colIndex).string((values[language] && values[language].sfraValue) || '');
                ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex+1, colIndex).string((values[language] && values[language].customValue) || '');
                ws.cell(CONFIG_VALUES.FIRST_TRANSLATION_ENTRY_ROW + entryIndex+2, colIndex++).bool((values[language] && values[language].validated) || false);
            });
        }
    }
}

function loadExcelFile(filename) {
    let result = {bundles: {}};
    if(fs.existsSync(filename)) {
        try {
            let wb = X.readFile(filename, {});
            if(wb) {
                let sheetNames = wb.SheetNames;
                for(let index = 0; index < sheetNames.length; index++) {
                    let sheetName = sheetNames[index];
                    let ws = wb.Sheets[sheetName];
                    result.bundles[sheetName] = X.utils.sheet_to_json(ws, {});
                }
            } else {
                console.log('Couldn\'t read the excel file');
            }
        } catch(err) {
            console.log('Couldn\'t read the excel file');
        }
    }
    return new ExcelModel(result);
}

function createStyles(wb) {
    CELL_STYLES.HEADER_CELL = wb.createStyle({
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font: {
            color: '#000000',
            size: 10
        },
        border: {
            left: {
                style: 'thin',
                color: '#000000'
            },
            right: {
                style: 'thin',
                color: '#000000'
            },
            top: {
                style: 'thin',
                color: '#000000'
            },
            bottom: {
                style: 'thin',
                color: '#000000'
            }
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#ff8000'
        }
    });
    CELL_STYLES.EDITABLE_CELL = wb.createStyle({
        alignment: {
            horizontal: 'left',
            vertical: 'center',
            wrapText: true
        },
        font: {
            color: '#000000',
            size: 10
        },
        border: {
            left: {
                style: 'thin',
                color: '#000000'
            },
            right: {
                style: 'thin',
                color: '#000000'
            },
            top: {
                style: 'thin',
                color: '#000000'
            },
            bottom: {
                style: 'thin',
                color: '#000000'
            }
        }
    });
    CELL_STYLES.READONLY_CELL = wb.createStyle({
        alignment: {
            horizontal: 'left',
            vertical: 'center',
            wrapText: true
        },
        font: {
            color: '#000000',
            size: 10
        },
        border: {
            left: {
                style: 'thin',
                color: '#000000'
            },
            right: {
                style: 'thin',
                color: '#000000'
            },
            top: {
                style: 'thin',
                color: '#000000'
            },
            bottom: {
                style: 'thin',
                color: '#000000'
            }
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#c0c0c0'
        }
    });
    CELL_STYLES.LABEL_KEY_CELL = wb.createStyle({
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font: {
            color: '#000000',
            size: 10
        },
        border: {
            left: {
                style: 'thin',
                color: '#000000'
            },
            right: {
                style: 'thin',
                color: '#000000'
            },
            top: {
                style: 'thin',
                color: '#000000'
            },
            bottom: {
                style: 'thin',
                color: '#000000'
            }
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#ff8000'
        }
    });
    CELL_STYLES.LABEL_DATA_KEY_CELL = wb.createStyle({
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font: {
            color: '#000000',
            size: 10
        },
        border: {
            left: {
                style: 'thin',
                color: '#000000'
            },
            right: {
                style: 'thin',
                color: '#000000'
            },
            top: {
                style: 'thin',
                color: '#000000'
            },
            bottom: {
                style: 'thin',
                color: '#000000'
            }
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#ffb266'
        }
    });
    CELL_STYLES.NUMBER_CELL = {
        common: wb.createStyle({
            _numberFormat: '#.##0,00 €; #.##0,00 €; -',
            numberFormat: '#,##0.00 €; -#,##0.00 €; -',
            alignment: {
                horizontal: 'right',
            },
        }),
        incomming: wb.createStyle({
            font: {
                color: '#0000ff',
            }
        }),
        expense: wb.createStyle({
            font: {
                color: '#ff0000',
            }
        }),
    };
    CELL_STYLES.SECTION_TITLE_CELL = wb.createStyle({
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font: {
            color: '#000000',
            size: 12,
            bold: true,
            underline: true
        },
        border: {
            left: {
                style: 'thick',
                color: '#000000'
            },
            right: {
                style: 'thick',
                color: '#000000'
            },
            top: {
                style: 'thick',
                color: '#000000'
            },
            bottom: {
                style: 'thick',
                color: '#000000'
            }
        }
    });
    CELL_STYLES.SUBSECTION_TITLE_CELL = wb.createStyle({
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font: {
            color: '#000000',
            size: 10,
            bold: true
        },
        border: {
            left: {
                style: 'thick',
                color: '#000000'
            },
            right: {
                style: 'thick',
                color: '#000000'
            },
            top: {
                style: 'thick',
                color: '#000000'
            },
            bottom: {
                style: 'thick',
                color: '#000000'
            }
        }
    });
}