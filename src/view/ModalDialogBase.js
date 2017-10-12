'use strict';

class ModalDialogBase{
  
  constructor(screen, box){
    this._screen = screen;
    this._box = box;
  }

  show(){
    this._screen.append(this._box);
    this._box.focus();
    this._screen.render();
    this.onShow();
  }

  hide(){
    this._screen.remove(this._box);
    this._screen.render();
    this.onHide();
  }

  onShow(){
    this._screen.mainWindow.onUnFocused();
  }

  onHide(){
    this._screen.mainWindow.onFocused();    
  }

}

module.exports = ModalDialogBase;