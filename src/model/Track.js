'use strict';

class Track{

  constructor(gmusicTrackObj){
    this._track = gmusicTrackObj;
    this._playlists = new Set();
  }

  getId(){
    return this._track.id;
  }

  getArtist(){
    return this._track.artist;
  }

  getTitle(){
    return this._track.title;
  }
  
  getName(){
    return this._track.artist + ' - ' + this._track.title;
  }

  addTo(playlist){
    this._playlists.add(playlist);
  }

  removeFrom(playlist){
    this._playlists.delete(playlist);
  }

  popularity(){
    return this._playlists.size;
  }
}

module.exports = Track;