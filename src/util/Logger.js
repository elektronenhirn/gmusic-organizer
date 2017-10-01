'use strict';
var fs = require('fs');
var path = require('path');

const dotFolder = require('./DotFolder.js');
const LOGFILE = path.join(dotFolder.get(), 'log.txt');

class Logger{

  constructor(){
    this._outputView = undefined;

    if (fs.existsSync(LOGFILE)){
      fs.unlinkSync(LOGFILE);      
    }

    this.stderr = (chunk) => {
      this.error(chunk);
    };
  }

  setView(outputView){
    this._outputView = outputView;
  }

  verbose(msg){
    msg = this._getTime() + ' ' + msg;
    if (global.verbose && this._outputView){
      this._outputView.grey(msg);
    }
    this.write('V ' + msg + '\n');
  }

  debug(msg){
    msg = this._getTime() + ' ' + msg;
    if (this._outputView){
      this._outputView.gray(msg);
    }
    this.write('D ' + msg + '\n');
  }

  info(msg){
    msg = this._getTime() + ' ' + msg;
    if (this._outputView){
      this._outputView.green(msg);
    }
    this.write('I ' + msg + '\n');
  }

  warning(msg){
    msg = this._getTime() + ' ' + msg;
    if (this._outputView){
      this._outputView.yellow(msg);
    }
    this.write('W ' + msg + '\n');
  }

  error(msg, error){
    msg = this._getTime() + ' ' + msg + (error || '');
    if (this._outputView){
      this._outputView.red(msg);
    }
    this.write('E ' + msg + '\n');
    if (error && error.stack){
      this.write('E ' + error.stack + '\n');
    }
  }

  write(str){
    fs.appendFileSync(LOGFILE, str);
  }

  _getTime() {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var seconds = currentTime.getSeconds();
    var millis = currentTime.getMilliseconds();

    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    if (millis < 10) {
      millis = '0' + millis;
    }
    if (millis < 100) {
      millis = '0' + millis;
    }
    return hours + ':' + minutes + ':' + seconds + '.' + millis;
  } 

}

module.exports = new Logger();