// var Hunter = {

//   socket: io.connect('http://localhost:3000'),

//   init: function() {
//     Hunter.listeners.shotFired();
//     Hunter.listeners.serverResponse();

//   },

//   listeners: {

//     shotFired: function() {
//       var $shoot = $('#shoot');
//       $shoot.on({
//         click: function(e){
//           e.preventDefault();
//           Hunter.socket.emit('shotFired', {
//             id: Hunter.sid,
//             type: 'outgoing',
//             author: 'Tank',
//             text: 'Shots Fired'
//           });
//         }
//       });
//     },

//     serverResponse: function() {
//       var $outputLog = $('#outputLog')
//       Hunter.socket.on('message', function (data) {
//         if(data.response) {
//           Hunter.render.combatLog(data.response);

//         } else {
//           $outputLog.append("<span-There is a problem:", data);
//         }
//       });
//     }

//   },

//   render: {

//     combatLog: function(obj) {
//       $combatLog = $('#logOutput');
//       var entry, author, text;

//       switch(obj.type) {
//         case 'server':
//           author = '<span class="label label-warning">' + obj.author + '</span>';
//           // set session id
//           if(Hunter.sid === undefined) {
//             Hunter.sid = obj.id;
//             console.log('sid : ' + obj.id);
//           }
//         break;
//         default:
//           if (obj.id != Hunter.sid) {
//             author = '<span class="label label-important">Hostile</span>';
//           } else {
//             author = '<span class="label label">' + obj.author + '</span>';
//           }
//       }

//       entry = '<div class="entry">' + author + ' : ' + obj.text + '</div>';

//       $combatLog.append(entry);

//     }
//   }

// };
// end of hunter


var Hunter = {
  id: undefined,
  alias: undefined,
  status: false,

  init: function() {
    Hunter.listeners.setAlias();
  },

  listeners: {

    setAlias: function() {

      $('form button').on({
        click: function(e) {
          e.preventDefault();
          Hunter.alias = $(this).siblings('input').val();
          Hunter.render.ui();
          Server.getId();
        }
      });
    },

    shotFired: function() {
      console.log('shotFired');
    },

    shotHit: function() {
      console.log('shotHit');
    },

    shotMissed: function() {
      console.log('shotMissed');
    }

  },

  render: {
    ui: function() {
      $('.alias').addClass('hidden');
      $('.combatLog').removeClass('hidden');
       $('.ui').removeClass('hidden');
    },

    message: function(data) {
      var $combatLog = $('#outputLog'),
          entry;
      switch(data.author) {
        case 'Server':
          entry = '<span class="label label-warning>"' + data.author + '</span> : ' + data.text;
        break;
        default:
          entry = '<span class="label label>"' + data.author + '</span> : ' + data.text;
     }

     $combatLog.append(entry);
    }
  }


};


var Server = {
  socket: io.connect(),

  getId: function() {
    Server.socket.on('connected', function(data){
      Hunter.id = data.id;
      Hunter.status = data.status;
      console.log('Server : ' + data);
    });
    console.log('Hunter : ' + Hunter.id + ' ' + Hunter.status);
    Server.setAlias();
    Server.message();
  },

  setAlias: function() {
    Server.socket.emit('setAlias', {
      id: Hunter.id,
      alias: Hunter.alias,
      status: Hunter.active
    });
  },

  message: function() {
    Server.socket.on('serverMessage', function(data){
      Hunter.render.message(data);
    });
  }
};