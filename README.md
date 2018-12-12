# sfccLabelsGenerator
Transform SFCC labels in properties files to be able to edit them in a user-friendly excel file.
Transform the excel file back to properties files.

## Install

Run `npm install`

## Execute

Run `node app.js`

## Usage

When this tool is executed it displays an interactive menu with this options:

### Read properties files and generate JSON
Reads properties files from SFRA cartridge and from your custom cartridge and creates a JSON file with the data. When the same label exists in the same bundle on both cartridges, both values are kept in json as sfraValue and customValue

The parameters you have to enter for this task are:
- SFRA cartridge path
- Custom cartridge path
- Result JSON file path

If the JSON file already exists, existing custom values are not overwriten by the ones got from the properties files

Apart from labels values, this file also contains a description field for each label and a 'validated' flag for each translation.

### Read JSON file and generate excel
Reads JSON file with translation data and converts it to a user-friendly excel file. 

The parameters you have to enter for this task are:
- JSON file path
- Result excel file path

If the excel file already exists, existing custom values are not overwriten by the ones got from the JSON file

The excel file contains a sheet for each bundle, three rows for each label (SFRA value, Custom value, Valideted) and a column for each locale

### Read excel file and generate JSON

Reads excel file with translation data and converts it to a JSON file. 

The parameters you have to enter for this task are:

- Excel file path
- Result JSON file path

### Read JSON file and generate properties
Reads JSON file and converts it to properties files within the custom cartridge. Only custom values that differ from SFRA values are included in the properties files.

The parameters you have to enter for this task are:
- SFRA cartridge path
- Custom cartridge path
- JSON file path

If the JSON file already exists, existing custom values are not overwriten by the ones got from the properties files

Apart from labels values, this file also contains a description field for each label and a 'validated' flag for each translation.


The meaning of generating the JSON intermediate file is to have all the labels information plus description and validation status for each label in a text file that can be pushed to a GIT repository and compored with previous versions, since this comparison is not possible with an excel file.