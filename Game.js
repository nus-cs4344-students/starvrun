/*
 * A skeleton for Starvrun game!
 * 
 */
function Game()
{

	var playArea;
	var FRAME_RATE = 35;
    /*
     * private method: render
     *
     * Draw the play area.  Called periodically at a rate
     * equals to the frame rate.
     */
    var render = function()
    {
        
    }

    /*
     * private method: initGUI
     *
     * Initialize a play area and add events.
     */
     var initGUI = function()
     {
     	
     	while(document.readyState !== "complete") 
     		{
     			console.log("loading...");
     		};
     	
     	// Sets up the canvas element
        playArea = document.getElementById("playArea");
        playArea.height = Map.heightPx;
        playArea.width = Map.widthPx;

        // Add event handlers
        document.addEventListener("keydown", function(e) {
            onKeyPress(e);
            }, false);
     }

     /*
      * private method: onKeyPress
      *
      * When we detect a key press, send the new
      * coordinates to the server.
      */
      var onKeyPress = function(e) 
      {
        /*
        keyCode represents keyboard button
        38: up arrow
        40: down arrow
        37: left arrow
        39: right arrow
        */

        switch(e.keyCode)
        {
        	case 37: // Left
        	case 38: // Up
        	case 39: // Right
        	case 40: // Down
        }

    }

    var gameLoop = function() 
    {
        ball.updatePosition();
        
        render();
    }  

    /*
     * priviledge method: start
     *
     * Create the objects, draws the GUI, and starts the rendering 
     * loop.
     */
    this.start = function() {
        // Initialize game objects
        pacman = new Pacman();
		
		initGUI();

        // Start drawing 
        setInterval(function() {gameLoop();}, 1000/FRAME_RATE);
    }
}