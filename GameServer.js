"use strict";

var LIB_PATH = "./";
require(LIB_PATH + "Starvrun.js");
require(LIB_PATH + "Map.js");
require(LIB_PATH + "Pacman.js");
require(LIB_PATH + "Player.js");

function GameServer(gport) {

    // Server Variables
    var port = gport;         // Game port 
    var IP;           // Game IP
    var count = 0;        // Keeps track how many people are connected to server 
    var availablePIDs = [3, 2, 1, 0]; // In reverse order to allow easy popping
    var nextPID;      // PID to assign to next connected player (i.e. which player slot is open) 
    var gameInterval; // Interval variable used for gameLoop 
    var sockets = {};      // Associative array for sockets, indexed via player ID
    var players = {};      // Associative array for players, indexed via socket ID
    var started = false; 
    var playerNumber = []; //Winning player or players

    /*Game Variables*/
    var levelMap;
    var pacman = [];
    var numberOfPacman = 4;
    var FRAME_RATE = 35;
    var loopID ;

    var gameTimer = Starvrun.FRAME_RATE * Starvrun.GAME_TIMER ;

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
        console.log("Game Ended");
        var msg = {};
        msg.type = "endGame";
        msg.winner = maxScorePlayerCount();
        broadcast(msg);
        clearInterval(loopID);

        setTimeout(reset, 500);
        
    }

    var broadcast = function (msg) {
        var id;
        for (id in sockets) {
            // Workaround to get delay
            for (var p in players) {
                if (players[p].pid == id) {
                    setTimeout(unicast, 0, sockets[id], msg);
                    //setTimeout(unicast, 500, sockets[id],msg);
                    break;
                }
            }
            //setTimeout(unicast, p.getDelay() ,sockets[id], msg);
            //setTimeout(unicast, 0 ,sockets[id], msg);
        }
    }

    var unicast = function (socket, msg) {
        var date = new Date();
        var currentTime = date.getTime();
        msg["timestamp"] = currentTime;
        socket.write(JSON.stringify(msg));
    }

    var newPlayer = function (conn) {
        count++;

        if (availablePIDs.length <= 0) {
            unicast(conn, {type: "message", content: "Server Full"});
            conn.close();
            return;
        } else {
            // Allocate based on available PIDS
            var pid = availablePIDs.pop();
            players[conn.id] = new Player(conn.id, pid);
            sockets[pid] = conn;
            // Send message to new player (the current client)
            unicast(conn, {type: "player", player: pid});
        }

    }

    this.start = function () {
        try {
            var express = require('express');
            var http = require('http');
            var sockjs = require('sockjs');
            var sock = sockjs.createServer();

            reset();

            gameInterval = undefined;
            IP = Starvrun.SERVER_IP;

            // Upon connection established from a client socket
            sock.on('connection', function (conn) {
                console.log("connected");
                // Sends to client
                broadcast({type: "message", content: "There is now " + count + " players"});

                // create a new player
                newPlayer(conn);

                // When the client closes the connection to the server/closes the window
                conn.on('close', function () {
                    var p = players[conn.id];
                    //add back the pid
                    availablePIDs.push(p.pid);
                    delete sockets[p.pid];
                    delete players[conn.id];
                });

                // When the client send something to the server.
                conn.on('data', function (data) {
                    var message = JSON.parse(data);
                    var p = players[conn.id];

                    if (p === undefined) {
                        // we received data from a connection with no 
                        // corresponding player.  don't do anything.
                        return;
                    }

                    switch (message.type) {
                        case "startGame":
                            if (!started) {
                                started = true;
                                startGame();
                            }
                            broadcast({type: "message", content: "Game Started"});
                            console.log("Game Started");
                            break;
                        case "changeDirection":
                            var pid = p.pid; // get player sending the update
                            var pm = pacman[pid];
                            var direction = message.direction;
                            
                            if (started && !pm.isDead()) {
                                switch (direction) {
                                    case Starvrun.UP:
                                        if (!pm.isStunned())
                                            pm.directionWatcher.setUp();
                                        break;
                                    case Starvrun.DOWN:
                                        if (!pm.isStunned())
                                            pm.directionWatcher.setDown();
                                        break;
                                    case Starvrun.LEFT:
                                        if (!pm.isStunned())
                                            pm.directionWatcher.setLeft();
                                        break;
                                    case Starvrun.RIGHT:
                                        if (!pm.isStunned())
                                            pm.directionWatcher.setRight();
                                        break;
                                    default:
                                        console.log("unexpected direction : " + direction);
                                }
                            }
                            break;
                        case "delay":
                            var p = players[conn.id];
                            p.delay = message.delay;
                            //console.log(p.delay);
                            break;
                        case "ping":
                            var msg = {};
                            msg.type = "pong";
                            msg.startTime = message.startTime;
                            var s = sockets[players[conn.id].pid];
                            unicast(s, msg);
                            break;
                        default:
                            console.log("Unhandled " + message.type);
                    }
                }); // conn.on("data"
            }); // socket.on("connection"

            // Standard code to starts the Pong server and listen
            // for connectionpn
            var app = express();
            var httpServer = http.createServer(app);
            sock.installHandlers(httpServer, {prefix: '/starvrun'});
            httpServer.listen(port, IP);
            app.use(express.static(__dirname));
            console.log("Server running on http://" + IP + ":" +
                    port + "\n");
            console.log("Visit http://" + IP + ":" + port +
                    "/index_net.html in your browser to start the game");

        } catch (e) {
            console.log("Cannot listen to " + port);
            console.log("Error: " + e);
        }


    }

    this.isFull = function () {
        return started || (players.length >= 4);
    }

    this.getPort = function () {
        return port;
    }

    // Where the game starts to be played
    var gameLoop = function ()
    {
        runGameTimer();
        for (var i in pacman)
        {
            pacman[i].move();
        }

        if (levelMap.getPelletNumber() < Starvrun.PELLET_THRESHOLD) {
            // pacman[0].getGridPosX(), pacman[0].getGridPosY(), 
            // pacman[1].getGridPosX(), pacman[1].getGridPosY(),
            // pacman[2].getGridPosX(), pacman[2].getGridPosY(),
            // pacman[3].getGridPosX(), pacman[3].getGridPosY(),
            var x1,y1,x2,y2,x3,y3,x4,y4;
            if (pacman[0].isDead()) {
                x1 = 1;
                y1 = 1;
            } else {
                x1 = pacman[0].getGridPosX();
                y1 = pacman[0].getGridPosY();
            }
            if (pacman[1].isDead()) {
                x2 = 17;
                y2 = 1;
            } else {
                x2 = pacman[1].getGridPosX();
                y2 = pacman[1].getGridPosY();
            }
            if (pacman[2].isDead()) {
                x3 = 1;
                y3 = 19;
            } else {
                x3 = pacman[2].getGridPosX();
                y3 = pacman[2].getGridPosY();
            }
            if (pacman[3].isDead()) {
                x4 = 17;
                y4 = 19;
            } else {
                x4 = pacman[3].getGridPosX();
                y4 = pacman[3].getGridPosY();
            }
            var random = Math.floor(Math.random() * 3.0);
            if (random==0) {
                levelMap.spawnPelletAndPowerupBetween(x1, y1, x2, y2);
                levelMap.spawnPelletAndPowerupBetween(x2, y2, x3, y3);
                levelMap.spawnPelletAndPowerupBetween(x3, y3, x4, y4);
                levelMap.spawnPelletAndPowerupBetween(x4, y4, x1, y1);
            } else if (random==1) {
                levelMap.spawnPelletAndPowerupBetween(x1, y1, x2, y2);
                levelMap.spawnPelletAndPowerupBetween(x2, y2, x4, y4);
                levelMap.spawnPelletAndPowerupBetween(x4, y4, x3, y3);
                levelMap.spawnPelletAndPowerupBetween(x3, y3, x1, y1);
            } else {
                levelMap.spawnPelletAndPowerupBetween(x1, y1, x3, y3);
                levelMap.spawnPelletAndPowerupBetween(x3, y3, x2, y2);
                levelMap.spawnPelletAndPowerupBetween(x2, y2, x4, y4);
                levelMap.spawnPelletAndPowerupBetween(x4, y4, x1, y1);
            }
        }
        // To check if the pacmans are colliding
        checkCollision(numberOfPacman);

        // Moves the pacman on the map always (from start to stop)
        sendPeriodicUpdate();
        sendMapChanges();
        sendStateChanges();
        checkEndGame();

    }
    
    var checkEndGame = function(){
        var toEnd = 0;
        for(var p in pacman){
            if(!pacman[p].isDead()){
                toEnd ++;
            }
        }
        
        if(toEnd == 1){
            endGame();
        }
    }

    var sendStateChanges = function () {
        //Stun/Beast Mode Update 
        for (var i in pacman)
        {
            var message = {};
            var toSend = false;
            message.type = "stateChanges";
            message.pm = i;
            if (pacman[i].isStunned() && !pacman[i].stunUpdated) {
                pacman[i].stunUpdated = true;
                message.stunned = true;
                toSend = true;

            }

            if (!pacman[i].isStunned() && pacman[i].stunUpdated) {
                pacman[i].stunUpdated = false;
                message.stunned = false;
                toSend = true;
            }

            if (pacman[i].isBeast() && !pacman[i].beastUpdated) {
                pacman[i].beastUpdated = true;
                message.beast = true;
                toSend = true;
            }

            if (!pacman[i].isBeast() && pacman[i].beastUpdated) {
                pacman[i].beastUpdated = false;
                message.beast = false;
                toSend = true;
            }

            if (!pacman[i].isDead() && pacman[i].deadUpdated) {
                pacman[i].deadUpdated = true;
                message.respawn = true;
                toSend = true;
            }
            if (toSend)
                setTimeout(broadcast, 0, message);
        }
    }

    var sendPeriodicUpdate = function () {
        var states =
                {
                    type: "periodic",
                    posX: [],
                    posY: [],
                    direction: [],
                    speed: [],
                    score: [],
                };

        for (var j in pacman)
        {
            states.posX[j] = pacman[j].getPosX();
            states.posY[j] = pacman[j].getPosY();
            states.direction[j] = pacman[j].getDirection();
            states.speed[j] = pacman[j].getSpeed();
            states.score[j] = pacman[j].getScore();
        }
        setTimeout(broadcast, 0, states);
    }

    var sendMapChanges = function () {
        var states = {
            type: "updateMap",
            content: levelMap.getChanges()
        }
        setTimeout(broadcast, 0, states);
        levelMap.flushChanges();
    }

    /*
     * priviledge method: start
     *
     * Create the objects, draws the GUI, and starts the rendering 
     * loop
     * Starting game play by calling game loop
     */
    var startGame = function ()
    {
        var message = {};
        message.type = "startGame";
        // To update on the player side
        setTimeout(broadcast, 0, message);

        loopID = setInterval(function () {
            gameLoop();
        }, 1000 / FRAME_RATE);
    };

    var initGame = function () {
        levelMap = new Map(true);
        levelMap.spawnPelletAndPowerupBetween(1, 1, 17, 1);
        levelMap.spawnPelletAndPowerupBetween(1, 1, 1, 19);
        levelMap.spawnPelletAndPowerupBetween(1, 19, 17, 19);
        levelMap.spawnPelletAndPowerupBetween(17, 1, 17, 19);

        initPacman();
        gameTimer = Starvrun.FRAME_RATE * Starvrun.GAME_TIMER;
    }

    var reset = function () {
        // Remove all clients
        for (var i in sockets) {
            sockets[i].close();
            delete sockets[i];
        }
        for (var i in players) {
            delete players[i];
        }

        // Reinitializing All Objects
        count = 0;
        nextPID = 0;
        players = {};
        sockets = {};
        availablePIDs = [3, 2, 1, 0];
        started = false;
        loopID = 0;

        // Initialize game objects
        initGame();
    }


    var initPacman = function () {
        pacman = [];
        for (var i = 0; i < numberOfPacman; i++)
        {
            pacman[i] = new Pacman(levelMap, false);
        }

        pacman[0].setStartGrid(1, 1);
        pacman[1].setStartGrid(levelMap.getWidth() - 2, 1);
        pacman[2].setStartGrid(1, levelMap.getHeight() - 2);
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
                            pacman[i].moveBack();
                            pacman[j].moveBack();
                            var message = {};
                            message.type = "moveBack";
                            message.move1 = i;
                            message.move2 = j;
                            // To update on the player side
                            setTimeout(broadcast, 0, message);
                            //console.log("sending moveBack");
                        } else if (pacman[i].isBeast() === true && pacman[j].isBeast() == false) {
                            // pacman i eat pacman j
                            if (!pacman[j].isDead()) {
                                pacman[i].kill();
                                pacman[j].died();
                                pacman[j].respawn();
                                //Send message on i kill j
                                var message = {};
                                message.type = "kill";
                                message.killer = i;
                                message.killed = j;
                                pacman[j].deadUpdated = true;
                                // To update on the player side
                                setTimeout(broadcast, 0, message);
                            }
                        } else {
                            // pacman j eat pacman i
                            if (!pacman[i].isDead()) {
                                pacman[j].kill();
                                pacman[i].died();
                                pacman[i].respawn();
                                var message = {};
                                message.type = "kill";
                                message.killer = j;
                                message.killed = i;
                                pacman[i].deadUpdated = true;
                                // To update on the player side
                                setTimeout(broadcast, 0, message);
                            }
                        }
                    }
                }
    }

    // Condition if pacmans are colliding 
    // Check for both 1 colliding with 2 and 2 colliding with 1
    var checkCondition = function (pacman1, pacman2)
    {
        if (pacman1 && pacman2) {
            if ((pacman1.getGridPosX() === pacman2.getGridPosX()) && (pacman1.getGridPosY() === pacman2.getGridPosY()))
                return true;
            else
                return false;
        }
    }

    // Returns number of players winning the game
    // playerNumber array  contains the winning players
    var maxScorePlayerCount = function ()
    {
        var maxScore = 0, playerCount = 0;
        var i;
        for (i = 0; i < numberOfPacman; i++)
        {
            if (pacman[i].getScore() >= maxScore)
                maxScore = pacman[i].getScore();
        }

        for (i = 0; i < numberOfPacman; i++)
        {
            if (pacman[i].getScore() == maxScore)
            {
                playerNumber[playerCount] = i;
                playerCount++;
            }
        }
        return playerNumber;
    }
}
//
//var server = new GameServer(4344);
//server.start();
global.GameServer = GameServer;