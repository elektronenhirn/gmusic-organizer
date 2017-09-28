'use strict';

var blessed = require('blessed');

class OutputView{
  constructor(screen, style){
    this._screen = screen;

    this._list = blessed.list({
      parent: screen,
      tags: true,
      draggable: false,
      bottom: 0,
      right: 0,
      width: '100%',
      height: style.outputView.height,
      keys: true,
      vi: true,
      mouse: false,
      interactive: false,
      border: 'line',
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'cyan'
        },
        style: {
          inverse: true
        }
      },
      style: JSON.parse(JSON.stringify(style.box)), //deep copy style
    });
  }

  gray(output){
    this._list.addItem('{gray-fg}' + output + '{/gray-fg}');
    this._update();
  }
  grey(output){
    this._list.addItem('{grey-fg}' + output + '{/grey-fg}');    
    this._update();
  }
  green(output){
    this._list.addItem('{white-fg}' + output + '{/white-fg}');
    this._update();
  }
  yellow(output){
    this._list.addItem('{yellow-fg}' + output + '{/yellow-fg}');
    this._update();
  }
  red(output){
    this._list.addItem('{red-fg}' + output + '{/red-fg}');
    this._update();
  }

  _update(){
    this._list.scrollTo(this._list.items.length);
    this._screen.render();
  }
  
            
}

module.exports = OutputView;