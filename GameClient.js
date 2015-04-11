/*
 * Usage: 
 *    Include in HTML body onload to run on a web page.
 *    <body onload="loadScript('', 'GameClient.js')">
 */
"use strict";

function GameClient(port) {
    // Network Variables
    var socket;         // socket used to connect to server 
    var PORT = port;

    /*Game Variables*/
    var playArea;
    var levelMap;
    var pacman = [];
    var FRAME_RATE = 35;
    var numberOfPacman = 4;
    var started = false;
    var player = 0;
    var delay;
    var gameTimer = Starvrun.FRAME_RATE * Starvrun.GAME_TIMER;
    var loopID =0;


    var sendPing = function () {
        var startTime = Date.now();
        var message = {};
        message.type = "ping";
        message.startTime = startTime;
        sendToServer(message);
    }

    var appendMessage = function (location, msg) {
        var prev_msgs = document.getElementById(location).innerHTML;
        document.getElementById(location).innerHTML = "[" + new Date().toString() + "] " + msg + "<br />" + prev_msgs;
    }

    var sendToServer = function (msg) {
        var date = new Date();
        var currentTime = date.getTime();
        msg["timestamp"] = currentTime;
        socket.send(JSON.stringify(msg));
    }

    var initNetwork = function () {
        // Attempts to connect to game server
        try {

            //var url= "http://" + Starvrun.SERVER_NAME + ":" + Starvrun.PORT + "/starvrun";
            var url = "http://" + Starvrun.SERVER_IP + ":" + PORT + "/starvrun";
            console.log("Trying to connect to " + url);
            socket = new SockJS(url);
            console.log("connected");
            socket.onmessage = function (e) {
                var message = JSON.parse(e.data);
                switch (message.type) {
                    case "message":
                        appendMessage("serverMsg", message.content);
                        break;
                    case "player":
                        player = message.player;
                        appendMessage("serverMsg", "You are Player " + (player + 1));
                        //console.log(player);
                        break;
                    case "startGame":
                        startGame();
                        break;
                    case "pong":
                        var RTT = Date.now() - message.startTime;
                        RTT /= 2;
                        if (delay) {
                            delay *= 0.9;
                            delay += 0.1 * RTT;
                        } else {
                            delay = RTT;
                        }
                        //console.log(delay);
                        sendToServer({type: "delay", delay: delay});
                        break;
                    case "periodic":
                        for (var j = 0; j < numberOfPacman; j++)
                        {
                            if (j == player) {
                                //var dist = levelMap.getDistance(pacman[j].getGridPosX(), pacman[j].getGridPosY(), levelMap.pxToGrid(message.posX[j]), levelMap.pxToGrid(message.posY[j]));
                                var dist = Math.abs(pacman[j].getGridPosX() - levelMap.pxToGrid(message.posX[j])) + Math.abs(pacman[j].getGridPosY() - levelMap.pxToGrid(message.posY[j]));
                                if (dist > Starvrun.DR_THRESHOLD) { //dead reckoning
                                    pacman[j].setPositionPx(message.posX[j], message.posY[j]);
                                    pacman[j].setDirection(message.direction[j]);
                                    pacman[j].setSpeed(message.speed[j]);
                                    fastForward(delay);
                                }
                            } else {
                                pacman[j].setPositionPx(message.posX[j], message.posY[j]);
                                pacman[j].directionWatcher.set(message.direction[j]);
                                pacman[j].setSpeed(message.speed[j]);
                            }
                            pacman[j].setScore(message.score[j]);
                        }
                        break;
                    case "updateMap":
                        levelMap.setChanges(message.content);
                        levelMap.implementChanges();
                        levelMap.flushChanges();
                        break;
                    case "kill":
                        pacman[message.killer].kill();
                        pacman[message.killed].died();
                        break;
                    case "moveBack":
                        pacman[message.move1].moveBack();
                        pacman[message.move2].moveBack();
                        break;
                    case "stateChanges":
                        var pm = pacman[message.pm];
                        if (message.stunned === true)
                            pm.enableStunned();
                        if (message.stunned === false)
                            pm.disableStunned();
                        if (message.beast === true)
                            pm.enableBeastMode();
                        if (message.beast === false)
                            pm.disableBeastMode();
                        if (message.respawn === true)
                            pm.respawn();
                        break;
                    case "endGame":
                        var winner = message.winner;
                        renderEndGame(winner);
                        clearInterval(loopID);
                        
                        break;
                    default:
                        appendMessage("serverMsg", "unhandled meesage type " + message.type);
                }
            }

            socket.onclose = function () {
                console.log("socket closed");
            }
        } catch (e) {
            console.log("Failed to connect to " + "http://" + Starvrun.SERVER_NAME + ":" + Starvrun.PORT);
        }
    }

    /************************GAME CODE ***************************************/

    /*
     * private method: render
     *
     * Draw the play area.  Called periodically at a rate
     * equals to the frame rate.
     */
    var render = function ()
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
        //Render Game Timer
        renderGameTimer();

    }
    
    var renderEndGame = function(winner){
        var context = playArea.getContext("2d");
        context.font = "48px serif";    
        context.strokeStyle = "yellow";
        var text = "The Game has Ended \n";
        if (winner.length == 1) {
            if (winner[0] == player) {
                text += "Congratuations ! You Have Won \n"
            } else {
                text += "Winner : Player " + winner[0] +"\n";
            }
        }else{
            text += "We have a Tie! \n"
            text += "Winners : Players";
            for(var p in winner){
                text += " " + winner[p] 
            }
        }
        
        context.strokeText(text, 0, playArea.height/2);
        
    }

    var renderScore = function () {
        var sb = document.getElementById("scoreBoard");
        var scores = "<p>Scoreboard</p>";
        var i = 0;
        for (i = 0; i < pacman.length; i++) {
            scores = scores + '<p style="color:' + pacman[i].getColor() + '">';
            scores = scores + (i + 1) + ") " + pacman[i].getScore();
            scores = scores + "</p>";
        }

        sb.innerHTML = scores;
    }

    var renderWalls = function (context)
    {
        for (var i = 0; i < levelMap.getWidth(); ++i)
        {
            for (var j = 0; j < levelMap.getHeight(); ++j)
            {
                var obj = levelMap.getMapContent(i, j);
                if (obj === Starvrun.WALL)
                {
                    renderWall(context, i, j);
                }
            }
        }
    }

    var renderPacmans = function (context)
    {
        //console.log("Starting to Render Pacmans");
        var i;
        for (i = 0; i < numberOfPacman; i++)
        {
            renderPacman(context, pacman[i]);
        }
        //console.log("Completed Rendering Pacmans");
    }

    var renderPacman = function (context, pacman)
    {
        pacman.render(context);
    }

    var renderGameContent = function (context)
    {
        //console.log("Starting to Render Remaining Objects");

        for (var i = 0; i < levelMap.getWidthPx() / Starvrun.GRID_SIZE; ++i)
        {
            for (var j = 0; j < levelMap.getHeightPx() / Starvrun.GRID_SIZE; ++j)
            {
                var obj = levelMap.getMapContent(i, j);
                var posX = levelMap.gridToPx(i);
                var posY = levelMap.gridToPx(j);
                switch (obj)
                {
                    case Starvrun.PELLET:
                        renderBlock(context, posX, posY, Starvrun.BG_COLOUR);
                        renderPellet(context, posX, posY);
                        break;
                    case Starvrun.POWERUP:
                        renderBlock(context, posX, posY, Starvrun.BG_COLOUR);
                        renderPowerUp(context, posX, posY);
                        break;

                    case Starvrun.FREE:
                        //renderBlock(context,posX,posY,Starvrun.BG_COLOUR);
                        clearBlock(context, posX, posY);
                        break;
                    case Starvrun.WALL:

                        break;
                    case Starvrun.EMPTY:
                        clearBlock(context, posX, posY);
                        break;
                    default :
                        console.log("Unhandled Case : " + obj);
                        break;
                }
            }
        }
        // console.log("Completed Rendering Remaining Objects");
    }

    var clearBlock = function (context, posX, posY)
    {

        var block = Starvrun.GRID_SIZE / 4 * 3;
        context.clearRect(posX - block, posY - block, block * 2, block * 2);
    }

    var renderBlock = function (context, posX, posY, colour) {
        var block = Starvrun.GRID_SIZE / 4 * 3;
        context.fillStyle = colour;
        // Find a better way to write this
        context.fillRect(posX - block, posY - block, block * 2, block * 2);
    }

    var renderWall = function (context, X, Y)
    {
        //console.log("rendering wall at " + X + " , " + Y);
        var posX = levelMap.gridToPx(X);
        var posY = levelMap.gridToPx(Y);
        // Render a thin wall.. 
        // Max posY and max posX
        var maxX = levelMap.getWidth();
        var maxY = levelMap.getHeight();
        var north = -1;
        var south = -1;
        var west = -1;
        var east = -1;

        if (Y !== maxY)
            south = levelMap.getMapContent(X, Y + 1);
        if (Y !== 0)
            north = levelMap.getMapContent(X, Y - 1);
        if (X !== maxX)
            east = levelMap.getMapContent(X + 1, Y);
        if (X !== 0)
            west = levelMap.getMapContent(X - 1, Y);
        //console.log("Map Content Retrieved");

        var width = Starvrun.WALL_WIDTH;
        context.fillStyle = Starvrun.WALL_COLOUR;

        context.fillRect(posX - width / 2, posY - width / 2, width, width);

        if (north === Starvrun.WALL) {
            context.fillRect(posX - width / 2, posY - Starvrun.GRID_SIZE / 2, width, Starvrun.GRID_SIZE / 2);
        }
        if (south === Starvrun.WALL) {
            context.fillRect(posX - width / 2, posY, width, Starvrun.GRID_SIZE / 2);
        }
        if (west === Starvrun.WALL) {
            context.fillRect(posX - Starvrun.GRID_SIZE / 2, posY - width / 2, Starvrun.GRID_SIZE / 2, width);
        }
        if (east === Starvrun.WALL) {
            context.fillRect(posX, posY - width / 2, Starvrun.GRID_SIZE / 2, width);
        }

    }

    var renderPellet = function (context, posX, posY) {
        var radius = Starvrun.GRID_SIZE / 8;
        renderRoundObj(context, posX, posY, radius, Starvrun.PELLET_COLOUR);
    }

    var renderPowerUp = function (context, posX, posY) {
        var radius = Starvrun.GRID_SIZE / 4;
        renderRoundObj(context, posX, posY, radius, Starvrun.POWERUP_COLOUR);
    }

    var renderRoundObj = function (context, posX, posY, radius, colour)
    {
        context.fillStyle = colour;
        context.beginPath();
        context.arc(posX, posY, radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }

    var renderGameTimer = function(){
        var gt = document.getElementById("gameTimer");
       
        var timeLeftSeconds = parseInt(gameTimer/Starvrun.FRAME_RATE) ;

         var timeLeft = "<p>Game Timer</p>" + timeLeftSeconds;

        gt.innerHTML = timeLeft;
    }
    /*
     * private method: initGUI
     *
     * Initialize a play area and add events.
     */
    var initGUI = function ()
    {
        // Sets up the canvas element
        playArea = document.getElementById("playArea");
        playArea.height = levelMap.getHeightPx();
        playArea.width = levelMap.getWidthPx();
        var context = playArea.getContext("2d");
        context.fillStyle = Starvrun.BG_COLOUR;
        context.fillRect(0, 0, playArea.width, playArea.height);
        renderWalls(context);
        render();

        // Add event handlers
        document.addEventListener("keydown", function (e) {
            //console.log("KeyPressed "  + e );
            onKeyPress(e);
        }, false);

            document.getElementById("body").addEventListener("touchend", onTouchEnd);
            document.getElementById("body").addEventListener('devicemotion', deviceMotionHandler);
    }

    // Touch handler
    var onTouchEnd = function(e)
    {
        message.type = "startGame";
        sendToServer(message);
    }

    // Device motion handler
    function deviceMotionHandler(eventData) 
    {

        var info, xyz = "[X, Y, Z]";
        
        // Grab the rotation rate from the results
        var rotation = eventData.rotationRate;
        info = xyz.replace("X", rotation.alpha);
        info = info.replace("Y", rotation.beta);
        info = info.replace("Z", rotation.gamma);
        console.log(info);       
    }

    /*
     * private method: onKeyPress
     *
     * When we detect a key press, send the new
     * coordinates to the server.
     */
    var onKeyPress = function (e)
    {
        /*
         keyCode represents keyboard button
         38: up arrow
         40: down arrow
         37: left arrow
         39: right arrow
         */
        var message = {
        }
        switch (e.keyCode)
        {

            case 37: // Left 
                message.type = "changeDirection";
                message.direction = Starvrun.LEFT;
                sendToServer(message);
                if (!pacman[player].isStunned())
                    setTimeout(pacman[player].directionWatcher.setLeft, delay);
                //setTimeout(function() {pacman[player].setPositionPx(message.posX[player], message.posY[player])}, 200);
                break;
            case 38: // Up
                message.type = "changeDirection";
                message.direction = Starvrun.UP;
                sendToServer(message);
                if (!pacman[player].isStunned())
                    setTimeout(pacman[player].directionWatcher.setUp, delay);
                //setTimeout(function() {pacman[player].setPositionPx(message.posX[player], message.posY[player])}, 200);
                break;
            case 39: // Right
                message.type = "changeDirection";
                message.direction = Starvrun.RIGHT;
                sendToServer(message);
                if (!pacman[player].isStunned())
                    setTimeout(pacman[player].directionWatcher.setRight, delay);
                //setTimeout(function() {pacman[player].setPositionPx(message.posX[player], message.posY[player])}, 200);
                break;
            case 40: // Down
                message.type = "changeDirection";
                message.direction = Starvrun.DOWN;
                sendToServer(message);
                if (!pacman[player].isStunned())
                    setTimeout(pacman[player].directionWatcher.setDown, delay);
                //setTimeout(function() {pacman[player].setPositionPx(message.posX[player], message.posY[player])}, 200);
                break;
            case 32: // 'Space'
                message.type = "startGame";
                sendToServer(message);
                //FOR TESTING ONLY!
                //levelMap.spawnPelletAndPowerupBetween(pacman[0].getGridPosX(), pacman[0].getGridPosY(), pacman[1].getGridPosX(), pacman[1].getGridPosY());
                break;
        }

    }

    var startGame = function () {
        if (started)
            return;
        started = true;
    }
    

    var runGameTimer = function () {
        if (gameTimer > 0) {
            gameTimer--;
        }

        if(gameTimer==0)
        {
            //Stop the game
            endGame();
        }
    }
    
    var endGame = function(){
        console.log("end game");
        started = false;
    }

    // Where the game starts to be played
    var gameLoop = function ()
    {

        if (started) {
            // Moves the pacman on the map always (from start to stop)
            var i;
            for (i = 0; i < numberOfPacman; i++)
            {
                pacman[i].move();
            }
            // To check if the pacmans are colliding
            checkCollision(numberOfPacman);
            render();
            runGameTimer();

        }
    }

    var fastForward = function (t)
    {
        var x = Math.round(t/(1000/Starvrun.FRAME_RATE));
        for (i = 0; i < x; i++) {
            pacman[player].move();
            checkCollision(numberOfPacman);
        }
    }

    /*
     * priviledge method: start
     *
     * Create the objects, draws the GUI, and starts the rendering 
     * loop
     * Starting game play by calling game loop
     */
    this.start = function ()
    {
        // Initialize game objects
        levelMap = new Map(false);
        levelMap.spawnPelletAndPowerupBetween(1, 1, 17, 1);
        levelMap.spawnPelletAndPowerupBetween(1, 1, 1, 19);
        levelMap.spawnPelletAndPowerupBetween(1, 19, 17, 19);
        levelMap.spawnPelletAndPowerupBetween(17, 1, 17, 19);

        initPacman();

        initGUI();
        initNetwork();
        // Start drawing 
        loopID = setInterval(function () {
            gameLoop();
        }, 1000 / FRAME_RATE);
        setInterval(function () {
            //sendPing();
        }, 3000 / FRAME_RATE);
    };
    
    this.isStarted = function(){
        return started;
    }

    var initPacman = function () {
        var i;
        for (i = 0; i < numberOfPacman; i++)
        {
            if (i == player) {
                pacman[i] = new Pacman(levelMap, true);
            } else {
                pacman[i] = new Pacman(levelMap, false);
            }
        }

        pacman[0].setStartGrid(1, 1);
        pacman[0].setStartColor("lime");
        pacman[1].setStartColor("yellow");
        pacman[1].setStartGrid(levelMap.getWidth() - 2, 1);
        pacman[2].setStartColor("pink");
        pacman[2].setStartGrid(1, levelMap.getHeight() - 2);
        pacman[3].setStartColor("cyan");
        pacman[3].setStartGrid(levelMap.getWidth() - 2, levelMap.getHeight() - 2);

    }

    // To check if the pacmans are colliding
    var checkCollision = function (numberOfPacman)
    {
        var i, j, condition;
        for (i = 0; i < numberOfPacman; i++)
            for (j = i + 1; j < numberOfPacman; j++)
                if (i != j)
                {
                    condition = checkCondition(pacman[i], pacman[j]);
                    //console.log(condition);
                    if (condition && !pacman[i].isDead() && !pacman[j].isDead())
                    {
                        // Check If same State
                        if (pacman[i].isBeast() === pacman[j].isBeast()) {
                            pacman[i].enableBlinkAnim();
                            pacman[i].moveBack();
                            pacman[j].enableBlinkAnim();
                            pacman[j].moveBack();
                        } else if (pacman[i].isBeast() === true && pacman[j].isBeast() == false) {
                            // pacman i eat pacman j
                            if (!pacman[j].isDead()) {
                                pacman[i].enableBlinkAnim();
                                pacman[i].kill();
                                pacman[j].died();
                            }
                        } else {
                            // pacman j eat pacman i
                            if (!pacman[i].isDead()) {
                                pacman[j].enableBlinkAnim();
                                pacman[j].kill();
                                pacman[i].died();
                            }
                        }
                    }
                }
    }

    // Condition if pacmans are colliding 
    // Check for both 1 colliding with 2 and 2 colliding with 1
    var checkCondition = function (pacman1, pacman2)
    {
        if (pacman1 && pacman2)
        {
            if ((pacman1.getGridPosX() === pacman2.getGridPosX()) && (pacman1.getGridPosY() === pacman2.getGridPosY()))
                return true;
            else
                return false;
        }
    }
}

//var client = new GameClient(4344);
//client.start();