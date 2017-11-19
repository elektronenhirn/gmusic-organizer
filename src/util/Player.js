'use strict';

var StreamPlayer = require('stream-player');
const logger = require('../util/Logger.js');

class Player {

  constructor(playMusic) {
    this._playMusic = playMusic;

    this._streamPlayer = undefined;
    this._trackList = undefined;
  }

  play(trackList, trackNr) {
    this.stop();

    this._streamPlayer = new StreamPlayer();
    this._trackList = trackList;

    this._playTrackNr(trackNr);
  }

  pause() {
    if (this._streamPlayer) {
      this._streamPlayer.pause();
    }
  }

  resume() {
    if (this._streamPlayer) {
      this._streamPlayer.resume();
    }
  }

  stop() {
    if (this._streamPlayer) {
      this._streamPlayer.pause();
      delete this._streamPlayer;
      delete this._trackList;
    }
  }

  _getStreamUrl(track) {
    return new Promise((resolve, reject) => {
      this._playMusic.getStreamUrl(track.getId(), function (err, streamUrl) {
        if (err) {
          logger.warning('failed to play: ', err);
          return reject(err);
        }

        resolve(streamUrl);
      });
    });
  }

  _playTrackNr(idx) {
    if (!this._trackList || idx >= this._trackList.length) {
      logger.info('no more tracks left to play');
      return;
    }

    let track = this._trackList[idx];

    this._getStreamUrl(track)
      .then((url) => {
        if (this._streamPlayer) {
          this._streamPlayer.removeAllListeners('io error');
          this._streamPlayer.removeAllListeners('play end');

          this._streamPlayer.once('play end', () => {
            logger.verbose('song ended -> playing next');
            this._playTrackNr(idx + 1);
          }).once('io error', (err) => {
            logger.warning('streaming error (' + err + ') - stopped playing');
            this.stop();
          });
          logger.info('playing ' + track.getName());

          this._streamPlayer.add(url);
          this._streamPlayer.play();
        }
      });
  }

}

module.exports = Player;