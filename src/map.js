/** @module pathery */

var Analyst = require(__dirname + '/analyst.js');

/**
 *
 * @param {Object} rawObject
 * @constructor Map
 */
const Map = module.exports = function (rawObject) {
  /** @member {Object} */
  this.rawObject = rawObject;

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
  /** @member {Number} */
  this.walls = parseInt(rawObject.walls);
};

Map.build = function (attributes) {
  return new Map(attributes.rawObject);
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
    rawObject: this.rawObject
  };
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
