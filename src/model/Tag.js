'use strict';

const Playlist = require('./Playlist.js');
const tagConfig = require('../util/Tagconfig.js');

class Tag extends Playlist{

  constructor(playlistManager, gmusicPlaylistObj){
    super(playlistManager, gmusicPlaylistObj);
    this.isTag = {};
  }

  getName(){
    return this._gmusicPlaylistObj.name.replace(tagConfig.getPlaylistPrefix(), '');
  }

}

module.exports = Tag;