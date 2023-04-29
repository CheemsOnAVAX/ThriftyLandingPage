// ======= Imports ======= //

const path = require("path"),
  fs = require("fs");

// ======= Variables ======= //

// ======= Codes ======= //

// Reset Funcitons
function resetStarter() {
  //deleting git directory
  function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function (file, index) {
        let curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          // recurse
          deleteFolderRecursive(curPath);
        } else {
          // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }
  try {
    deleteFolderRecursive("./.git");
    deleteFolderRecursive("./.idea");
  } catch (err) {
    console.log(err);
  }
}

// ======= Exports ======= //

resetStarter();
