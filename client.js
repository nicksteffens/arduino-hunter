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

      switch(response.alias) {
        case 'server':
          label = 'label-info';
        break;
        case !Hunter.alias:
          label = 'label-warning';
        break;
        default:
          label = '';
      }

      logEntry = '<span class="label ' + label + '">' + response.alias + '</span> ' + response.message + '</br>';
      $log.append(logEntry);
    });
  }

};

// start
Hunter.setup();
