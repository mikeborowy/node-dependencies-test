const fs = require("fs");
const rl = require("readline");

const dirname = "test_data_examples/";

const checkForMissingDependencies = async (dirname, filename) => {
  const fileStream = fs.createReadStream(dirname + filename);
  const readLine = rl.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let packagesArray = [];
  let dependenciesArray = [];
  let missingDependenciesArray = [];

  try {
    for await (const line of readLine) {
      if (line.length > 1) {
        let _line = line
          .replace(/(.\*?),(.\*?),/g, "$1,$2;")
          .replace(/,/g, "")
          .split(";");

        if (_line.length === 1) {
          packagesArray = [...packagesArray, ..._line];
        }

        if (_line.length > 1) {
          dependenciesArray = [...dependenciesArray, _line];
        }
      }
    }

    for (const dependencies of dependenciesArray) {
      const arrayDiff = dependencies.filter(
        (dependency) => !packagesArray.includes(dependency)
      );
      if (arrayDiff.length === 1) missingDependenciesArray.push(...arrayDiff);
    }

    missingDependenciesArray = [...new Set(missingDependenciesArray)];

    const status =
      missingDependenciesArray.length === 0
        ? "\u001b[32;1mPASS\u001b[0m"
        : `\u001b[31;1mFAIL \u001b[33;1m!!! missing ${missingDependenciesArray} !!!\u001b[0m`;

    return {
      packagesArray,
      dependenciesArray,
      missingDependenciesArray,
      message: `Installation of ${filename}... ${status}`,
    };
  } catch (error) {
    throw new Error(error);
  }
};

fs.readdir(dirname, async (err, filenameArray) => {
  if (err) {
    throw new Error(error);
  }

  try {
    for await (const filename of filenameArray) {
      const result = await checkForMissingDependencies(dirname, filename);
      console.log(result.message);
    }
  } catch (error) {
    throw new Error(error);
  }
});
