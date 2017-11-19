'use strict';

var blessed = require('blessed');
const YesNoDialog = require('./YesNoDialog.js');

class PlaylistsView {

  constructor(screen, style, downloader) {
    this._screen = screen;
    this._style = style;
    this._downloader = downloader;
    this._playlistManager = undefined;

    let self = this;
    this._list = blessed.list({
      parent: screen,
      tags: true,
      draggable: false,
      top: 0,
      left: 0,
      width: '20%',
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
      search: function (callback) {
        self._prompt.input('Search:', '', function (err, value) {
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
      hidden: true
    });

    this._list.on('focus', this.onFocused.bind(this));
    this._list.on('blur', this.onUnFocused.bind(this));
    this._updateTitle();
  }

  showPlaylists(playlistManager) {
    this._playlistManager = playlistManager;

    let playlistNames = this._playlistManager.entriesAsStringArray();

    let playlistStyle = this._style.playlist;

    playlistNames = playlistNames.map((element) => {
      return playlistStyle.replace('${playlist}', element);
    });
    this._list.setItems(playlistNames);
    this._screen.render();
  }

  show() {
    this._list.focus();
    this._list.show();
    this._list.enterSelected(0);
    this._screen.render();
  }

  hide() {
    this._list.hide();
    this._screen.render();
  }

  focus() {
    this._list.focus();
  }

  onPlaylistSelected(callback) {
    let list = this._list;
    list.on('select item', (el, selected) => {
      if (list._.rendering || !el) return;

      callback(this.getSelectedPlaylist());
    });
  }

  selected() {
    return this._list.selected;
  }

  getSelectedPlaylist() {
    return this._playlistManager.getPlaylist(this.selected());
  }

  select(idx) {
    this._list.select(idx);
  }

  onFocused() {
    this._updateTitle();
    this._screen.key('del', this.deletePlaylist.bind(this));
    this._screen.key('backspace', this.deletePlaylist.bind(this));
    this._screen.key('d', this.downloadPlaylist.bind(this));
  }

  onUnFocused() {
    this._updateTitle();
    this._screen.removeKeyAll('del');
    this._screen.removeKeyAll('backspace');
    this._screen.removeKeyAll('d');
  }

  deletePlaylist() {
    let playlist = this.getSelectedPlaylist();

    let dialog = new YesNoDialog(this._screen, this._style);
    dialog.ask('Really delete playlist ' + playlist.getName() + '?')
      .then(() => {
        this._playlistManager.deletePlaylist(playlist);
      })
      .catch(() => /*dont care*/ { });
  }

  downloadPlaylist() {
    let playlist = this.getSelectedPlaylist();

    let dialog = new YesNoDialog(this._screen, this._style);
    dialog.ask('Download playlist ' + playlist.getName() + '?')
      .then(() => {
        this._downloader.downloadPlaylist(playlist);
      })
      .catch(() => /*dont care*/ { });
  }

  _updateTitle() {
    let template = this._list.focused ? this._style.title.focused : this._style.title.unfocused;
    this._list.setLabel(template.replace('${title}', 'Playlists'));
    this._screen.render();
  }

}

module.exports = PlaylistsView;