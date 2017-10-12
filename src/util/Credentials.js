'use strict';
const settings = require('user-settings').file('.gmusic-organizer/credentials');
const TextInputDialog = require('../view/TextInputDialog.js');
const dotFolder = require('./DotFolder.js');

class Credentials{

  constructor(){
    dotFolder.prepare();
    this._credentials = settings.get('credentials') || 
      {
        email : undefined,
        password : undefined,
        androidId : undefined,
        masterToken : undefined
      };
  }

  defined(){
    return this._credentials.email && this._credentials.masterToken;
  }

  get(){
    return this._credentials;
  }
  
  store(){
    settings.set('credentials',this._credentials);
  }

  unsetPassword(){
    this._credentials.password = undefined;
  }

  unsetMasterToken(){
    this._credentials.masterToken = undefined;
  }
  
  askUserForLogin(screen, style){
    return this._askForEmailAddress(screen, style).then(this._askForPassword.bind(this, screen, style));
  }

  setMasterToken(masterToken){
    this._credentials.masterToken = masterToken;
  }

  setAndroidId(androidId){
    this._credentials.androidId = androidId;
  }

  _askForEmailAddress(screen, style){
    let self = this;
    return new Promise((resolve,reject)=>{
      let questionDialog = new TextInputDialog(screen, style);
      questionDialog.ask('Enter your gmusic account\'s email address:',this._credentials.email || '',function(err, val){
        if (err || val===undefined || val === null){
          return reject(err); //User pressed cancel/ESC
        }
        self._credentials.email = val;
        resolve(val);
      });
    });
  }

  _askForPassword(screen, style){
    let self = this;
    return new Promise((resolve,reject)=>{
      let questionDialog = new TextInputDialog(screen, style);
      questionDialog.ask('Enter your (app-specific) password:','',function(err, val){
        if (err || val===undefined || val === null){
          return reject(err); //User pressed cancel/ESC
        }
        self._credentials.password = val;
        resolve(val);
      });
    });
  }

}

module.exports = new Credentials();