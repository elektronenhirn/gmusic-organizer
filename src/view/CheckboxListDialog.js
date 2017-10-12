'use strict';

var blessed = require('blessed');
var ModalDialogBase = require('./ModalDialogBase.js');

class CheckboxListDialog extends ModalDialogBase{

  constructor(screen, style, confirmKey){
    super(screen, blessed.list({
      parent: screen,
      tags: true,
      draggable: false,
      top: 5,
      left: 'center',
      width: 'shrink',
      height: 'shrink',
      keys: true,
      vi: true,
      mouse: false,
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
      style: JSON.parse(JSON.stringify(style.box)) //deep copy style
    }));

    this._box.search = (callback) => {
      this._prompt.input('{white-fg}Search track:{/white-fg}', '', function(err, value) {
        if (err) return;
        return callback(null, value);
      });
    };

    this._prompt = blessed.prompt({
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
    });

    this._style = style;
    this._confirmKey = confirmKey || '';
    this._callback = undefined;
    this._elements = undefined;
    this._initalSelection = undefined;
    this._selected = undefined;
  }

  ask(question, elements, selectedElements, callback){
    this._elements = elements;
    this._initalSelection = new Set(selectedElements); 
    this._selected = new Set(selectedElements);
    
    this._box.setLabel(this._style.title.focused.replace('${title}',question));
    this._box.height = elements.length + 2;
    this._callback = callback;
//    this._box.enterSelected(0);
    this.show();
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
    this._box.setItems(items);
    this._box.show();
    this._screen.render();
  }

  onShow(){
    super.onShow();
    this._screen.key('space', this.select.bind(this));
    this._screen.key(this._confirmKey, this.onDone.bind(this, true));
    this._screen.key('enter', this.onDone.bind(this, true));
    this._screen.key('escape', this.onDone.bind(this, false));
  }

  onHide(){
    this._screen.removeKeyAll('space');
    this._screen.removeKeyAll(this._confirmKey);
    this._screen.removeKeyAll('enter');
    this._screen.removeKeyAll('escape');
    super.onHide();
  }

  select(){
    let idx = this._box.selected;
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
    this.hide();
  }

}

module.exports = CheckboxListDialog;