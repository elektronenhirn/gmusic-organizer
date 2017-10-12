'use strict';

var blessed = require('blessed');
var ModalDialogBase = require('./ModalDialogBase.js');

class TextInputDialog extends ModalDialogBase{
  
  constructor(screen, style){
    super(screen, blessed.prompt({
      parent: screen,
      top: 'center',
      left: 'center',
      height: 'shrink',
      width: 'shrink',
      keys: true,
      vi: true,
      mouse: false,
      tags: true,
      border: 'line',
      hidden: true,
      style: JSON.parse(JSON.stringify(style.box)) //deep copy style
    }));
  }

  ask(question, defaultReply, callback){
    this._box.input(question, defaultReply, callback);
  }
}

module.exports = TextInputDialog;