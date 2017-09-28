'use strict';

const Playlist = require('./Playlist.js');
const PlaylistEntry = require('./PlaylistEntry.js');
const logger = require('../util/Logger.js');
const EventEmitter = require('events');

class PlaylistManager extends EventEmitter{

  constructor(pm, allTracks){
    super();
    this._pm = pm;
    this._gmusicPlaylists;
    this._gmusicPlaylistsEntries;
    this._playlists = [];
    this._playlistsById = new Object();
    this._allTracks = allTracks;
  }

  /**
   * emits 'updated' or 'error'
   */
  fetchPlaylists(){
    this._playlists = [];
    this._playlistsById = new Object();

    this._pm.getPlayLists((err, data) => {
      if (err){
        this.emit('error', new Error('failed to fetch playlists from gmusic', err));
        return;
      }

      this._gmusicPlaylists = data.data.items;
      
      this._pm.getPlayListEntries((err, library) => {
        if (err){
          this.emit('error', new Error('failed to fetch playlists entries from gmusic', err));
          return;
        }

        this._gmusicPlaylistsEntries = library.data.items;
        this._createPlaylists();
        this.emit('updated');
      });
    });
  }

  newPlaylist(name){
    this._pm.addPlayList(name, (err, mutation)=>{
      if (err){
        logger.error('failed to create Playlist ' + name, err);
        return;
      }
      
      //update our model
      this.fetchPlaylists();
    });
  }

  deletePlaylist(playlist){
    this._pm.deletePlayList(playlist.getId(), (err, mutation)=>{
      if (err){
        logger.error('failed to delete Playlist ' + playlist.getName(), err);
        return;
      }

      logger.debug('Deleted playlist ' + playlist.getName());

      //update our model
      this.fetchPlaylists();
    });
  }

  getPlaylists(){
    return this._playlists;
  }

  getPlaylist(idx){
    return this._playlists[idx];
  }

  findByName(name){
    return this._playlists.find((element) => {
      return element.getName() === name;
    });
  }

  getPlaylistsEntries(){
    return this._gmusicPlaylistsEntries;
  }

  entriesAsStringArray(){
    return this._playlists.map( (element) => {
      return element.getName();
    } ) || [];
  }

  moveEntry(entry, beforeEntry, afterEntry){
    let beforeEntryClientId = beforeEntry ? beforeEntry.getClientId() : null;
    let afterEntryClientId = afterEntry ? afterEntry.getClientId() : null;
    
    this._pm.movePlayListEntry(entry._gmusicPlaylistEntry, beforeEntryClientId,
      afterEntryClientId, (err, entries)=>{
        if (err){
          logger.error('failed to move ' + entry.getName(), err);
          return;
        }

        logger.info('moved ' + entry.getName());
        
        this.fetchPlaylists(); //re-fetch grom gmusic
      });
  }

  addTrackToPlaylist(playlist, track, entryBefore, entryAfter){
    let entryBeforeClientId = entryBefore ? entryBefore.getClientId() : null;
    let entryAfterClientId = entryAfter ? entryAfter.getClientId() : null;

    let trackId = track.getId();
    let playlistId = playlist.getId();

    this._pm.addTrackToPlayList(trackId, playlistId, (err, mutationStatus)=>{
      if (err){
        logger.error('failed to add ' + track.getName() + ' playlist', err);
        return;
      }

      logger.info('added ' + track.getName() + ' to ' + playlist.getName());
      
      this.fetchPlaylists(); //re-fetch from gmusic
    }, entryBeforeClientId, entryAfterClientId);
  }

  removeEntryFromPlaylist(playlist, entry){
    let entryId = entry.getId();
    this._pm.removePlayListEntry(entryId, (err)=>{
      if (err){
        logger.error('failed to remove ' + entry.getTrack().getName() + ' from playlist', err);
        return;
      }

      logger.info('removed ' + entry.getTrack().getName() + ' from ' + playlist.getName());

      this.fetchPlaylists(); //re-fetch from gmusic
    });
  }

  _createPlaylists(){
    let self = this;
    this._gmusicPlaylists.forEach((element) => {
      let pl = new Playlist(self, element);
      self._playlists.push(pl);
      self._playlistsById[element.id] = pl;
    });

    self._playlists.sort((a,b)=> {
      return a.getName() > b.getName() ? 1 : -1;
    });

    this._gmusicPlaylistsEntries.forEach((element)=>{
      let pl = self._playlistsById[element.playlistId];
      if (!pl){
        throw new Error('Unable to find playlist with id ' + element.playlistId);
      }

      let track = self._allTracks.getTrackById(element.trackId);
      if (!track){
        throw new Error('Playlist ' + pl.getName() + ': track with id ' + element.trackId + ' not found');
      }

      let plEntry = new PlaylistEntry(this, element, track);
      
      pl.add(plEntry);
      track.addTo(pl);
    });

  }
}

module.exports = PlaylistManager;