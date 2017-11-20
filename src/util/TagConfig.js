'use strict';

const dotFolder = require('./DotFolder.js');
const tagsFile = require('user-settings').file('.gmusic-organizer/tags');

const DEFAULT_TAGS = {
  lang: ['en', 'de', 'fr', 'it', 'other'],
  genre: ['electro', 'rock', 'pop', 'indie', 'folk', 'schlager', 'hiphop', 'soul', 'reggae', 'other']
};
const DEFAULT_PLAYLIST_PREFIX = 'zz [tag] ';

class TagConfig {

  constructor() {
    dotFolder.prepare();
    this._tags = this._getOrDefault('tags', DEFAULT_TAGS);
    this._playlistPrefix = this._getOrDefault('playlistPrefix', DEFAULT_PLAYLIST_PREFIX);
  }

  getQualifiedTags() {
    let tags = [];
    Object.keys(this._tags).forEach((key) => {
      tags = tags.concat(this._tags[key].map(value => key + ':' + value));
    });

    return tags;
  }

  getQualifiedTag(categoryIdx, tagIdx) {
    let category = Object.keys(this._tags)[categoryIdx];
    return category + ':' + this._tags[category][tagIdx];
  }

  getConfig() {
    return this._tags;
  }

  getMaxNumberOfTagsPerCategory() {
    let max = 0;
    Object.keys(this._tags).forEach((key) => {
      max = Math.max(max, this._tags[key].length);
    });
    return max;
  }

  getPlaylistPrefix() {
    return this._playlistPrefix;
  }

  isTagPlaylist(name) {
    return name.startsWith(this.getPlaylistPrefix());
  }

  _getOrDefault(name, defaultVal) {
    let val = tagsFile.get(name);
    if (!val) {
      val = defaultVal;
      tagsFile.set(name, defaultVal);
    }

    return val;
  }

}

module.exports = new TagConfig();
