/*:
 * @plugindesc rpg_savesmanager.js - A RPG Maker localStorage manager.
 * @author Bashar Astifan (License: MIT)
 *
 * @help This plugin adds 3 new Main Menu items that allow
 * Backup/Restore and Delete of Save Data
 */


/*******************/
/* DISABLE ERRORS  */
/*******************/
console.error = function (...args) {
  //Generate warning instead
  console.warn(args);
}

//Backup file type
var backupFileType = "bak";

/*******************/
/* SAVE MANAGEMENT */
/*******************/
function getLocalStorage() {
  return JSON.stringify(localStorage);
}

function writeLocalStorage(data) {
  var dataJSON = JSON.parse(data);
  localStorage.clear();
  Object.keys(dataJSON).forEach(function (key) {
    localStorage.setItem(key, dataJSON[key]);
  });
}


/* SAVE FILE SECTION */
//Append hidden link element
var fakeLink = document.createElement("a");
fakeLink.style.display = "none";
document.body.appendChild(fakeLink);

function saveLocalStorage() {
  /* dump local storage to string */
  /* save as blob */
  var fileName = document.title.replace(/\s/g, "_") + "." + backupFileType;
  var dataToSave = getLocalStorage();
  try {
    var textToSaveAsBlob = new Blob([dataToSave], {
      type: "text/plain"
    });
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    fakeLink.href = textToSaveAsURL;
    fakeLink.download = fileName;
    fakeLink.click();
  } catch {
    var scriptCode = "getLocalStorage()";
    window.location.replace("rpgbackup:" + fileName + "," + scriptCode);
  }
}


/* IMPORT FILE SECTION */
//Append hidden input element
var importFile = document.createElement("input");
importFile.type = "file";
importFile.accept = backupFileType + "/*";
importFile.style.display = "none";
document.body.appendChild(importFile);

//Attach input event
importFile.addEventListener("change", function (e) {
  if (e.target.files !== null && e.target.files.length > 0) {
    var selectedFile = e.target.files[0];
    var fileReader = new FileReader();
    fileReader.onload = function () {
      //File loaded
      var fileContent = fileReader.result;
      writeLocalStorage(fileContent);
      SceneManager.goto(Scene_Title);
    };
    fileReader.onerror = function (error) {
      //Failed to load
      console.error(error);
    };
    fileReader.readAsText(selectedFile);
  }
});

function restoreLocalStorage() {
  /* import without button hack */
  importFile.click();
}


/*******************/
/* MENU MANAGEMENT */
/*******************/

//Save copy of original makeCommandList
var tempMakeCommandList = Window_TitleCommand.prototype.makeCommandList;
//Override the function
Window_TitleCommand.prototype.makeCommandList = function () {
  //Call original
  tempMakeCommandList.call(this);
  //Append our options
  this.addCommand("Backup Saves", 'backupStorage', localStorage.length > 0);
  this.addCommand("Restore Saves", 'restoreStorage');
  this.addCommand("Reset", 'resetStorage');
};

//Save copy of original createCommandWindow
var tempCreateCommandWindow = Scene_Title.prototype.createCommandWindow;
Scene_Title.prototype.createCommandWindow = function () {
  //Call original
  tempCreateCommandWindow.call(this);
  //Append our options
  this._commandWindow.setHandler('backupStorage', this.commandBackupStorage.bind(this));
  this._commandWindow.setHandler('restoreStorage', this.commandRestoreStorage.bind(this));
  this._commandWindow.setHandler('resetStorage', this.commandResetStorage.bind(this));
};

Scene_Title.prototype.commandBackupStorage = function () {
  saveLocalStorage();
  this.fadeOutAll();
  SceneManager.goto(Scene_Title);
};

Scene_Title.prototype.commandRestoreStorage = function () {
  restoreLocalStorage();
  this.fadeOutAll();
  SceneManager.goto(Scene_Title);
};

Scene_Title.prototype.commandResetStorage = function () {
  localStorage.clear();
  this.fadeOutAll();
  SceneManager.goto(Scene_Title);
};
