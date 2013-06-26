var express = require("express");
var app = express();
var port = 3000;
var activeHunters = [];
var reservedHunters = [];

// what to serve
app.use(express.static(__dirname + '/'));
var io = require('socket.io').listen(app.listen(port));

// connection handler
io.sockets.on('connection', function (socket) {

    // requests
    socket.on('connect', function(data){
      Workers.validate(socket, data);
    });

    socket.on('activeHunters', function(){
      var hunters = Workers.activeHunters();
      var msg = {
        alias: 'Server',
        message: hunters + ' are currently connected.'
      };

      if( hunters === null)
      Response.privateMessage(msg, socket);
    });

    socket.on('disconnect', function(){
      Response.disconnectHunter(socket);
    });

});

var Response = {

  disconnectHunter: function(socket) {
    for(var i = 0; i < activeHunters.length; i++) {
      if(activeHunters[i].id === socket.id) {

        console.log(activeHunters[i].alias + ' disconnected.');

        var msg = {alias: 'Server', message: '' + activeHunters[i].alias + ' disconnected.'};
        Response.message(msg);

        Workers.reserveHunter(activeHunters[i], i);
      }
    }
  },

  message: function(msg) {
    io.sockets.emit('message', msg);
    console.log(msg);
  },

  privateMessage: function(msg, socket) {
    socket.emit(msg);
    console.log('privateMessage : ' + msg);
  },

  // WARN:
  // This currently is broken
  broadcast: function(msg) {
    io.sockets.broadcast.emit('message', msg);
    console.log(msg);
  }

};

var Validate = {

  name: function(socket, data) {
    var reconnect = false,
        hunter = {
          id: socket.id,
          alias: data.alias,
          status: true
        };

    socket.set('alias', hunter.alias);

    // check if hunter is already active
    for(var i = 0; i < reservedHunters.length; i++) {
      // hunter already exists
      if(reservedHunters[i].alias == hunter.alias) {
        hunter = activeHunters[i];
        reconnect =  true;
      }
    }

    if(reconnect === false) {
      Workers.enlistHunter(hunter);

    } else {
      Workers.reservedHunter(hunter);
    }

  }
};


var Workers = {

  enlistHunter: function(hunter) {
    activeHunters.push(hunter);

    var msg = {alias: 'Server', message: hunter.alias + ' has connected.'};
    Response.message(msg);
  },

  enlistReserved: function(idx) {
    // enlist reserve hunter
    Workers.enlistHunter(reservedHunters[idx]);
    console.log(reservedHunters[idx].alias + ' has returned');

    // remove from reserved list
    reservedHunters.splice(idx, 1);

  },

  reserveHunter: function(hunter, idx) {
    // reserves
    reservedHunters.push(hunter);
    // deactivates
    if(idx !== undefined) activeHunters.splice(idx, 1);
  },

  validate: function(socket, data) {
    var reserved = false;
   // check if hunter already exists
   for(var i = 0; i < reservedHunters.length; i++) {

    if(data.alias === reservedHunters[i].alias) {
      Workers.enlistReserved(i);
      reserved = true;
    }

   }

   if(reserved !== true) {
    Workers.newHunter(socket, data);
   }

  },

  newHunter: function(socket, data) {
    // construct newHunter
    var newHunter = {
      id: socket.id,
      alias: data.alias,
      status: true
    };

    // enlist newHunter
    Workers.enlistHunter(newHunter);
  },

  activeHunters: function() {
    var str, arr;

    if(activeHunters.length() > 0) {

      for(var i = 0; i < activeHunters; i++) {
        arr.push(activeHunters[i].alias);
      }

      str = arr.join(', ');

    } else {

      str = 'No hunters';

    }

    return str;

  }

};