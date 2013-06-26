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

    // socket connected
    Request.socket.on('connected', function(response){
      Hunter.id = response.id,
      Hunter.alias = response.alias,
      Hunter.status = response.status;

      console.log('Response : connect : %o', Hunter.id, Hunter.alias, Hunter.status);

      Request.hunters();
    });

    // socket reconnected
    Request.socket.on('reconnect', function(response){
      Hunter.id = response.id,
      Hunter.alias = response.alias,
      Hunter.status = response.status;

      console.log('Response : reconnect : %o', Hunter.id, Hunter.alias, Hunter.status);
    });
  },

  hunters: function() {

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
