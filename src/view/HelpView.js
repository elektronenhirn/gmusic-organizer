'use strict';

var blessed = require('blessed');

const CONTENT =
'{white-fg}' + 
'{bold}Help - available controls:{/bold}\n' +
'\nGeneral\n\n' +
' h             help (show this window)\n' + 
' F5            refresh\n' +
' q             quit\n' +
' /             search for track in current view \n' +
'\nBuilt in player\n\n' +
' p             play songs\n' + 
' s             stop playing\n' + 
' P             pause playing\n' + 
' R             resume playing\n' +
'\nPlaylist management\n\n' +
' n             create new playlist\n' + 
' del/backspace delete playlist\n' +

'\nPlaylist manipulation\n\n' +
' C-c           copy song to clipboard\n' + 
' C-x           cut song to clipboard\n' + 
' C-v           paste song into playlist\n' +
' del/backspace remove song from playlist\n' +
'{/white-fg}'; 

class HelpView {

  constructor(screen, style){
    this._screen = screen;
    this._box = blessed.box({
      top: '50%-15',
      left: 'center',
      height: 'shrink',
      width: 'shrink',
      content: CONTENT,
      tags: true,
      border: {
        type: 'line'
      },
      style: JSON.parse(JSON.stringify(style.box)), //deep copy style
    });
  }

  toggle(){
    if (this._box.visible){
      this.hide();
    } else {
      this.show();
    }
  }

  show(){
    this._screen.append(this._box);
    this._box.focus();
    this._screen.render();
  }

  hide(){    
    this._screen.remove(this._box);
    this._screen.render();
  }
}

module.exports = HelpView;