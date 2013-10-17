var util = require('./map_util');
var getRandomInt = util.getRandomInt;
var range = util.range;
var rangeInclusive = util.rangeInclusive;

var tiles = require('./tile_types');
var map_repr = require('./map_repr');
var DenseMap = map_repr.DenseMap;

var fs = require('fs');

function randomBombsAway() {
  var m = 19, n = 19;  
  var map = new DenseMap(m, n, 0, 'Bombs Away');
  var Is = range(1, m, 2);
  var Js = range(1, n, 2);
  map.set(tiles.ROCK, Is, Js);

  map.placeRandomly(tiles.GREEN_START);
  map.placeRandomly(tiles.FINISH);
  //Tune some parameters
  map.walls = 20;
  var numExtraRocks = getRandomInt(6,8);
  map.placeRandomly(tiles.ROCK2, numExtraRocks);
  var numCheckpoints = getRandomInt(3,4);
  var numTeleports = getRandomInt(2,3);
  for (var i = 0; i < numCheckpoints; i++) {
    map.placeRandomly(tiles.CHECKPOINTS[i]);
  }
  for (var i = 0; i < numTeleports; i++) {
    map.placeRandomly(tiles.TELE_INS[i]);
    map.placeRandomly(tiles.TELE_OUTS[i]);
  }

  return map;
}
exports.randomBombsAway = randomBombsAway;

function randomLayover() {
  var m = 19, n = 13;
  var map = new DenseMap(m, n, 0, 'Layover');
  map.set(tiles.ROCK, [8, 10], [0, 1, 2, 3]);

  map.set(tiles.CHECKPOINT_1, 9, 0);
  map.set(tiles.TELE_IN_1, 9, 1);
  map.set(tiles.TELE_IN_2, 9, 2);
  map.set(tiles.TELE_IN_3, 9, 3);
  map.set(tiles.TELE_IN_4, 9, 4);

  for (var j = 0; j < n; j++) {
    map.set(tiles.GREEN_START, 0, j);
    map.set(tiles.FINISH, m-1, j);
  }

  //Tune some parameters
  map.walls = 15;
  var numExtraRocks = getRandomInt(15,19);
  map.placeRandomly(tiles.ROCK, numExtraRocks);
  for (var i = 0; i < 4; i++) {
    map.placeRandomly(tiles.TELE_OUTS[i]);
  }
  return map;
}
exports.randomLayover = randomLayover;

function randomEdgeCase() {
  var m = 20, n = 20;
  var map = new DenseMap(m, n, 0, 'Edge Case');

  var Is = range(6, m - 6);
  var Js = range(6, n - 6);
  map.set(tiles.EMPTY, Is, Js);

  //Tune some parameters
  map.walls = 22;
  var numExtraRocks = getRandomInt(13, 37);
  map.placeRandomly(tiles.ROCK, numExtraRocks);
  var numCheckpoints = 2;
  var numTeleports = 3;
  for (var i = 0; i < numCheckpoints; i++) {
    map.placeRandomly(tiles.CHECKPOINTS[i]);
  }
  for (var i = 0; i < numTeleports; i++) {
    map.placeRandomly(tiles.TELE_INS[i]);
    map.placeRandomly(tiles.TELE_OUTS[i]);
  }
  map.placeRandomly(tiles.GREEN_START);
  map.placeRandomly(tiles.FINISH);

  return map;
}
exports.randomEdgeCase = randomEdgeCase;

