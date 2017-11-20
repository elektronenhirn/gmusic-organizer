'use strict';

const logger = require('../util/Logger.js');
const https = require('follow-redirects').https;
const http = require('follow-redirects').http;
const fs = require('fs');
const path = require('path');
const NodeID3 = require('node-id3');

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
    logger.info('downloading playlist ' + playlist.getName());

    return new Promise((resolve)=>{
      if (!fs.existsSync(this._downloadFolder)){
        fs.mkdirSync(this._downloadFolder);
      }
  
      let playlistFolder = path.join(this._downloadFolder,playlist.getName());
      if (!fs.existsSync(playlistFolder)){
        fs.mkdirSync(playlistFolder);
      }
  
      this._downloadNextPlaylistEntry(playlist, 0, playlistFolder, resolve);  
    });
  }

  _downloadNextPlaylistEntry(playlist, idx, playlistFolder, resolve){
    if (idx >= playlist.getLength()){
      logger.info('downloading playlist ' + playlist.getName() + ' done');
      resolve();
      return; //done
    }
    
    let track = playlist.getEntryAt(idx).getTrack();
    let idxAsStr = this._padTo3(idx + 1);
    let filePath = path.join(playlistFolder, idxAsStr + ' ' + track.getName() + '.mp3');
    
    if (fs.existsSync(filePath)){
      logger.debug('skipping downloading of ' + track.getName() + ' - already up-to-date');
      this._downloadNextPlaylistEntry(playlist, idx+1, playlistFolder, resolve);      
      return;
    }

    this.downloadTrack(track, filePath).then(()=>{
      return this._embeddId3Tags(track, filePath);
    }).then(()=>{
      this._downloadNextPlaylistEntry(playlist, idx+1, playlistFolder, resolve);      
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

  _embeddId3Tags(track, filePath){

    return this._downloadArtistArt(track, filePath).then((imageBuffer)=>{
      let tags = {
        title: track._track.title,
        artist: track._track.artist,
        album: track._track.album,
        year: track._track.year,
        genre: track._track.genre,
        image: imageBuffer
      };
  
      NodeID3.write(tags, filePath);  
    });
  }

  _downloadArtistArt(track){
    if (!track._track.artistArtRef[0] || !track._track.artistArtRef[0].url){
      return Promise.resolve(null);
    }

    return new Promise((resolve)=>{
      let url = track._track.artistArtRef[0].url;

      logger.debug('downloading artist\'s photo for ' + track.getName());
      http.get(url, function(response) {
        let data = [];
        response.on('data',(chunk)=>{
          data.push(chunk);
        });
        response.on('end', ()=>{
          logger.debug('downloading artist\'s photo for ' + track.getName() + ' done');
          resolve(Buffer.concat(data));
        });
      });
    });
  }

  _padTo3(number) {
    if (number<=999) { 
      number = ('00' + number).slice(-3); 
    }
    return number;
  }

}

module.exports = Downloader;