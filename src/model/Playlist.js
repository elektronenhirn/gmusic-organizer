'use strict';

class Playlist {

  constructor(playlistManager, gmusicPlaylistObj) {
    this._playlistManager = playlistManager;
    this._entries = [];
    this._gmusicPlaylistObj = gmusicPlaylistObj;
  }

  getEntries() {
    return this._entries;
  }

  getTracks() {
    return this._entries.map((element) => element.getTrack());
  }

  getEntryAt(idx) {
    return this._entries[idx];
  }

  getEntryByTrack(track) {
    return this._entries.find((entry) => entry.getTrack() === track);
  }

  getLength() {
    return this._entries.length;
  }

  add(playlistEntry) {
    this._entries.push(playlistEntry);
    this._entries.sort((a, b) => {
      return (a.getAbsolutePosition() > b.getAbsolutePosition()) ? 1 : -1;
    });
  }

  getName() {
    return this._gmusicPlaylistObj.name;
  }

  getId() {
    return this._gmusicPlaylistObj.id;
  }

  moveEntryAfter(entry, entryBefore) {
    let entryAfter = this._getEntryAfter(entryBefore);
    this._playlistManager.moveEntry(entry, entryBefore, entryAfter);
  }

  addTrack(track, entryBefore) {
    let entryAfter = this._getEntryAfter(entryBefore);
    this._playlistManager.addTrackToPlaylist(this, track, entryBefore, entryAfter);
  }

  removeEntry(entry) {
    this._playlistManager.removeEntryFromPlaylist(this, entry);
  }

  containsTrack(track) {
    return this._entries.find((entry) => entry.getTrack() === track);
  }

  _getEntryAfter(entry) {
    let entryBeforeIdx = this._entries.indexOf(entry);
    if ((entryBeforeIdx + 1) < this._entries.length) {
      return this._entries[entryBeforeIdx + 1];
    }
    return null;
  }
}

module.exports = Playlist;