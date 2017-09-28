'use strict';

var blessed = require('blessed');
const logger = require('../util/Logger.js');
const clipboard = require('../util/Clipboard.js');

class AllTracksView{

  constructor(screen, style, player){
    this._screen = screen;
    this._style = style;
    this._player = player;
    this._trackList = undefined;
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
    this._updateTitle();
  }

  showList(list){
    this._trackList = list;
    let trackStyle = this._style.track;
    let items = list.getTracks().map( (element) => {
      let str = trackStyle
        .replace('${artist}',element.getArtist())
        .replace('${title}',element.getTitle());
      return str;
    } );

    this._list.setItems(items || ['<empty>']);
    this._updateTitle();
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

    this._player.play(this._trackList, this._list.selected); 
  }

  onFocused(){
    this._updateTitle();
    this._screen.key('p', this.onPlay.bind(this));
    this._screen.key('C-c', this.copyToClipboard.bind(this));
  }

  onUnFocused(){
    this._updateTitle();
    this._screen.removeKeyAll('p');
    this._screen.removeKeyAll('C-c');
  }

  copyToClipboard(){
    let track = this._selectedTrack();
    logger.verbose('copy ' + track.getName());

    clipboard.set(track, (clipboard, playlist, selectedPlaylistEntry)=>{
      playlist.addTrack(clipboard.content(), selectedPlaylistEntry);
    });
  }

  _selectedTrack(){
    return this._trackList.getTracks()[this._list.selected];
  }

  _updateTitle(){
    let template = this._list.focused ? this._style.title.focused : this._style.title.unfocused;
    this._list.setLabel(template.replace('${title}','All tracks'));
    this._screen.render();
  }

}

module.exports = AllTracksView;