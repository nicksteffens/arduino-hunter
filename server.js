var express = require("express");
var app = express();
var port = 3000;
var activeHunters = [];
var reservedHunters = [];

// what to serve
app.use(express.static(__dirname + '/'));
var io = require('socket.io').listen(app.listen(port), {log: false});

// connection handler
io.sockets.on('connection', function (socket) {

    // requests
    socket.on('connect', function(data){
      Workers.validate(socket, data);

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
    console.log('Global Response : ' + msg.message);
  },

  privateMessage: function(msg, socket) {
    socket.emit('message', msg);
    console.log('Private Response @'+ socket.id + ' : ' + msg.message);
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

  enlistHunter: function(hunter, socket) {
    activeHunters.push(hunter);
    var msg = {alias: 'Server', message: hunter.alias + ' has connected.'};
    Response.message(msg);
    Workers.activeHunters(socket);
  },

  enlistReserved: function(idx, socket) {
    // enlist reserve hunter
    Workers.enlistHunter(reservedHunters[idx], socket);

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
      Workers.enlistReserved(i, socket);
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
    Workers.enlistHunter(newHunter, socket);
  },

  activeHunters: function(socket) {

    var str,
        arr = [];

    if(activeHunters.length > 1) {
      var i = 0;
      while (i < activeHunters.length) {
        var hunter = activeHunters[i];
        if(hunter.id != socket.id) arr.push(hunter.alias);
        i++;
      }

      str = arr.join(', ');

      if(arr.length > 1) {
        str = str + ' are';
      } else {
        str = str + ' is';
      }

    } else {

      str = 'No other hunters are';

    }

    var msg = {
      alias: 'Server',
      message: str + ' currently connected.'
    };

    Response.privateMessage(msg, socket);

  }

};