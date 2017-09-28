'use strict';

var blessed = require('blessed');

class TextInputView{
  constructor(screen, style){
    this._screen = screen;
    this._prompt = blessed.prompt({
      parent: screen,
      top: 'center',
      left: 'center',
      height: 'shrink',
      width: 'shrink',
      keys: true,
      vi: true,
      mouse: true,
      tags: true,
      border: 'line',
      hidden: true,
      style: JSON.parse(JSON.stringify(style.box)) //deep copy style
    });
  }

  ask(question, defaultReply, callback){
    this._prompt.input(question, defaultReply, callback);
  }
}

module.exports = TextInputView;