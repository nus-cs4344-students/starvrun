/*
 * A skeleton for Starvrun game!
 * 
 */
function Game()
{

    /*Private Variables*/
    var playArea;
    var levelMap;
    var pacman = [];
    var FRAME_RATE = 35;
    var numberOfPacman = 2;
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
    
    this.getMap = function(){
        return levelMap;
    }

    /*
     * private method: render
     *
     * Draw the play area.  Called periodically at a rate
     * equals to the frame rate.
     */
    var render = function()
    {
        // Get context
        var context = playArea.getContext("2d");
        
        // Render Walls (Should I re-render this?)
        //renderWalls(context);
        renderGameContent(context);
        // Render Pacmans
        renderPacmans(context);
        // Render Remaining Game Objects
        renderScore();
        
    }
    
    var renderScore = function(){
         var sb = document.getElementById("scoreBoard"); 
         var scores = "Scoreboard";
         var i=0;
         for(i=0;i<pacman.length; i++){
             scores = scores + "\n";
             scores = scores + (i+1) + ") " + pacman[i].getScore();
         }
         
         sb.innerHTML = scores;

        
    }
    
    var renderWalls = function(context)
    {
        for(var i =0; i<levelMap.getWidthPx()/ Starvrun.GRID_SIZE; ++i)
        {
            for(var j=0; j<levelMap.getHeightPx()/ Starvrun.GRID_SIZE; ++j)
            {
                var obj = levelMap.getMapContent(i,j);
                var posX = levelMap.gridToPx(i);
                var posY = levelMap.gridToPx(j);
                if(obj === Starvrun.WALL)
                {                       
                    renderWall(context,posX,posY);
                }
            }
        }
    }
    
    var renderPacmans = function(context)
    {
        //console.log("Starting to Render Pacmans");
        var i;
        for(i=0;i<numberOfPacman;i++)
        {
            renderPacman(context, pacman[i]);    
        }
        //console.log("Completed Rendering Pacmans");
    }
    
    var renderPacman = function(context, pacman)
    {
        pacman.render(context);
    }
    
    var renderGameContent = function(context)
    {
        //console.log("Starting to Render Remaining Objects");
        
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
                        break;
                    case Starvrun.FREE:
                        renderBlock(context,posX,posY,Starvrun.BG_COLOUR);
                        break;
                    case Starvrun.EMPTY:
                        clearBlock(context,posX,posY);
                        break; 
                    default :
                        console.log("Unhandled Case : " + obj);
                        break;  
                }                
            }
        }
       // console.log("Completed Rendering Remaining Objects");
    }
    
    var clearBlock = function(context,posX,posY)
    {
        var block = Starvrun.GRID_SIZE/2;
        context.clearRect(posX-block, posY-block, block*2, block*2);
    }
    
    var renderBlock = function(context, posX,posY, colour){
        var block = Starvrun.GRID_SIZE /2;
        context.fillStyle = colour;
        // Find a better way to write this
        context.fillRect(posX-block,posY-block,block*2,block*2);
    }
    
    var renderWall = function(context,posX,posY)   
    {
        renderBlock(context,posX,posY,Starvrun.WALL_COLOUR);
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
        var context = playArea.getContext("2d");
        context.fillStyle = Starvrun.BG_COLOUR;
        context.fillRect(0, 0, playArea.width, playArea.height);
        renderWalls(context);
        

        // Add event handlers
        document.addEventListener("keydown", function(e) {
            //console.log("KeyPressed "  + e );
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
                    pacman[0].directionWatcher.setLeft();
                    break;
            case 38: // Up
                    pacman[0].directionWatcher.setUp();
                    break;
            case 39: // Right
                    pacman[0].directionWatcher.setRight();
                    break;
            case 40: // Down
                    pacman[0].directionWatcher.setDown();
                    break;

            case 65: // 'A' Left 
                    pacman[1].directionWatcher.setLeft();
                    break;
            case 87: // 'W' Up
                    pacman[1].directionWatcher.setUp();
                    break;
            case 68: // 'D' Right
                    pacman[1].directionWatcher.setRight();
                    break;
            case 83: // 'S' Down
                    pacman[1].directionWatcher.setDown();
                    break;
            case 32: // 'Space'
                    //FOR TESTING ONLY!
                    levelMap.spawnPelletBetween(pacman[0].getGridPosX(), pacman[0].getGridPosY(), pacman[1].getGridPosX(), pacman[1].getGridPosY());
                    break;
        }

    }

    // Where the game starts to be played
    var gameLoop = function() 
    {
        // Moves the pacman on the map always (from start to stop)
        var i;
        for(i=0;i<numberOfPacman;i++)
        {
            pacman[i].move();
            render();
        }

        // To check if the pacmans are colliding
        checkCollision(numberOfPacman);
    }

    /*
     * priviledge method: start
     *
     * Create the objects, draws the GUI, and starts the rendering 
     * loop
     * Starting game play by calling game loop
     */
    this.start = function() 
    {
        // Initialize game objects
        levelMap = new Map();
        var i;
        for(i=0;i<numberOfPacman;i++)
        {
            pacman[i] = new Pacman(this);    
        }
        
        pacman[0].setPosition(48,48);
        pacman[1].setPosition(560,48);

        initGUI();
        // Start drawing 
        setInterval(function() {gameLoop();}, 1000/FRAME_RATE);
    };

    // To check if the pacmans are colliding
    var checkCollision = function(numberOfPacman)
    {
        var i, j;
        for(i=0;i<numberOfPacman;i++)
            for(j=i;j<numberOfPacman;j++)
                if(i!=j)
                {
                    checkCondition(pacman[i], pacman[j]);
                }
    }

    // Condition if pacmans are colliding 
    // Check for both 1 colliding with 2 and 2 colliding with 1
    var checkCondition = function(pacman1, pacman2)
    {

    }

};


// Defined to run the class and to check the code
var client = new Game();
setTimeout(function() {client.start();}, 500);