function randomTriage() {
  var k = 10;
  var m = 3*k + 4, n = 13;
  var map = new DenseMap(m, n, 0, 'Triage');

  //Three regions, k wide and n tall.
  //Separate the three regions.
  var allJs = range(0, n);
  map.set(tiles.EMPTY, [0,k+1, 2*k+2, 3*k+3], allJs);
  //permute the ins/outs
  var p = [3,4,0,1,2];
  var INS = [], OUTS = [];
  for (var i = 0; i < 5; i++) {
    INS.push(tiles.TELE_INS[p[i]]);
    OUTS.push(tiles.TELE_OUTS[p[i]]);
  }

  // //Put IN1 and IN2 in between the regions.
  // map.set(INS[0], k, n/2 >> 0);
  map.set(' ', k+1, n/2 >> 0);
  // map.set(INS[1], 2*k+1, n/2 >> 0);
  map.set(' ', 2*k+2, n/2 >> 0);
  //First region: Start, A,
  //Second region: Out1, B
  //Third region: Out2, C, [End]
  //Each region has a warp
  var I1 = range(1, k+1);
  var I2 = range(k+2, 2*k+2);
  var I3 = range(2*k+3, 3*k+3);

  //Tune some parameters
  map.walls = 21;
  var numExtraRocksPerArea = getRandomInt(6,16);

  map.set(tiles.GREEN_START, 0, n/2 >> 0);
  //map.placeRandomlyInArea(tiles.GREEN_START, I1, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, I1, allJs);
  map.placeRandomlyInArea(INS[2], I1, allJs);
  map.placeRandomlyInArea(OUTS[2], I1, allJs);
  map.placeRandomlyInArea(tiles.ROCK, I1, allJs, numExtraRocksPerArea);

  //map.placeRandomlyInArea(OUTS[0], I2, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_2, I2, allJs);
  map.placeRandomlyInArea(INS[3], I2, allJs);
  map.placeRandomlyInArea(OUTS[3], I2, allJs);
  map.placeRandomlyInArea(tiles.ROCK, I2, allJs, numExtraRocksPerArea);

  map.set(tiles.FINISH, m-1, n/2 >> 0);
  //map.placeRandomlyInArea(OUTS[1], I3, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_3, I3, allJs);
  map.placeRandomlyInArea(INS[4], I3, allJs);
  map.placeRandomlyInArea(OUTS[4], I3, allJs);
  map.placeRandomlyInArea(tiles.ROCK, I3, allJs, numExtraRocksPerArea);


  return map;
}
function randomYOLT() {
  var m = 25, n = 11;
  var map = new DenseMap(m, n, 0, 'You Only Live Twice');
  var allJs = range(0, n);

  //second to last column is all blank
  map.set(tiles.EMPTY, m-2, allJs);
  //last column is out1-4, in5, a-e, finish
  map.set(tiles.TELE_OUT_1, m-1, 0);
  map.set(tiles.TELE_OUT_2, m-1, 1);
  map.set(tiles.TELE_OUT_3, m-1, 2);
  map.set(tiles.TELE_OUT_4, m-1, 3);
  map.set(tiles.TELE_IN_5, m-1, 4);
  map.set(tiles.CHECKPOINT_1, m-1, 5);
  map.set(tiles.CHECKPOINT_2, m-1, 6);
  map.set(tiles.CHECKPOINT_3, m-1, 7);
  map.set(tiles.CHECKPOINT_4, m-1, 8);
  map.set(tiles.CHECKPOINT_5, m-1, 9);
  map.set(tiles.FINISH, m-1, 10);

  //place start and finish
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-3, allJs);

  var Is = range(1, m-3);
  map.placeRandomlyInArea(tiles.TELE_IN_1, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_2, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_3, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_4, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_OUT_5, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_2, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_3, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_4, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_5, Is, allJs);

  //Tune some parameters
  map.walls = 21;
  var numExtraRocks = 2+getRandomInt(17,23);
  map.placeRandomly(tiles.ROCK, numExtraRocks);

  return map;
}

function randomNoEnd() {
  var m = 25, n = 11;
  var map = new DenseMap(m, n, 0, 'No End in Sight');
  var allJs = range(0, n);

  //second to last column is all blank
  map.set(tiles.EMPTY, m-2, allJs);
  //last column is out1-5, a-e, finish
  map.set(tiles.TELE_OUT_1, m-1, 0);
  map.set(tiles.TELE_OUT_2, m-1, 1);
  map.set(tiles.TELE_OUT_3, m-1, 2);
  map.set(tiles.TELE_OUT_4, m-1, 3);
  map.set(tiles.TELE_OUT_5, m-1, 4);
  map.set(tiles.CHECKPOINT_1, m-1, 5);
  map.set(tiles.CHECKPOINT_2, m-1, 6);
  map.set(tiles.CHECKPOINT_3, m-1, 7);
  map.set(tiles.CHECKPOINT_4, m-1, 8);
  map.set(tiles.CHECKPOINT_5, m-1, 9);
  map.set(tiles.FINISH, m-1, 10);

  //place start
  map.set(tiles.GREEN_START, 0, allJs);
  //map.set(tiles.FINISH, m-3, allJs);

  var Is = range(1, m-2);
  map.placeRandomlyInArea(tiles.TELE_IN_1, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_2, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_3, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_4, Is, allJs);
  map.placeRandomlyInArea(tiles.TELE_IN_5, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_2, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_3, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_4, Is, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_5, Is, allJs);

  //Tune some parameters
  map.walls = 21;
  var numExtraRocks = 3+getRandomInt(17,23);
  map.placeRandomly(tiles.ROCK, numExtraRocks);

  return map;
}

