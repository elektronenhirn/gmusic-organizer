'use strict';

const dotFolder = require('./DotFolder.js');
const tagsFile = require('user-settings').file('.gmusic-organizer/tags');

const DEFAULT_TAGS = {
  lang: ['en','de','fr','it'],
  mood:['sad','aggressive','happy'],
  tempo:['slow', 'moderate', 'fast']
};
const DEFAULT_PLAYLIST_PREFIX = 'zz [Tag]';

class TagConfig{

  constructor(){
    dotFolder.prepare();
    this._tags = this._getOrDefault('tags', DEFAULT_TAGS);
    this._playlistPrefix = this._getOrDefault('playlistPrefix', DEFAULT_PLAYLIST_PREFIX);
  }

  getTags(){
    let tags = [];
    Object.keys(this._tags).forEach((key)=>{
      tags = tags.concat(this._tags[key].map(value=> key + ':'  + value));
    });

    return tags;
  }

  getPlaylistPrefix(){
    return this._playlistPrefix;
  }

  _getOrDefault(name, defaultVal){
    let val = tagsFile.get(name);
    if (!val){
      val = defaultVal;
      tagsFile.set(name, defaultVal);
    }

    return val;
  }

  isTagPlaylist(name){
    return name.startsWith(this.getPlaylistPrefix());
  }

}

module.exports = new TagConfig();
