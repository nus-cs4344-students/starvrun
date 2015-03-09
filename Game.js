/*
 * A skeleton for Starvrun game!
 * 
 */
function Game()
{

    /*Private Variables*/
    var playArea;
    var levelMap;
    var pacman;
    var FRAME_RATE = 35;
    
    
    /*
     * private method: render
     *
     * Draw the play area.  Called periodically at a rate
     * equals to the frame rate.
     */
    var render = function()
    {
        console.log("Rendering Game Content")
        // Get context
        var context = playArea.getContext("2d");

        // Clears the playArea
        context.clearRect(0, 0, playArea.width, playArea.height);
        
        // Render Walls (Should I re-render this?)
        renderWalls(context);
        // Render Pacmans
        renderPacmans(context);
        // Render Remaining Game Objects
        renderGameContent(context);
        
        console.log("Completed Rendering Game Content");
    };
    
    var renderWalls = function(context){
        console.log("Starting to Render Game Walls");
        console.log("Completed Rendering Game Walls");
    };
    
    var renderPacmans = function(context){
        console.log("Starting to Render Pacmans");
        console.log("Completed Rendering Pacmans");
    };   
    
    var renderGameContent = function(context){
        console.log("Starting to Render Remaining Objects");
        console.log("Completed Rendering Remaining Objects");
    };

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
        playArea.height = levelMap.heightPx;
        playArea.width = levelMap.widthPx;

        // Add event handlers
        document.addEventListener("keydown", function(e) {
            onKeyPress(e);
            }, false);
     };

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

    };

    var gameLoop = function() 
    {
        // No Ball Here?
        ball.updatePosition();
        
        render();
    };

    /*
     * priviledge method: start
     *
     * Create the objects, draws the GUI, and starts the rendering 
     * loop.
     */
    this.start = function() 
    {
        // Initialize game objects
        pacman = new Pacman();
        
		
        initGUI();

        // Start drawing 
        setInterval(function() {gameLoop();}, 1000/FRAME_RATE);
    };
};