// Run this with node to get a valid input file to upload to the service

const fs = require("node:fs");

// SET LENGTH OF BILLS
const length = 10000;
// SET FILENAME
const fileName = "output";

let bills = [];
const consonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "ß", "t", "v", "w", "x", "y", "z"];
const vocals = ["a", "e", "i", "o", "u"];

const generateName = () => {
    let generatedName = "";
    for (let i = 0; i<8; i++) {
        const letter = i % 2 == 1 ? vocals[Math.floor(Math.random() * 4)] : consonants[Math.floor(Math.random() * 22)];
        generatedName += letter;
    }
    return generatedName;
};

for (let i = 0; i<length; i++) {
    bills[i] = {
        name: generateName(),
        price: `${Math.floor(Math.random() * 100)}€`
    };
}

const outputString = JSON.stringify(bills);

fs.writeFile(`./${fileName}.json`, outputString, err => {
    if (err) {
      console.error(err);
    } else {
      console.log(`sucessfully created file ${fileName}.json`);
    }
});
