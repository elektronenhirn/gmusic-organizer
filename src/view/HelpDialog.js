'use strict';

var blessed = require('blessed');
var ModalDialogBase = require('./ModalDialogBase.js');

const CONTENT =
'{white-fg}' + 
'\nGeneral\n\n' +
' h             help (show this window)\n' + 
' F5            refresh\n' +
' q             quit\n' +
' /             search for track in current view \n' +
' t             tag a tracks \n' +
' f             filter all tracks \n' +
' i             show track info\n' +
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

class HelpDialog extends ModalDialogBase{

  constructor(screen, style){
    super(screen, blessed.box({ 
      top: '50%-15',
      left: 'center',
      height: 'shrink',
      width: 'shrink',
      label: '{white-fg}{bold}Help - available controls:{/bold}{/white-fg}',
      content: CONTENT,
      tags: true,
      border: {
        type: 'line'
      },
      style: JSON.parse(JSON.stringify(style.box)), //deep copy style
    }));
  }

  onShow(){
    super.onShow();
    this._screen.key('h', ()=>{
      this.hide();
    });
    this._screen.key('escape', ()=>{
      this.hide();
    });
  }

  onHide(){
    this._screen.removeKeyAll('h');
    this._screen.removeKeyAll('escape');
    super.onHide();
  }

}

module.exports = HelpDialog;