function randomDoubleNormal() {
  var k = 9;
  var m = 15, n = 2*k+1;
  var map = new DenseMap(m, n, 0, 'Double Normal');
  var allIs = range(0, m);
  var J1 = range(0,k);
  var J2 = range(k+1, 2*k+1);

  //middle row is empty
  map.set(tiles.EMPTY, allIs, k);
  //put top start and finish
  map.set(tiles.GREEN_START, 0, J1);
  map.set(tiles.FINISH, m-1, J1);
  //put bot start and finish
  map.set(tiles.RED_START, m-1, J2);
  map.set(tiles.FINISH, 0, J2);

  //Tune some parameters
  map.walls = getRandomInt(17, 19);
  var numCheckpoints;
  if (Math.random() < .75) {
    numCheckpoints = 2;
  } else {
    numCheckpoints = 3;
  }
  for (var i = 0; i < numCheckpoints; i++) {
    map.placeRandomlyInArea(tiles.CHECKPOINTS[i], allIs, J1);
    map.placeRandomlyInArea(tiles.CHECKPOINTS[i], allIs, J2);
  }

  var numExtraRocks = getRandomInt(11,15);
  map.placeRandomlyInArea(tiles.ROCK, allIs, J1, numExtraRocks);
  map.placeRandomlyInArea(tiles.ROCK, allIs, J2, numExtraRocks);

  return map;
}

function randomRaceCondition() {
  var k = 9;
  var m = 15, n = 2*k+1;
  var map = new DenseMap(m, n, 0, 'Race Condition');
  var allIs = range(0, m);
  var J1 = range(0,k);
  var J2 = range(k+1, 2*k+1);

  //middle row is empty
  map.set(tiles.EMPTY, allIs, k);
  //put top start and finish
  map.set(tiles.GREEN_START, 0, J1);
  map.set(tiles.FINISH, m-1, J1);
  //put bot start and finish
  map.set(tiles.GREEN_START, 0, J2);
  map.set(tiles.FINISH, m-1, J2);

  //Tune some parameters
  map.walls = getRandomInt(17, 19);
  var numCheckpoints;
  if (Math.random() < .15) {
    numCheckpoints = 2;
  } else {
    numCheckpoints = 3;
  }
  for (var i = 0; i < numCheckpoints; i++) {
    map.placeRandomlyInArea(tiles.CHECKPOINTS[i], allIs, J1);
    map.placeRandomlyInArea(tiles.CHECKPOINTS[i], allIs, J2);
  }

  var numExtraRocks = getRandomInt(11,15);
  map.placeRandomlyInArea(tiles.ROCK, allIs, J1, numExtraRocks);
  map.placeRandomlyInArea(tiles.ROCK, allIs, J2, numExtraRocks);

  return map;

}

function randomFunlimited() {
  var m = 17, n = 9;
  var map = new DenseMap(m, n, 0, 'Funlimited');
  var allJs = range(0,n);

  //start and finish cols
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-1, allJs);
  //a warp
  map.placeRandomly(tiles.TELE_IN_1);
  map.placeRandomly(tiles.TELE_OUT_1);

  //Tune some parameters
  map.walls = 888;
  var numCheckpoints = getRandomInt(3,4);
  for (var i = 0; i < numCheckpoints; i++) {
    map.placeRandomly(tiles.CHECKPOINTS[i]);
  }

  var numExtraRocks = getRandomInt(7,11);
  map.placeRandomly(tiles.ROCK, numExtraRocks);

  var numPatches = getRandomInt(11,15);
  map.placeRandomly(tiles.PATCH, numPatches);

  return map;
}

