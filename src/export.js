const fs = require('fs');

var exp = [
    // 'astUtils.js',
    'grammar.js',
    'mooTokenize.js',
    'mxsCompactCode.js',
    'mxsparser.js',
    'astUtils.js',
]

exp.forEach( f => {
    fs.copyFileSync(`./src/${f}` , `./lib/${f}`);
    console.log(`Copied: ${f}`)
})