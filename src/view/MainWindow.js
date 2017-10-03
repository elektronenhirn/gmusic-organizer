'use strict';

//views
const PlaylistView = require('./PlaylistView.js');
const PlaylistsView = require('./PlaylistsView.js');
const OutputView = require('./OutputView.js');
const HelpView = require('./HelpView.js');
const AllTracksView = require('./AllTracksView.js');
const TextInputView = require('./TextInputView.js');

//styles
const style = require('../../styles/default.json');

//utils
const Ring = require('../util/Ring.js');
const logger = require('../util/Logger.js');

class MainWindow{

  constructor(screen, player, playlistManager, popularityAutoList){
    this._screen = screen;
    this._player = player;
    this._playlistManager = playlistManager;
    this._popularityAutoList = popularityAutoList;
    this._outputView = new OutputView(screen, style);
    this._playlistView = new PlaylistView(screen, style, player, playlistManager);
    this._playlistsView = new PlaylistsView(screen, style);
    this._helpView = new HelpView(screen, style);
    this._allTracksView = new AllTracksView(screen, style, player, playlistManager);
    this._focusRing = new Ring(this._playlistsView, this._playlistView, this._allTracksView);

    logger.setView(this._outputView);

    this._playlistsView.onPlaylistSelected(this.updatePlayListView.bind(this));
    this._playlistsView.show();
    
    this._setupKeyBindings();
    this._monkeyPatchScreen();

    playlistManager.on('updated', this.onModelUpdated.bind(this));
    playlistManager.on('error', this.onErrorUpdatingModel.bind(this));
    
    screen.render();
  }

  _setupKeyBindings(){
    this._screen.key('left', ()=> {
      this._focusRing.left().focus();
    });
    this._screen.key('right', ()=> {
      this._focusRing.right().focus();
    });
    this._screen.key('h', ()=> {
      this._helpView.toggle();
    });
    this._screen.key('n', this.newPlaylist.bind(this));
  }

  updatePlayListView(playlist){
    this._playlistView.showPlaylist(playlist);
  }

  onModelUpdated(){
    this._playlistsView.showPlaylists(this._playlistManager);
    let selectedIdx = this._playlistsView.selected();
    let numberOfPlaylists = this._playlistManager.getPlaylists().lenght;

    if (numberOfPlaylists > 0){
      selectedIdx = (selectedIdx >= numberOfPlaylists) ? 0 : selectedIdx;
      this._playlistsView.select(selectedIdx);
      this.updatePlayListView(this._playlistsView.getSelectedPlaylist());
    }

    this.fillAllTracksView();
  }
  
  onErrorUpdatingModel(error){
    logger.error('',error);
  }

  fillAllTracksView(){
    this._allTracksView.showList(this._popularityAutoList);
  }

  newPlaylist(){
    let questionView = new TextInputView(this._screen, style);
    questionView.ask('New Playlist: enter name', '', (err, val) => {
      if (err || val===undefined || val === null){
        return; //User pressed cancel/ESC
      }

      let playlistName = val.trim();
      this._playlistManager.newPlaylist(playlistName);
    });
  }

  _monkeyPatchScreen(){
    //monkey-add removeKeyAll
    let screen = this._screen;
    screen.removeKeyAll = function(key) {
      if (typeof key === 'string') key = key.split(/\s*,\s*/);
      key.forEach((key)=>{
        screen.removeAllListeners('key ' + key);
      });
    };
  }
  
}

module.exports = MainWindow;