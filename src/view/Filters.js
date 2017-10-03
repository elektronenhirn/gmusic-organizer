'use strict';

class FilterByTag{

  constructor(tagName){
    this._tagName = tagName;
  }

  matches(track){
    return track.isTaggedWith(this._tagName);
  }

  getName(){
    return this._tagName; 
  }
}

class FilterUntagged{
  
  constructor(name){
    this._name = name;
  }

  matches(track){
    return track.getTags().size == 0;
  }

  getName(){
    return this._name; 
  }
}
  
module.exports = {
  FilterByTag : FilterByTag,
  FilterUntagged: FilterUntagged
};