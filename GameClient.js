/*
 * Usage: 
 *    Include in HTML body onload to run on a web page.
 *    <body onload="loadScript('', 'GameClient.js')">
 */
"use strict"; 

function GameClient() {
    // Network Variables
    var socket;         // socket used to connect to server 
    
     /*Game Variables*/
    var playArea;
    var levelMap;
    var pacman = [];
    var FRAME_RATE = 35;
    var numberOfPacman = 2;
    
    var showMessage = function(location, msg) {
        document.getElementById(location).innerHTML = msg; 
    }
    
    var appendMessage = function(location, msg) {
        var prev_msgs = document.getElementById(location).innerHTML;
        document.getElementById(location).innerHTML = "[" + new Date().toString() + "] " + msg + "<br />" + prev_msgs;
    }
    
    var sendToServer = function (msg) {
        var date = new Date();
        var currentTime = date.getTime();
        msg["timestamp"] = currentTime;
        socket.send(JSON.stringify(msg));
    }
    
    var initNetwork = function() {
        // Attempts to connect to game server
        try {
            var url= "http://" + Starvrun.SERVER_NAME + ":" + Starvrun.PORT + "/starvrun";
            console.log("Trying to connect to " + url);
            socket = new SockJS(url);
            console.log("connected");
            socket.onmessage = function (e) {
                var message = JSON.parse(e.data);
                switch (message.type) {
                case "message": 
                    appendMessage("serverMsg", message.content);
                    break;
                case "update": 
                    break;
                default: 
                    appendMessage("serverMsg", "unhandled meesage type " + message.type);
                }
            }
        } catch (e) {
            console.log("Failed to connect to " + "http://" + Starvrun.SERVER_NAME+ ":" + Starvrun.PORT);
        }
    }
    
    /************************GAME CODE ***************************************/
    
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
        renderWalls(context);
        renderGameContent(context);
        // Render Pacmans
        renderPacmans(context);
        // Render Remaining Game Objects
        renderScore();
        
    }
    
    var renderScore = function(){
        var sb = document.getElementById("scoreBoard"); 
        var scores = "<p>Scoreboard</p>";
        var i=0;
        for(i=0;i<pacman.length; i++){
             scores = scores + "<p>";
             scores = scores + (i+1) + ") " + pacman[i].getScore();
             scores = scores + "</p>";
         }
         
         sb.innerHTML = scores;
     }
    
    var renderWalls = function(context)
    {
        for(var i =0; i<levelMap.getWidth(); ++i)
        {
            for(var j=0; j<levelMap.getHeight(); ++j)
            {
                var obj = levelMap.getMapContent(i,j);
                if(obj === Starvrun.WALL)
                {                       
                    renderWall(context,i,j);
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
                        renderBlock(context,posX,posY,Starvrun.BG_COLOUR);
                        renderPellet(context,posX,posY);
                        break;
                    case Starvrun.POWERUP:
                        renderBlock(context,posX,posY,Starvrun.BG_COLOUR);
                        renderPowerUp(context,posX,posY);
                        break;
                    
                    case Starvrun.FREE:
                        renderBlock(context,posX,posY,Starvrun.BG_COLOUR);
                        break;
                    case Starvrun.WALL:
                        
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
    
    var renderWall = function(context,X,Y)   
    {
        //console.log("rendering wall at " + X + " , " + Y);
        var posX =levelMap.gridToPx(X);
        var posY = levelMap.gridToPx(Y);
        renderBlock(context,posX,posY,Starvrun.BG_COLOUR);
        // Render a thin wall.. 
        // Max posY and max posX
        var maxX = levelMap.getWidth();
        var maxY = levelMap.getHeight();
        var north = -1;
        var south = -1;
        var west = -1;
        var east = -1;
        
        if(Y !== maxY) south = levelMap.getMapContent(X,Y+1);
        if(Y !== 0) north = levelMap.getMapContent(X,Y-1);
        if(X !== maxX) east = levelMap.getMapContent(X+1,Y);
        if(X !== 0) west = levelMap.getMapContent(X-1,Y);
       //console.log("Map Content Retrieved");
        
        var width = Starvrun.WALL_WIDTH;        
        context.fillStyle = Starvrun.WALL_COLOUR;
        
        context.fillRect(posX-width/2, posY-width/2, width,width);
        
        if(north === Starvrun.WALL){
            context.fillRect(posX-width/2, posY-Starvrun.GRID_SIZE/2, width,Starvrun.GRID_SIZE/2);    
        }
        if(south === Starvrun.WALL){
            context.fillRect(posX-width/2, posY, width, Starvrun.GRID_SIZE/2);    
        }
        if(west === Starvrun.WALL){
            context.fillRect(posX-Starvrun.GRID_SIZE/2, posY-width/2, Starvrun.GRID_SIZE/2,width);    
        }
        if(east === Starvrun.WALL){
            context.fillRect(posX, posY-width/2, Starvrun.GRID_SIZE/2,width);    
        }
        
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
       var message = {
           type: "changeDirection"
       }

        switch(e.keyCode)
        {
            
            case 37: // Left 
                    message.direction = Starvrun.LEFT;
                    sendToServer(message);
                    break;
            case 38: // Up
                    message.direction = Starvrun.UP;
                    sendToServer(message);                    
                    break;
            case 39: // Right
                    message.direction = Starvrun.RIGHT;                    
                    sendToServer(message);                    
                    break;
            case 40: // Down
                    message.direction = Starvrun.DOWN;
                    sendToServer(message);                   
                    break;
            case 32: // 'Space'
                    //FOR TESTING ONLY!
                    levelMap.spawnPelletAndPowerupBetween(pacman[0].getGridPosX(), pacman[0].getGridPosY(), pacman[1].getGridPosX(), pacman[1].getGridPosY());
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
            pacman[i] = new Pacman(levelMap);    
        }
        
        pacman[0].setPositionPx(48,48);
        pacman[0].setColor("red");
        pacman[1].setPositionPx(560,48);
        pacman[1].setColor("yellow");

        levelMap.spawnPelletAndPowerupBetween(1,1,17,1);
        levelMap.spawnPelletAndPowerupBetween(1,1,1,19);
        levelMap.spawnPelletAndPowerupBetween(1,19,17,19);
        levelMap.spawnPelletAndPowerupBetween(17,1,17,19);
        
        initGUI();
        initNetwork();
        // Start drawing 
        
        setInterval(function() {gameLoop();}, 1000/FRAME_RATE);
    };

    // To check if the pacmans are colliding
    var checkCollision = function(numberOfPacman)
    {
        var i, j, condition;
        for(i=0;i<numberOfPacman;i++)
            for(j=i;j<numberOfPacman;j++)
                if(i!=j)
                {
                    condition = checkCondition(pacman[i], pacman[j]);
                    //console.log(condition);
                    if(condition)
                    {
                        // Check If same State
                        if(pacman[i].isBeast()=== pacman[j].isBeast()){
                            pacman[i].moveBack();
                            pacman[j].moveBack();
                        }else if(pacman[i].isBeast() === true && pacman[j].isBeast() == false){
                            // pacman i eat pacman j
                            if(!pacman[j].isDead()){
                                pacman[i].kill();
                                pacman[j].died();
                            }
                        }else {
                            // pacman j eat pacman i
                            if(!pacman[i].isDead()){
                                pacman[j].kill();
                                pacman[i].died();
                            }
                        }
                    }
                }
    }

    // Condition if pacmans are colliding 
    // Check for both 1 colliding with 2 and 2 colliding with 1
    var checkCondition = function(pacman1, pacman2)
    {
        if((pacman1.getGridPosX()=== pacman2.getGridPosX())&&(pacman1.getGridPosY()=== pacman2.getGridPosY()))
            return true;
        else 
            return false;
    }
}

var client = new GameClient();
client.start();