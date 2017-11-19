'use strict';

var blessed = require('blessed');
var ModalDialogBase = require('./ModalDialogBase.js');

class YesNoDialog extends ModalDialogBase {

  constructor(screen, style) {
    super(screen, blessed.question({
      parent: screen,
      border: 'line',
      height: 'shrink',
      width: 'half',
      top: 'center',
      left: 'center',
      label: ' {blue-fg}Question{/blue-fg} ',
      tags: true,
      keys: true,
      vi: true,
      style: JSON.parse(JSON.stringify(style.box)) //deep copy style
    }));
  }

  ask(question) {
    return new Promise((resolve, reject) => {
      this._box.ask(question, (err, value) => {
        if (err || value === false) {
          reject();
          false;
        }
        resolve();
      });
    });
  }
}

module.exports = YesNoDialog;