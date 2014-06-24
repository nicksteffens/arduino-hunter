var five = require("johnny-five"),
    board = new five.Board();

board.on("ready", function() {
  // Create an Led on pin 13
  var readyLED = new five.Led(13);

  // directions
  var dpad_U  = new five.Led(11),
      dpad_R  = new five.Led(10),
      dpad_D  = new five.Led(9),
      dpad_L  = new five.Led(9);


  readyLED.on();

  // make myLED available as "led" in REPL
  this.repl.inject({
      ready: readyLED,
      d_up: dpad_U,
      d_right: dpad_R,
      d_down: dpad_D,
      d_left: dpad_L,
      changeDirection: function(dir) {
        console.log('direction %o', dir);
        dir.on();

        board.wait(500, function() {

          dir.off();

        });
      }
  });
  console.log("Board Ready");

});


