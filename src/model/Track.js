'use strict';

const tagConfig = require('../util/TagConfig.js');
class Track {

  constructor(gmusicTrackObj) {
    this._track = gmusicTrackObj;
    this._playlists = new Set();
    this._tags = new Set();
  }

  getId() {
    return this._track.id;
  }

  getArtist() {
    return this._track.artist;
  }

  getTitle() {
    return this._track.title;
  }

  getName() {
    return this._track.artist + ' - ' + this._track.title;
  }

  addPlaylistLocally(playlist) {
    this._playlists.add(playlist);
  }

  addTagLocally(tagPlaylist) {
    this._tags.add(tagPlaylist);
  }

  clearPlaylistAndTagsLocally() {
    this._tags = new Set();
    this._playlists = new Set();
  }

  tagsAsString() {
    let tagsAsArray = [...this._tags];
    return tagsAsArray.map((playlist) => {
      return playlist.getName().replace(tagConfig.getPlaylistPrefix(), '');
    });
  }

  isTaggedWith(tagName) {
    for (let tag of this._tags) {
      if (tag.getName() === tagName) {
        return true;
      }
    }

    return false;
  }

  getTags() {
    return this._tags;
  }

  popularity() {
    return this._playlists.size;
  }
}

module.exports = Track;