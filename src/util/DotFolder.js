'use strict';

const fs = require('fs');
const path = require('path');
const DOTFOLDER = '.gmusic-organizer';
/**
 * creates the dotfolder 
 * (or migrates from file .gmusic-organizer to .gmusic-organizer/credentials)
 */
class DotFolder{

  constructor(){
    this._dotFolder = null;
  }

  prepare(){
    this._dotFolder = path.join(process.env.HOME || process.env.USERPROFILE, DOTFOLDER);
    
    if (!fs.existsSync(this._dotFolder)){
      //file/folder does not exist yet, 1st run ever
      fs.mkdirSync(this._dotFolder);
      return this._dotFolder;      
    }

    if (fs.lstatSync(this._dotFolder).isFile()){
      //file with same name already exists (from runs with version < 1.1)
      let oldConfig = fs.readFileSync(this._dotFolder, 'utf8');
      fs.unlinkSync(this._dotFolder);
      fs.mkdirSync(this._dotFolder);
      fs.writeFileSync(path.join(this._dotFolder,'credentials'),oldConfig);
    } 

    return this._dotFolder;
  }

  get(){
    return this._dotFolder || this.prepare();
  }
}

module.exports = new DotFolder();

