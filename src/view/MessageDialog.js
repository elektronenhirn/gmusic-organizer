'use strict';

var blessed = require('blessed');
var ModalDialogBase = require('./ModalDialogBase.js');

class MessageDialog extends ModalDialogBase{

  constructor(screen, style, confirmKey, title, content){
    super(screen, blessed.box({
      top: '50%-15',
      left: 'center',
      height: 'shrink',
      width: 'shrink',
      label: style.title.focused.replace('${title}', title),
      content: style.message.replace('${message}', content),
      tags: true,
      border: {
        type: 'line'
      },
      style: JSON.parse(JSON.stringify(style.box)), //deep copy style
    }));

    this._confirmKey = confirmKey || '';
  }

  onShow(){
    super.onShow();
    this._screen.key('enter', this.hide.bind(this));
    this._screen.key('escape', this.hide.bind(this));
    this._screen.key(this._confirmKey, this.hide.bind(this));
  }

  onHide(){
    this._screen.removeKeyAll('enter');
    this._screen.removeKeyAll('escape');
    this._screen.removeKeyAll(this._confirmKey);
    super.onHide();
  }
}

module.exports = MessageDialog;