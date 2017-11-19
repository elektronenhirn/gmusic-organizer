'use strict';

const logger = require('../util/Logger.js');
const https = require('follow-redirects').https;
const fs = require('fs');
const path = require('path');

class Downloader {

  constructor(playMusic) {
    this._playMusic = playMusic;
    this._downloadFolder = path.join(process.env.HOME || process.env.USERPROFILE,'gmusic');
  }

  download(trackList, trackNr) {

    if (!trackList || trackNr >= trackList.length) {
      logger.info('no more tracks left to play');
      return;
    }

    let track = trackList[trackNr];

    if (!fs.existsSync(this._downloadFolder)){
      fs.mkdirSync(this._downloadFolder);
    }
    
    this.downloadTrack(track, path.join(this._downloadFolder,track.getName() + 'mp3'));  
  }

  downloadTrack(track, filePath){
    return new Promise((resolve)=>{
      this._getStreamUrl(track).then((url) => {
        let file = fs.createWriteStream(filePath);
        file.on('finish', function() {
          file.close();
          logger.debug('downloading ' + track.getName() + ' finished');
          resolve(track);
        });
        
        https.get(url, function(response) {
          logger.debug('downloading ' + track.getName());
          response.pipe(file);
        });
      });  
    });
  }

  downloadPlaylist(playlist){
    if (!fs.existsSync(this._downloadFolder)){
      fs.mkdirSync(this._downloadFolder);
    }

    let playlistFolder = path.join(this._downloadFolder,playlist.getName());
    if (!fs.existsSync(playlistFolder)){
      fs.mkdirSync(playlistFolder);
    }

    this._downloadNextPlaylistEntry(playlist, 0, playlistFolder);
  }

  _downloadNextPlaylistEntry(playlist, idx, playlistFolder){
    if (idx >= playlist.getLength()){
      return; //done
    }
    
    let track = playlist.getEntryAt(idx).getTrack();
    let idxAsStr = this.padTo3(idx + 1);
    let filePath = path.join(playlistFolder, idxAsStr + ' ' + track.getName() + '.mp3');
    
    this.downloadTrack(track, filePath).then(()=>{
      this._downloadNextPlaylistEntry(playlist, idx+1, playlistFolder);
    });
  }

  _getStreamUrl(track) {
    return new Promise((resolve, reject) => {
      this._playMusic.getStreamUrl(track.getId(), function (err, streamUrl) {
        if (err) {
          logger.warning('failed to download: ', err);
          return reject(err);
        }

        resolve(streamUrl);
      });
    });
  }

  padTo3(number) {
    if (number<=999) { 
      number = ('00' + number).slice(-3); 
    }
    return number;
  }

}

module.exports = Downloader;