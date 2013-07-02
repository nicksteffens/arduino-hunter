var Hunter = {

  setup: function() {
    Hunter.setAlias();

  },

  setAlias: function() {
    $('form button').on({
        click: function(e) {
          e.preventDefault();
          Hunter.alias = $(this).siblings('input').val();
          Request.message();
          Request.id();
        }
      });

    Listeners.shot();


  }
};

var Listeners = {

  shot: function() {
    $('#shoot').on({
      click: function(e) {
        e.preventDefault();
        console.log('Request : Shot');
        Request.shot();
      }
    });
  }

};

var Request = {
  socket: io.connect(),

  id: function() {
    // ask the socket for id
    Request.socket.emit('connect', {
      id: undefined,
      alias: Hunter.alias,
      status: undefined
    });

  },

  hunters: function() {
    // request active hunters
    Request.socket.emit('activeHunters');

  },

  message: function() {
    var $log = $('#logOutput');
    Request.socket.on('message', function(response) {
      var label, logEntry;

      if(response.alias == 'Server') {
        label = '';

      } else if(response.alias == Hunter.alias) {
        label = 'label-info';

      } else {
        label = 'label-warning';
      }

      logEntry = '<span class="label ' + label + '">' + response.alias + '</span> ' + response.message + '</br>';
      $log.append(logEntry);
    });
  },

  shot: function() {
    Request.socket.emit('shot');
  }

};

// start
Hunter.setup();
