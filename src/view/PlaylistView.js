'use strict';

var blessed = require('blessed');
const logger = require('../util/Logger.js');
const clipboard = require('../util/Clipboard.js');
const MultiCheckboxInputView = require('./MultiCheckboxInputView.js');
const MessageView = require('./MessageView.js');
const tagConfig = require('../util/TagConfig.js');
const util = require('util');

class PlaylistView{

  constructor(screen, style, player, playlistManager){
    this._screen = screen;
    this._style = style;
    this._player = player;
    this._playlist = undefined;
    this._playlistManager = playlistManager;
    this._cursorPosStorage = {};

    let self = this;
    this._list = blessed.list({
      parent: screen,
      tags: true,
      draggable: false,
      top: 0,
      left: '20%',
      width: '40%',
      height: `100%-${style.outputView.height}`,
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
  }

  showPlaylist(playlist){
    this._storeCursorPos();
    this._playlist = playlist;
    let trackStyle = this._style.track;
    
    let items = playlist.getEntries().map( (element) => {
      let str = trackStyle
        .replace('${artist}',element.getArtist())
        .replace('${title}',element.getTitle());
      return str;
    });

    this._list.setItems(items || ['<empty>']);
    this._updateTitle();
    this._recoverCursorPos();
  }

  show(){
    this._list.focus();
    this._list.enterSelected(0);
    this._list.show();
    this._screen.render();
  }

  hide(){
    this._list.hide();
    this._screen.render();
  }

  focus(){
    this._list.focus();
  }

  onPlay(){
    let track = this._selectedTrack();
    logger.debug('play ' + track.getName());

    this._player.play(this._playlist.getTracks(), this._list.selected); 
  }

  onFocused(){
    this._updateTitle();
    this._screen.key('p', this.onPlay.bind(this));
    this._screen.key('C-c', this.copyToClipboard.bind(this));
    this._screen.key('C-x', this.cutToClipboard.bind(this));
    this._screen.key('C-v', this.pasteFromClipboard.bind(this));
    this._screen.key('del', this.deleteEntry.bind(this));
    this._screen.key('backspace', this.deleteEntry.bind(this));
    this._screen.key('t', this.tagEntry.bind(this));
    this._screen.key('i', this.showInfo.bind(this));
  }

  onUnFocused(){
    this._updateTitle();
    this._screen.removeKeyAll('p');
    this._screen.removeKeyAll('C-c');
    this._screen.removeKeyAll('C-x');
    this._screen.removeKeyAll('C-v');
    this._screen.removeKeyAll('del');
    this._screen.removeKeyAll('backspace');
    this._screen.removeKeyAll('t');
    this._screen.removeKeyAll('i');
  }

  copyToClipboard(){
    let entry = this._selectedEntry();
    if (!entry){
      return; //nothing selected
    }

    logger.verbose('copy ' + entry.getName());

    clipboard.set(entry, (clipboard, playlist, selectedPlaylistEntry)=>{
      playlist.addTrack(clipboard.content().getTrack(), selectedPlaylistEntry);
    });
  }

  cutToClipboard(){
    let entry = this._selectedEntry();
    if (!entry){
      return; //nothing selected
    }

    logger.verbose('cut ' + entry.getName());

    clipboard.set(entry, (clipboard, playlist, selectedPlaylistEntry)=>{
      playlist.moveEntryAfter(entry, selectedPlaylistEntry);
      clipboard.clear();
    });
  }
  
  pasteFromClipboard(){
    logger.verbose('paste');
    clipboard.paste(this._playlist, this._selectedEntry());
  }

  deleteEntry(){
    let entry = this._selectedEntry();
    if (!entry){
      return; //nothing selected
    }

    this._playlist.removeEntry(entry);
  }

  tagEntry(){
    let entry = this._selectedEntry();
    if (!entry){
      return; //nothing selected
    }

    let availableTags = tagConfig.getTags();
    let usedTags = entry.getTrack().tagsAsString();

    let view = new MultiCheckboxInputView(this._screen, this._style);
    view.ask('Select tags', availableTags, usedTags, (addedElements, removedElements)=>{
      let track = entry.getTrack();
      addedElements.forEach((tagName)=>{
        this._playlistManager.addTrackToTag(track, tagName);
      });
      removedElements.forEach((tagName)=>{
        this._playlistManager.removeTrackFromTag(track, tagName);
      });
    });
  }

  showInfo(){
    let entry = this._selectedEntry();
    if (!entry){
      return; //nothing selected
    }

    let track = entry.getTrack();
    let view = new MessageView(this._screen, this._style, 'Info: ' + track.getName(), util.inspect(track._track));
    view.show();
  }

  _selectedTrack(){
    return this._selectedEntry().getTrack();
  }

  _selectedEntry(){
    let idx = this._list.selected;
    return this._playlist.getEntryAt(idx);
  }

  _updateTitle(){
    if (this._playlist){
      let template = this._list.focused ? this._style.title.focused : this._style.title.unfocused;
      this._list.setLabel(template.replace('${title}',this._playlist.getName()));
      this._screen.render();
    }
  }

  _storeCursorPos(){
    if (this._playlist){
      let cursorPos = this._list.selected;
      this._cursorPosStorage[this._playlist.getName()] = cursorPos;
    }
  }

  _recoverCursorPos(){
    if (this._playlist){

      let cursorPos = this._cursorPosStorage[this._playlist.getName()];
      let playlistLength = this._playlist.getLength();
      if (cursorPos){
        cursorPos = (cursorPos >= playlistLength) ? playlistLength : cursorPos;
      } else if (playlistLength > 0){
        cursorPos = 0;
      }

      if (cursorPos !== undefined){
        this._list.select(cursorPos);
      }
    }
  }

}

module.exports = PlaylistView;