function randomBAAAAAAA() {
  var m = 19, n = 15;
  var map = new DenseMap(m, n, 0, 'BAAAAAAA');

  var allJs = range(0,n);

  //start and finish cols
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-1, allJs);
  //7 As and a B
  //As can't be on left column
  var mostIs = range(2, m);
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, mostIs, allJs, 7);
  map.placeRandomly(tiles.CHECKPOINT_2, 1);

  //Tune some parameters
  map.walls = getRandomInt(17, 23) + 15;
  var numExtraRocks = getRandomInt(19, 38);
  map.placeRandomly(tiles.ROCK, numExtraRocks);

  return map;
}

//used for the map type below
//spotsX and spotsY should be the same length
function isSeparated(spotsX, spotsY) {
  for (var i = 0; i < spotsX.length; i++) {
    for (var j = i+1; j < spotsX.length; j++) {
      //make sure i and j are far apart enough
      if (!(Math.abs(spotsX[i]-spotsX[j]) > 2 ||
            Math.abs(spotsY[i]-spotsY[j]) > 2)) {
        return false;
      }
    }
  }

  return true;
}

function randomEntanglement() {
  var m = 19, n = 19;
  var map = new DenseMap(m, n, 0, 'Entanglement');

  //start corners
  map.set(tiles.GREEN_START, 0, 0);
  map.set(tiles.RED_START, m-1, n-1);
  //finish corners
  map.set(tiles.FINISH, m-1, 0);
  map.set(tiles.GREEN_THROUGH_ONLY, m-2, 0);
  map.set(tiles.GREEN_THROUGH_ONLY, m-1, 1);
  map.set(tiles.FINISH, 0, n-1);
  map.set(tiles.RED_THROUGH_ONLY, 0, n-2);
  map.set(tiles.RED_THROUGH_ONLY, 1, n-1);
  
  //2 As, Bs, Cs = 6 spots
  var done = false;
  var SPOTS = 6;
  //make a list of separated places
  while (!done) {
    spotsX = []; //vertical... lol
    spotsY = [];
    for (var i = 0; i < SPOTS; i++) {
      spotsX[i] = getRandomInt(2, m-3);
      spotsY[i] = getRandomInt(2, n-3);
    }
    done = isSeparated(spotsX, spotsY);
  }
  
  var CPS = [tiles.CHECKPOINT_1, tiles.CHECKPOINT_1,
             tiles.CHECKPOINT_2, tiles.CHECKPOINT_2,
             tiles.CHECKPOINT_3, tiles.CHECKPOINT_3];
  var WALLS = [tiles.GREEN_THROUGH_ONLY, tiles.RED_THROUGH_ONLY,
               tiles.GREEN_THROUGH_ONLY, tiles.RED_THROUGH_ONLY,
               tiles.GREEN_THROUGH_ONLY, tiles.RED_THROUGH_ONLY];
  var dxs = [-1, 1,  0, 0];
  var dys = [ 0, 0, -1, 1];

  for (var i = 0; i < SPOTS; i++) {
    map.set(CPS[i], spotsX[i], spotsY[i]);
    for (var j = 0; j < 4; j++) {
      map.set(WALLS[i], spotsX[i] + dxs[j], spotsY[i] + dys[j]);
    }
  }

  //Tune some parameters
  map.walls = getRandomInt(20,20);
  var numExtraRocks = getRandomInt(19, 38);
  map.placeRandomly(tiles.ROCK, numExtraRocks);

  return map;
}

