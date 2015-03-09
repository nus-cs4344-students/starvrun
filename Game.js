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
    var initFlag = true;
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
        context.fillStyle = Starvrun.BG_COLOUR;
        context.fillRect(0, 0, playArea.width, playArea.height);
        
        // Render Walls (Should I re-render this?)
        //renderWalls(context);
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
        var colour = "yellow";
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
        
        for(var i =0; i<levelMap.getWidthPx()/ Starvrun.GRID_SIZE; ++i)
        {
            for(var j=0; j<levelMap.getHeightPx()/ Starvrun.GRID_SIZE; ++j)
            {
                var obj = levelMap.getMapContent(i,j);
                var posX = levelMap.gridToPx(i);
                var posY = levelMap.gridToPx(j);
                switch(obj)
                {
                    case Starvrun.PELLET:
                        renderPellet(context,posX,posY);
                        break;
                    case Starvrun.POWERUP:
                        renderPowerUp(context,posX,posY);
                        break;
                    case Starvrun.WALL:
                        renderWall(context,posX,posY);
                        break;
                    case Starvrun.FREE:
                    case Starvrun.EMPTY:
                        break; 
                    default :
                        console.log("Unhandled Case : " + obj);
                        break;  
                }                
            }
        }
        console.log("Completed Rendering Remaining Objects");
    }
    
    var renderWall = function(context,posX,posY)   
    {
        var colour = Starvrun.WALL_COLOUR;
        var block = Starvrun.GRID_SIZE /2;
        context.fillStyle = colour;
        // Find a better way to write this
        context.fillRect(posX-block,posY-block,block*2,block*2);
    }
    
    var renderPellet = function(context,posX,posY){
        var radius = 5;
        renderRoundObj(context,posX,posY,radius, Starvrun.PELLET_COLOUR);
    }
    
    var renderPowerUp = function(context,posX,posY){
        var radius = 10;
        renderRoundObj(context,posX,posY,radius,Starvrun.POWERUP_COLOUR);
    }
    
    var renderRoundObj= function(context, posX, posY, radius, colour)
    {
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
     	/*
     	while(document.readyState !== "complete") 
        {
            console.log("loading...");
	};*/
     	
        // test 
        console.log("Check");

     	// Sets up the canvas element
        playArea = document.getElementById("playArea");
        playArea.height = levelMap.getHeightPx();
        playArea.width = levelMap.getWidthPx();

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
                    pacman.checkDirectionChange("left");
                    break;
            case 38: // Up
                    pacman.checkDirectionChange("up");
                    break;
            case 39: // Right
                    pacman.checkDirectionChange("right");
                    break;
            case 40: // Down
                    pacman.checkDirectionChange("down");
                    break;
        }

    }

    var gameLoop = function() 
    {
        if(initFlag==true)
        {
            //pacman.start();
            initFlag = false;
        }    
        else
        {
            //pacman.move();
        }
        
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
        gameLoop();
        // Start drawing 
        //setInterval(function() {gameLoop();}, 1000/FRAME_RATE);
    };
};


// Defined to run the class and to check the code
var client = new Game();
setTimeout(function() {client.start();}, 500);
