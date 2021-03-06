/** @module pathery */

var URL = require('url');

var strftime = require('strftime');
var _ = require('underscore');

var Analyst = require(__dirname + '/analyst.js');

/**
 *
 * @param {Object} rawObject
 * @param {Object} [urlOptions]
 * @constructor Map
 */
const Map = module.exports = function (rawObject, urlOptions) {
  /** @member {Object} */
  this.rawObject = rawObject;
  /** @member {Object} */
  this.urlOptions = urlOptions;

  // The following members are stored for convenience; all are derivable from rawObject.

  /** @member {String} */
  this.code = rawObject.code;
  /** @member {Number} */
  this.height = parseInt(rawObject.height);
  /** @member {Number} */
  this.width = parseInt(rawObject.width);

  /** @member {String[][]} */
  this.board = parseBoard(this.code, this.height, this.width);

  /** @member {Number} */
  this.id = rawObject.ID;
  /** @member {String} */
  this.name = rawObject.name;
  /** @member {Number} */
  this.walls = parseInt(rawObject.walls);
};

Map.build = function (attributes) {
  return new Map(attributes.rawObject, attributes.urlOptions);
};

/**
 * A string representing the last open date for this map, e.g. `2014-04-02`.
 *
 * @returns {String}
 */
Map.prototype.dateString = function () {
  return this._dateString || (this._dateString = strftime('%Y-%m-%d', new Date((this.rawObject.dateExpires - 1) * 1000)));
};

/**
 *
 * @returns {PatheryGraph}
 */
Map.prototype.graph = function () {
  return this._graph || (this._graph = new Analyst.PatheryGraph(this.board));
};

/**
 *
 * @returns {Object}
 */
Map.prototype.serializableHash = function () {
  return {
    rawObject: this.rawObject,
    urlOptions: this.urlOptions
  };
};

/**
 * Return a URL appropriate for viewing this map in a browser, e.g. `http://www.pathery.com/scores#2014-04-02_4543_1_`.
 *
 * @returns {String}
 */
Map.prototype.url = function () {
  if(this._url === undefined) {
    if(this.urlOptions) {
      var specializedURLOptions = _.extend(
          {
            hash: '#' + this.dateString() + '_' + this.id + '_1_',
            pathname: '/scores'
          },
          this.urlOptions
      );

      this._url = URL.format(specializedURLOptions);
    } else {
      this._url = null;
    }
  }

  return this._url;
};

/**
 * The map score if no blocks have been placed.
 *
 * N.B.: It _is_ possible to get a lower score on the map by placing blocks in such a way that they force a beneficial
 *     teleport.
 *
 * @returns {Number}
 */
Map.prototype.virginalScore = function () {
  return this._virginalScore || (this._virginalScore = Analyst.find_pathery_path(this.graph(), []).value);
};

/**
 * Adapted from Therapist.parse_board for use in Map constructor.
 *
 * @private
 * @static
 *
 * @param {String} code
 * @param {Number} height
 * @param {Number} width
 * @returns {String[][]}
 */
function parseBoard(code, height, width) {
  // XXX: Could sanity check e.g. height, width, wallsRemaining, etc here using the logic in Therapist.parse_board.

  var i, j;
  var board = [];

  for (i = 0; i < height; i++) {
    var row = board[i] = [];

    for (j = 0; j < width; j++) {
      row[j] = ' ';
    }
  }

  i = -1;
  j = width - 1;

  code.split(':')[1].split('.').slice(0, -1).forEach(function (item) {
    for (var k = 0; k < parseInt(item.slice(0, -1)) + 1; k++) {
      j += 1;
      if (j >= width) {
        j = 0;
        i += 1;
      }
    }

    board[i][j] = item[item.length - 1];
  });

  return board;
}
