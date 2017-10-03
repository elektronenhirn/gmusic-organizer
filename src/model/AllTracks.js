'use strict';
const Track = require('./Track.js');

class AllTracks{

  constructor(pm){
    this._pm = pm;
    this._tracks = [];
  }

  fetch(){
    let self = this;
    return new Promise((resolve,reject)=>{
      try{
        self._pm.getAllTracks(function(err, library) {
          if (err){
            reject(err);
            return;
          }
          library.data.items.forEach(function(element) {
            self._tracks.push(new Track(element));
          });
          resolve();
        });
      }catch(err){
        reject(err);
      }
    });
  }

  clearPlaylistAndTagsLocally(){
    this.forEach((track)=>{
      track.clearPlaylistAndTagsLocally();
    });
  }

  getTrackById(id){
    return this._tracks.find((element) => {return element.getId() == id;});
  }

  forEach(foo){
    this._tracks.forEach(foo);
  }

  asArray(){
    return Array.from(this._tracks);
  }
}

module.exports = AllTracks;