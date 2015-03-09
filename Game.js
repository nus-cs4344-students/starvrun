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
     * public method: print
     * 
     * To print a message in log 
     */
     this.print = function(message)
     {
        console.log(message);
     }

     /*
     * private method: showMessage(location, msg)
     *
     * Display a text message on the web page.  The 
     * parameter location indicates the class ID of
     * the HTML element, and msg indicates the message.
     *
     * The new message replaces any existing message
     * being shown.
     */
    var showMessage = function(location, msg) {
        document.getElementById(location).innerHTML = msg; 
    } 

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
    }
    
    var renderWalls = function(context)
    {
        console.log("Starting to Render Game Walls");
        
        
        console.log("Completed Rendering Game Walls");
    }
    
    var renderPacmans = function(context)
    {
        console.log("Starting to Render Pacmans");
        // For Single Pacman
        renderPacman(context, pacman);
        console.log("Completed Rendering Pacmans");
    }
    
    var renderPacman = function(context, pacman)
    {
        var colour = "#ffff00";
        var radius = 10;
        var posX = pacman.posX;
        var posY = pacman.posY;
        // Fixed For now, Check for Direction
        var sAngle = 0.25 * Math.PI;
        var eAngle = 1.75 * Math.PI;
        
        // Draw the Pacman
        context.fillStyle = colour;
        context.beginPath();
        context.arc(posX, posY, radius, sAngle, eAngle, true);
        context.closePath();
        context.fill();
    }
    
    var renderGameContent = function(context)
    {
        console.log("Starting to Render Remaining Objects");
        
        var pelletRadius = 2; 
        var powerUpRadius = 5;
        var posX = 0;
        var posY = 0;
        
        if("pellet")
        {
            renderRoundObj(context, posX, posY, pelletRadius);
        }else if("Power Up")
        {
            renderRoundObj(context, posX, posY, powerUpRadius);   
        }
        console.log("Completed Rendering Remaining Objects");
    }
    
    var renderRoundObj= function(context, posX, posY, radius)
    {
        var colour = "#ffff00";
        
         // Draw the Pacman
        context.fillStyle = colour;
        context.beginPath();
        context.arc(posX, posY, radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
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
        playArea.height = levelMap.heightPx;
        playArea.width = levelMap.widthPx;

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
                    pacman.setDirection(left);
                    break;
            case 38: // Up
                    pacman.setDirection(up);
                    break;
            case 39: // Right
                    pacman.setDirection(right);
                    break;
            case 40: // Down
                    pacman.setDirection(down);
                    break;
        }

    }

    var gameLoop = function() 
    {
        pacman.updatePosition();
        
        render();
    }

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
        levelMap = new Map();
		
        initGUI();

        // Start drawing 
        setInterval(function() {gameLoop();}, 1000/FRAME_RATE);
    }
}