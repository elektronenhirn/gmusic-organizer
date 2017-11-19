'use strict';

class PlaylistEntry {

  constructor(pm, gmusicPlaylistEntry, track) {
    this._pm = pm;
    this._gmusicPlaylistEntry = gmusicPlaylistEntry;
    this._track = track;
  }

  getArtist() {
    return this._track.getArtist();
  }

  getTitle() {
    return this._track.getTitle();
  }

  getName() {
    return this.getArtist() + ' - ' + this.getTitle();
  }

  getTrack() {
    return this._track;
  }

  getClientId() {
    return this._gmusicPlaylistEntry.clientId;
  }

  getId() {
    return this._gmusicPlaylistEntry.id;
  }

  getAbsolutePosition() {
    return parseInt(this._gmusicPlaylistEntry.absolutePosition, 10);
  }

}

module.exports = PlaylistEntry;