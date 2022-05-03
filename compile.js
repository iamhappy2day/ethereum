const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname, 'build');
console.log("buildPath", buildPath)
fs.removeSync(buildPath); // удаляет папку и все что в ней

const crowdfundingPath = path.resolve(__dirname, 'contracts', 'Crowdfunding.sol'); // путь к файлу контракта
console.log("crowdfundingPath", crowdfundingPath)
const source = fs.readFileSync(crowdfundingPath, 'utf8'); // читаем этот файл
console.log("source", source)

// начинаем компилировать этот файл
const input = {
    language: 'Solidity',
    sources: {
        'Crowdfunding': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};
console.log('ITS INPUUT!!!!', input)
////////////
// получаем наши скомпилированные контаркты
const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts;

console.log('HEY HEY HEY!!!!')
console.log("output", output)

// создаем папку build
fs.ensureDirSync(buildPath);

// loop по контарктам и создаем отдельный файл для каждого контракта
for (let contract in output['Crowdfunding']) {
    console.log("contract", contract)
    fs.outputJSONSync(
        path.resolve(buildPath, contract + '.json'),
        output['Crowdfunding'][contract] // it's a content which we want to write to json file
    )
    console.log('HEEEEELOOOOO!!!!!!')
}