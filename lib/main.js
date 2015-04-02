(function () {
    var fs = require('fs');
    var processor = require('./sagaML');

    var inFile = process.argv[2];
    var outFile = process.argv[3];

    //throw ("dsdfds" + inFile + "     " + outFile);

    if (!inFile) {
        console.error("Error: Provide filename");
        process.exit(1);
    }

    var data = fs.readFileSync(inFile, 'utf8');
    var result = processor.sagaML(data, inFile);
    fs.writeFile(outFile, result);

    return result;
}).call(this);