'use strict';

class Ring{
  constructor(...elements){
    this._elements = elements;
    this._index = 0;
  }

  right(){
    this._index++;
    if (this._index >= this._elements.length){
      this._index = 0;
    }
    return this.current();
  }

  left(){
    this._index--;
    if (this._index < 0){
      this._index = this._elements.length-1;
    }
    return this.current();
  }

  current(){
    return this._elements[this._index];    
  }

  index(){
    return this._index;
  }
}

module.exports = Ring;