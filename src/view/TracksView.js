'use strict';

var blessed = require('blessed');
const logger = require('../util/Logger.js');
const clipboard = require('../util/Clipboard.js');
const CheckboxListDialog = require('./CheckboxListDialog.js');
const MessageDialog = require('./MessageDialog.js');
const tagConfig = require('../util/TagConfig.js');
const Filters = require('./Filters.js');
const util = require('util');
const TagDialog = require('./TagDialog.js');

class TracksView{

  constructor(screen, style, player, playlistManager){
    this._screen = screen;
    this._style = style;
    this._player = player;
    this._trackList = undefined;
    this._filteredTrackList = undefined;
    this._activeFilters = new Set();
    this._playlistManager = playlistManager;
    let self = this;

    this._list = blessed.list({
      parent: screen,
      tags: true,
      draggable: false,
      top: 0,
      right: 0,
      width: '40%',
      height: `100%-${style.outputView.height}`,
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
      mouse: false,
      tags: true,
      border: 'line',
      hidden: true,
      style: JSON.parse(JSON.stringify(style.box)) //deep copy style
    });

    this._list.on('focus', this.onFocused.bind(this));
    this._list.on('blur', this.onUnFocused.bind(this));
    this._updateTitle();
  }

  showList(list){
    this._trackList = list;
    this._update();
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

    this._player.play(this._filteredTrackList, this._list.selected); 
  }

  onFocused(){
    this._updateTitle();
    this._screen.key('p', this.onPlay.bind(this));
    this._screen.key('C-c', this.copyToClipboard.bind(this));
    this._screen.key('f', this.filter.bind(this));
    this._screen.key('t', this.tagEntry.bind(this));
    this._screen.key('i', this.showInfo.bind(this));
  }

  onUnFocused(){
    this._updateTitle();
    this._screen.removeKeyAll('p');
    this._screen.removeKeyAll('C-c');
    this._screen.removeKeyAll('f');
    this._screen.removeKeyAll('t');
    this._screen.removeKeyAll('i');
  }

  copyToClipboard(){
    let track = this._selectedTrack();
    if (!track){
      return; //nothing selected
    }

    logger.verbose('copy ' + track.getName());

    clipboard.set(track, (clipboard, playlist, selectedPlaylistEntry)=>{
      playlist.addTrack(clipboard.content(), selectedPlaylistEntry);
    });
  }

  filter(){
    let dialog = new CheckboxListDialog(this._screen, this._style, 'f');
    let availableTags = tagConfig.getQualifiedTags();
    const UNTAGGED_OPTION = '[untagged]';
    availableTags.push(UNTAGGED_OPTION);

    let usedTags = [...this._activeFilters].map((filter)=>filter.getName());

    dialog.ask('Filter by tags', availableTags, usedTags, (addedElements, removedElements, selectedTags)=>{
      if (!selectedTags){
        return; //user pressed esc
      }

      this._activeFilters.clear();

      selectedTags.forEach((tagName)=>{
        this._activeFilters.add(
          tagName === UNTAGGED_OPTION 
            ? new Filters.FilterUntagged(UNTAGGED_OPTION) 
            : new Filters.FilterByTag(tagName)
        );
      });

      this._update();
    });
  }

  tagEntry(){
    let track = this._selectedTrack();
    if (!track){
      return; //nothing selected
    }

    let usedTags = track.tagsAsString();
    
    let dialog = new TagDialog(this._screen, this._style, 't', 'Select tags');
    dialog.ask(usedTags, (addedElements, removedElements)=>{
      addedElements.forEach((tagName)=>{
        this._playlistManager.addTrackToTag(track, tagName);
      });
      removedElements.forEach((tagName)=>{
        this._playlistManager.removeTrackFromTag(track, tagName);
      });
    });
  }

  showInfo(){
    let track = this._selectedTrack();
    if (!track){
      return; //nothing selected
    }

    let view = new MessageDialog(this._screen, this._style, 'i', 'Info: ' + track.getName(), util.inspect(track._track));
    view.show();
  }

  _selectedTrack(){
    return this._filteredTrackList[this._list.selected];
  }

  _updateTitle(){
    let template = this._list.focused ? this._style.title.focused : this._style.title.unfocused;
    let filters = this._activeFilters.size == 0 
      ? 'none'
      : [...this._activeFilters].map((f)=>f.getName()).join(',');
    let nrOfEntries = this._filteredTrackList ? this._filteredTrackList.length : 0;
    this._list.setLabel(template.replace('${title}','All tracks (' +  nrOfEntries + ')[filters=' + filters + ']'));

    this._screen.render();
  }

  _update(){
    let trackStyle = this._style.track;
    let allTracks = this._trackList.getTracks();
    this._filteredTrackList = allTracks;
    
    if (this._activeFilters.size > 0){
      this._filteredTrackList = allTracks.filter((t) => {
        return [...this._activeFilters].filter(f=>f.matches(t)).length > 0;
      });
    }

    let items = this._filteredTrackList.map( (element) => {
      let str = trackStyle
        .replace('${artist}',element.getArtist())
        .replace('${title}',element.getTitle());
      return str;
    } );

    this._list.setItems(items || ['<empty>']);

    this._updateTitle();
  }

}

module.exports = TracksView;