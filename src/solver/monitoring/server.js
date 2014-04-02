// TODO: Various derived statistics.
// TODO: Visually display the score distributions.
// TODO: Summary for all workers.
// TODO: Interval summaries (e.g. last full minute, 5 minutes, hour).
// TODO: Something additional on exhaustive start...not sure what though.
// TODO: Track statistics on improvement by exhaustive search.

var FS = require('fs');
var http = require('http');

var HamlJS = require('hamljs');
var Sass = require('node-sass');
var strftime = require('strftime');

var WorkerJournal = require('./server/worker-journal.js');

/** @variable {net.Server} */
var httpServer = null;

/** @variable {WorkerJournal[]} */
var workerJournals = [];

/**
 *
 * @param {Number} port
 */
module.exports.start = function (port) {
  if(httpServer) {
    throw new Error();
  } else {
    const ASSETS_PATH = '/assets/';

    httpServer = http.createServer(function (request, response) {
      if(request.url === '/' && request.headers['Accept'] === 'application/json' || request.url === '/index.json') {
        if(request.method === 'GET') {
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(
              JSON.stringify({
                workerJournals: workerJournals.map(function (workerJournal) { return workerJournal.serializableHash(); })
              })
          );
        } else {
          response.writeHead(405, { Allow: 'GET' });
          response.end();
        }
      } else if(request.url === '/' || request.url === '/index.html') {
        if(request.method === 'GET') {
          FS.readFile(__dirname + '/server/index.html.haml', { encoding: 'utf8' }, function (err, data) {
            if(err) {
              console.error(err);

              response.writeHead(500, { 'Content-Type': 'text/html; charset=UTF-8' });
              response.end('error: ' + err);
            } else {
              var body;
              var hamlError;

              try {
                body = HamlJS.render(data, { locals: { strftime: strftime, workerJournals: workerJournals } });
              } catch(e) {
                hamlError = e;
              }

              if(hamlError) {
                console.error(hamlError);

                response.writeHead(500, { 'Content-Type': 'text/html; charset=UTF-8' });
                response.end('error: ' + hamlError);
              } else {
                response.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
                response.end(body);
              }
            }
          });
        } else {
          response.writeHead(405, { Allow: 'GET' });
          response.end();
        }
      } else if(request.url.indexOf(ASSETS_PATH) === 0) {
        var path = request.url.substr(ASSETS_PATH.length);

        if(path.lastIndexOf('.css') === path.length - 4) {
          Sass.render({
            file: __dirname + '/server/assets/' + path + '.scss',
            success: function (css) {
              response.writeHead(200, { 'Content-Type': 'text/css' });
              response.end(css);
            },
            error: function (err) {
              console.error(err);

              response.writeHead(400, { 'Content-Type': 'text/html; charset=UTF-8' });
              response.end('error: ' + err);
            }
          });
        } else {
          FS.readFile(__dirname + '/server/assets/' + path, { encoding: 'utf8' }, function (err, data) {
            if(err) {
              console.error(err);

              response.writeHead(400, { 'Content-Type': 'text/html; charset=UTF-8' });
              response.end('error: ' + err);
            } else {
              response.writeHead(200);
              response.end(data);
            }
          });
        }
      }
      else {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('Only /index.html and /index.json served.');
      }
    });

    httpServer.on('error', function (e) {
      // TODO: Automatically increment ports if taken?
      console.error('Monitoring server failed to start on port ' + port + ':', e);
    });

    // N.B.: Totally unsecure...**do not** open to the outside world.
    httpServer.listen(port, 'localhost', function () {
      console.log('Monitoring server started at http://localhost:' + port + '/index.html');
    });
  }
};

module.exports.stop = function () {
  httpServer.close();

  httpServer = null;
};

/**
 *
 * @param {ChildProcess} worker
 */
module.exports.registerWorker = function (worker) {
  if(!httpServer) {
    throw new Error();
  } else {
    var workerJournal = new WorkerJournal(worker);

    workerJournals.push(workerJournal);

    worker.send({ name: 'monitoring-enable' });

    worker.on('message', function (message) {
      switch(message.name) {
        case 'monitoring-update':
          workerJournal.onMonitoringUpdateMessage(message.params);
      }
    })
  }
};
