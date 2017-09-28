'use strict';

class Clipboard{
  
  constructor(){
    this._obj = undefined;
    this._action = undefined;
  }

  content(){
    return this._obj;
  }

  set(obj, action){
    this._obj = obj;
    this._action = action;
  }

  paste(model, referenceObj){
    if (this._action){
      this._action(this, model, referenceObj);
    }
  }

  clear(){
    this._obj = undefined;
    this._action = undefined;
  }

}

module.exports = new Clipboard();