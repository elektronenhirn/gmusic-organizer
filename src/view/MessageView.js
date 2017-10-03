'use strict';

var blessed = require('blessed');

class MessageView {

  constructor(screen, style, title, content){
    this._screen = screen;
    this._box = blessed.box({
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
    });

    this._box.on('focus', this.onFocused.bind(this));
    this._box.on('blur', this.onUnFocused.bind(this));
  }

  show(){
    this._screen.append(this._box);
    this._box.focus();
    this._screen.render();
  }

  onFocused(){
    this._screen.key('enter', this.hide.bind(this));
    this._screen.key('esc', this.hide.bind(this));
  }

  onUnFocused(){
    this._screen.removeKeyAll('enter');
    this._screen.removeKeyAll('esc');
  }

  hide(){
    this._screen.remove(this._box);
    this._screen.render();
  }
}

module.exports = MessageView;