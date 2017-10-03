'use strict';

var blessed = require('blessed');

class MultiCheckboxInputView{

  constructor(screen, style){
    this._screen = screen;
    this._style = style;
    this._callback = undefined;
    this._elements = undefined;
    this._initalSelection = undefined;
    this._selected = undefined;

    let self = this;
    this._list = blessed.list({
      parent: screen,
      tags: true,
      draggable: false,
      top: 5,
      left: 'center',
      width: 'shrink',
      height: 'shrink',
      keys: true,
      vi: true,
      mouse: true,
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
      search: function(callback) {
        self._prompt.input('{white-fg}Search track:{/white-fg}', '', function(err, value) {
          if (err) return;
          return callback(null, value);
        });
      }
    });
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

    this._list.on('focus', this.onFocused.bind(this));
    this._list.on('blur', this.onUnFocused.bind(this));
    this._list.on('action', this.onDone.bind(this));
  }

  ask(question, elements, selectedElements, callback){
    this._elements = elements;
    this._initalSelection = new Set(selectedElements); 
    this._selected = new Set(selectedElements);
    
    this._list.setLabel(this._style.title.focused.replace('${title}',question));
    this._list.height = elements.length + 2;
    this._list.focus();
    this._callback = callback;
//    this._list.enterSelected(0);
    this._update();
  }

  _update(){
    let checkboxStyle = this._style.checkbox;

    let toString = function(checked, label){
      return checkboxStyle
        .replace('${checkbox}',checked ? 'x' : ' ')
        .replace('${label}', label);
    };

    let items = this._elements.map((val)=>{
      return toString(this._selected.has(val), val);
    });
    this._list.setItems(items);
    this._list.show();
    this._screen.render();
  }

  onFocused(){
    this._screen.key('space', this.select.bind(this));
  }

  onUnFocused(){
    this._screen.removeKeyAll('space');
  }

  select(){
    let idx = this._list.selected;
    let selectedElement = this._elements[idx];
    if (this._selected.has(selectedElement)){
      this._selected.delete(selectedElement);
    } else {
      this._selected.add(selectedElement);
    }
    this._update();
  }

  onDone(passResult){
    let addedElements = [];
    let removedElements = [];
    let selectedElements = null;

    if (passResult){
      addedElements = [...this._selected].filter(name => !this._initalSelection.has(name));
      removedElements = [...this._initalSelection].filter(name => !this._selected.has(name));
      selectedElements = [...this._selected];
    }

    this._callback(addedElements, removedElements, selectedElements);
    this._screen.remove(this._list);
    this._screen.render();
  }

}

module.exports = MultiCheckboxInputView;