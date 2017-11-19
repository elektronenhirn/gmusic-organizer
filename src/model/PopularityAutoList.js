'use strict';

class PopularityAutoList {

  constructor(allTracks) {
    this._tracks = allTracks;
  }

  getName() {
    return 'All Tracks [sorted by popularity]';
  }

  getTracks() {
    return this._tracks.asArray().sort((a, b) => {
      return a.popularity() < b.popularity();
    });
  }

}

module.exports = PopularityAutoList;