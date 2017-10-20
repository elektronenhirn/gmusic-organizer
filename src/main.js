#!/usr/bin/env node

'use strict';

//my utils
const credentials = require('./util/Credentials.js');
const Player = require('./util/Player.js');
const logger = require('./util/Logger.js');
global.verbose = true;
require('./util/ErrorHooks.js');

//my models
const AllTracks = require('./model/AllTracks.js');
const PlaylistManager = require('./model/PlaylistManager.js');
const PopularityAutoList = require('./model/PopularityAutoList.js');

//styles
const style = require('../styles/default.json');

//MainWindow
const MainWindow = require('./view/MainWindow.js');

//external libs
const PlayMusic = require('playmusic');
const blessed = require('blessed');

const pm = new PlayMusic();
var player = new Player(pm);

//instantiate data models
var tracks = new AllTracks(pm);
var playlistManager = new PlaylistManager(pm, tracks);
var popularityAutoList = new PopularityAutoList(tracks);

var screen = blessed.screen({
  smartCSR: true,
  dockBorders: true,
  title: 'gmusic-organizer ' + require('../package.json').version
});

var mainWindow = new MainWindow(screen,player,playlistManager,popularityAutoList);

function tryToLogin(){

  if (credentials.defined()){
    login(credentials.get()).then(()=>{
      credentials.store();
      onLoggedIn();
    }).catch((err)=>{
      logger.error('login failed: ', err);
      //login failed! Master Token exeeded?
      credentials.unsetMasterToken();
      tryToLogin();
    });
  } else {
    credentials.askUserForLogin(screen, style).then(()=>{
      logger.info('requesting master token for gmusic-organizer as ' + credentials.get().email);
      pm.login(credentials.get(), (err, result)=>{
        if (err){
          logger.error('requesting master token failed: ', err);
          //login failed! Wrong password?
          credentials.unsetPassword();
          tryToLogin();
          return;
        }

        logger.info('requesting master token succeeded');
        credentials.setMasterToken(result.masterToken);
        credentials.setAndroidId(result.androidId);      
        credentials.unsetPassword(); //pw not needed anymore
        credentials.store();
        tryToLogin();
      });
    }).catch((err)=>{
      logger.info('user canceled entering credentials - good bye');
      process.exit(0);
    });
  }
}

function login(credentials){
  return new Promise((resolve,reject)=>{
    logger.debug('login into google music as ' + credentials.email);
    pm.init(credentials, function(err){
      if (err){
        logger.error('login failed:' + err);
        return reject(err);
      }
      
      logger.info('logged into google music as ' + credentials.email);
      resolve();
    });
  });
}

function setupGlobalKeyBindings(){
  screen.key(['q', 'C-s'], function() {
    logger.info('good bye');
    return process.exit(0);
  });
  screen.key('s', function() {
    player.stop();
  });
  screen.key('b', function() {
    player.pause();
  });
  screen.key('r', function() {
    player.resume();
  });
  screen.key('f5', function() {
    logger.debug('refreshing');
    playlistManager.fetchPlaylists();
    screen.render();
    playlistManager.once('updated', ()=>{
      logger.debug('done');
    });
  });  
}

function onLoggedIn(){
  tracks.fetch()
    .then(playlistManager.fetchPlaylists.bind(playlistManager))
    .catch((err)=>{
      logger.error('failed to fetch data from server: ', err);
    });
}

setupGlobalKeyBindings();

tryToLogin();
