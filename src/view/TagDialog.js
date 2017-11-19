'use strict';

var blessed = require('blessed');
var tagConfig = require('../util/TagConfig.js');
var ModalDialogBase = require('./ModalDialogBase.js');
const Ring = require('../util/Ring.js');

class TagDialog extends ModalDialogBase {

  constructor(screen, style, confirmKey, title) {
    super(screen, blessed.box({
      top: 'center',
      left: 'center',
      height: tagConfig.getMaxNumberOfTagsPerCategory() + 2 + 2 + 2,
      width: 'shrink',
      label: style.title.focused.replace('${title}', title),
      tags: true,
      border: {
        type: 'line'
      },
      style: JSON.parse(JSON.stringify(style.box)), //deep copy style
    }));

    this._confirmKey = confirmKey || '';
    this._callback = undefined;
    this._initalSelection = undefined;
    this._selected = undefined;
    this._style = style;

    this._tagLists = [];
    this._focusedTagList = 1;
    let tagsTree = tagConfig.getConfig();
    let tagCategories = Object.keys(tagsTree);
    let width = 20;

    tagCategories.forEach((key, idx) => {
      let labelTemplate = (idx === 0) ? style.title.focused : style.title.unfocused;
      let list = blessed.list({
        parent: screen,
        tags: true,
        draggable: false,
        label: labelTemplate.replace('${title}', key),
        top: 1,
        left: idx * width,
        width: width,
        height: tagConfig.getMaxNumberOfTagsPerCategory() + 2,
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
      });
      this._box.append(list);
      this._tagLists.push(list);
    });

    this._focusRing = new Ring(...this._tagLists);
  }

  ask(selectedTags, callback) {
    this._initalSelection = new Set(selectedTags);
    this._selected = new Set(selectedTags);
    this._callback = callback;
    this._update();
    this.show();
    this._focusRing.current().focus();
  }

  onShow() {
    super.onShow();
    this._screen.key('space', this.select.bind(this));
    this._screen.key('enter', this.onDone.bind(this, true));
    this._screen.key(this._confirmKey, this.onDone.bind(this, true));
    this._screen.key('escape', this.hide.bind(this, false));
    this._screen.key('left', this.focusLeft.bind(this));
    this._screen.key('right', this.focusRight.bind(this));
  }

  onHide() {
    this._screen.removeKeyAll('space');
    this._screen.removeKeyAll('enter');
    this._screen.removeKeyAll(this._confirmKey);
    this._screen.removeKeyAll('escape');
    this._screen.removeKeyAll('left');
    this._screen.removeKeyAll('right');
    super.onHide();
  }

  focusLeft() {
    this._focusRing.left();
    this.focus();
  }

  focusRight() {
    this._focusRing.right();
    this.focus();
  }

  focus() {
    Object.keys(tagConfig.getConfig()).forEach((key, idx) => {
      let list = this._tagLists[idx];
      let template = (idx === this._focusRing.index()) ? this._style.title.focused : this._style.title.unfocused;
      list.setLabel(template.replace('${title}', key));
    });

    this._focusRing.current().focus();
  }

  onDone(passResult) {
    let addedElements = [];
    let removedElements = [];
    let selectedElements = null;

    if (passResult) {
      addedElements = [...this._selected].filter(name => !this._initalSelection.has(name));
      removedElements = [...this._initalSelection].filter(name => !this._selected.has(name));
      selectedElements = [...this._selected];
    }

    this._callback(addedElements, removedElements, selectedElements);
    this.hide();
  }

  select() {
    let selectedCategory = this._focusRing.index();
    let idx = this._focusRing.current().selected;
    let tag = tagConfig.getQualifiedTag(selectedCategory, idx);

    if (this._selected.has(tag)) {
      this._selected.delete(tag);
    } else {
      this._selected.add(tag);
    }
    this._update();
  }

  _update() {
    let checkboxStyle = this._style.checkbox;

    let toString = function (checked, label) {
      return checkboxStyle
        .replace('${checkbox}', checked ? 'x' : ' ')
        .replace('${label}', label);
    };

    Object.keys(tagConfig.getConfig()).forEach((key, idx) => {
      let list = this._tagLists[idx];

      let items = tagConfig.getConfig()[key].map((val) => {
        return toString(this._selected.has(key + ':' + val), val);
      });
      list.setItems(items);
    });

    this._screen.render();
  }
}

module.exports = TagDialog;