function randomTiming() {
  var k = 19, n = 9;
  var m = k + 6;

  var map = new DenseMap(m, n, 0, 'timINg');

  var allJs = range(0, n);

  //start and finish columns
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, k-1, allJs);

  //paint the right side all black
  var mostIs = range(0, k);
  var restIs = range(k, m);
  map.set(tiles.EMPTY, restIs, allJs);

  //A, B, C
  map.placeRandomlyInArea(tiles.CHECKPOINT_1, mostIs, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_2, mostIs, allJs);
  map.placeRandomlyInArea(tiles.CHECKPOINT_3, mostIs, allJs);

  //In1 and Out2-5
  map.placeRandomlyInArea(tiles.TELE_IN_1, mostIs, allJs);
  map.placeRandomlyInArea(tiles.TELE_OUT_2, mostIs, allJs);
  map.placeRandomlyInArea(tiles.TELE_OUT_3, mostIs, allJs);
  map.placeRandomlyInArea(tiles.TELE_OUT_4, mostIs, allJs);
  map.placeRandomlyInArea(tiles.TELE_OUT_5, mostIs, allJs);

  //weird right side thing
  //np is the vertical middle of the map
  var np = n / 2 >> 0
  var mp = k + 3;
  map.set(tiles.TELE_OUT_1, mp, np);
  //do each spoke
  map.set(tiles.TELE_IN_2, mp, np-1);
  map.set(tiles.CHECKPOINT_1, mp, np-2);
  map.set(tiles.TELE_IN_3, mp+1, np);
  map.set(tiles.CHECKPOINT_2, mp+2, np);
  map.set(tiles.TELE_IN_4, mp, np+1);
  map.set(tiles.CHECKPOINT_3, mp, np+2);
  map.set(tiles.TELE_IN_5, mp-1, np);
  map.set(tiles.FINISH, mp-2, np);

  //Tune some parameters
  map.walls = getRandomInt(18,18);
  var numExtraRocks = getRandomInt(10, 20);
  map.placeRandomlyInArea(tiles.ROCK, mostIs, allJs, numExtraRocks);

  return map;
}

function randomInfinite() {
  var m = 18, n = 9;
  var map = new DenseMap(m, n, 0, 'INfinite');

  var allJs = range(0, n);
  //start and finish columns
  map.set(tiles.GREEN_START, 0, allJs);
  map.set(tiles.FINISH, m-1, allJs);

  //INs
  for (var i = 0; i < 5; i++) {
    map.set(tiles.TELE_INS[i], m-2, 2*i);
  }

  //randomly place OUTs
  var mostIs = range(1, m-3);
  for (var i = 0; i < 5; i++) {
    map.placeRandomlyInArea(tiles.TELE_OUTS[i], mostIs, allJs);
  }

  //Tune some parameters
  map.walls = getRandomInt(15,15);
  var numExtraRocks = getRandomInt(12, 22);
  map.placeRandomlyInArea(tiles.ROCK, mostIs, allJs, numExtraRocks);

  return map;
}
function addMap(map_arr, map) {
  var mapStr = map.myName + ':\n';
  //mapStr += map.forumMapCode();
  mapStr += map.toMapCode();
  map_arr.push(mapStr);
}

function forumAddMap(map_arr, map) {
  var mapStr = map.myName + ':\n';
  mapStr += '[code]\n';
  mapStr += map.forumMapCode() + '\n';
  mapStr += '[/code]\n';
  map_arr.push(mapStr);
}

var main = function() {
  var maps = [];
  forumAddMap(maps, randomBAAAAAAA());
  forumAddMap(maps, randomLayover());
  forumAddMap(maps, randomBombsAway());
  forumAddMap(maps, randomEdgeCase());
  forumAddMap(maps, randomTriage());
  forumAddMap(maps, randomYOLT());
  forumAddMap(maps, randomNoEnd());
  forumAddMap(maps, randomDoubleNormal());
  forumAddMap(maps, randomRaceCondition());
  forumAddMap(maps, randomFunlimited());
  forumAddMap(maps, randomEntanglement());
  forumAddMap(maps, randomTiming());
  forumAddMap(maps, randomInfinite());
  
  var outStr = maps.join('\n');
  // var code = "13x7.c1.r10.w9.t0.Simple.:0s.0r.10f.0s.5r.5f.0s.0r.6r.1r.1f.0s.11f.0s.2r.4a.3f.0s.1r.4r.4f.0s.2r.6r.1f.";

  // var map = parseMapCode(code);
  // outStr = '';
  // outStr += map.dilate(3).toMapCode();

  fs.writeFileSync('out.txt', outStr);
  return;
}

if (require.main === module) {
  main();
}

