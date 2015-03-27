"use strict"; 

var LIB_PATH = "./";
require(LIB_PATH + "Starvrun.js");
require(LIB_PATH + "Map.js");
require(LIB_PATH + "Pacman.js");

function Player(connid, pid) {
    this.connid = connid;
    this.pid = pid;
}


function GameServer() {    


    // Server Variables
    var port;         // Game port 
    var IP;           // Game IP
    var count;        // Keeps track how many people are connected to server 
    var nextPID;      // PID to assign to next connected player (i.e. which player slot is open) 
    var gameInterval; // Interval variable used for gameLoop 
    var sockets;      // Associative array for sockets, indexed via player ID
    var players;      // Associative array for players, indexed via socket ID
    
    /*Game Variables*/
    var levelMap;
    var pacman = [];
    var FRAME_RATE = 35;
    
    var broadcast = function (msg) {
        var id;
        for (id in sockets) {
            sockets[id].write(JSON.stringify(msg));
        }
    }
    
    var unicast = function (socket, msg) {
        socket.write(JSON.stringify(msg));
    }
    
    var newPlayer = function (conn) {        
        count ++;
        
        if(nextPID > count) {
            unicast(conn, {type: "message", content: "Server Full"}); 
            return;
        }

        // Send message to new player (the current client)
        unicast(conn, {type: "message", content:"You are Player " + (nextPID+1) });

        // Create player object and insert into players with key = conn.id
        players[conn.id] = new Player(conn.id, nextPID);
        sockets[nextPID] = conn;

        // Updates the nextPID to issue 
        nextPID = (nextPID + 1);
        
    }
    
    this.start = function(){
       try {
        var express = require('express');
        var http = require('http');
        var sockjs = require('sockjs');
        var sock = sockjs.createServer();

            // reinitialize 
            count = 0;
            nextPID = 0;
            gameInterval = undefined;
            players = new Object;
            sockets = new Object;
            port = 4344; //Starvrun.PORT;
            IP = "0.0.0.0";//Starvrun.SERVER_IP;
            
            // Upon connection established from a client socket
            sock.on('connection', function (conn) {
                console.log("connected");
                // Sends to client
                broadcast({type:"message", content:"There is now " + count + " players"});

                // create a new player
                newPlayer(conn);

                // When the client closes the connection to the server/closes the window
                conn.on('close', function () {

                });

                // When the client send something to the server.
                conn.on('data', function (data) {
                    var message = JSON.parse(data);
                    var p = players[conn.id];

                    //if (p === undefined) {
                        // we received data from a connection with no 
                        // corresponding player.  don't do anything.
                    //    return;
                    //} 
                    switch (message.type) {
                        // one of the player starts the game.
                        case "start": 
                        break;
                        // one of the player moves the mouse.
                        case "changeDirection":
                            var pid = p.pid; // get player sending the update
                            var pm = pacman[pid];
                            var direction = message.direction;
                            switch(direction){
                                case Starvrun.UP:
                                if(!pm.isStunned()) pm.directionWatcher.setUp();
                                break;
                                case Starvrun.DOWN:
                                if(!pm.isStunned()) pm.directionWatcher.setDown();
                                break;
                                case Starvrun.LEFT:
                                if(!pm.isStunned()) pm.directionWatcher.setLeft();
                                break;
                                case Starvrun.RIGHT:
                                if(!pm.isStunned()) pm.directionWatcher.setRight();
                                break;
                                default: console.log("unexpected direction : " + direction);
                            }
                            
                            
                            break;
                            case "echo":
                            // Testing Connection
                            broadcast({type:"message", content:"There is now " + count + " players"});
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
            sock.installHandlers(httpServer, {prefix:'/starvrun'});            
            httpServer.listen(port, IP);
            app.use(express.static(__dirname));
            console.log("Server running on http://"+IP + ":" + 
                port + "\n");
            console.log("Visit http://"+ IP + ":" + port + 
                "/index.html in your browser to start the game");
            //gameInterval = setInterval(function() {gameLoop();}, 1000/Pong.FRAME_RATE);
            
            this.startGame();

        } catch (e) {
            console.log("Cannot listen to " + port);
            console.log("Error: " + e);
        }
    }

    // Where the game starts to be played
    var gameLoop = function() 
    {
        // Moves the pacman on the map always (from start to stop)
        var i, j;
        var states = 
        {
            type:"",
            content:"",
            timestamp:"",
            posX:[],
            posY:[],
            direction:[],
            speed:[],
            score:[],
        };
        var pacmanStates = [];

        for(i=0;i<count;i++)
        {
            pacmanStates[i] = new states();
            pacman[i].move();   
        }
        
        // To check if the pacmans are colliding
        checkCollision(count);
        
        // To update on the player side
        for(i=0;i<count;i++)
        {
            var date = new Date();
            var currentTime = date.getTime();
            
            // Setting the states for each pacman
            pacmanStates[i].type = "periodic";
            pacmanStates[i].content = "update loop";
            pacmanStates[i].timestamp = currentTime;
            for(j=0;j<count;j++)
            {
                pacmanStates[i].posX[j] = pacman[i].getPosX();
                pacmanStates[i].posY[j] = pacman[i].getPosY();
                pacmanStates[i].direction[j] = pacman[i].getDirection();
                pacmanStates[i].speed[j] = pacman[i].getSpeed();
                pacmanStates[i].score[j] = pacman[i].getScore();
            }

            if(sockets[0])
            {
            setTimeout(unicast, 0, sockets[0], pacmanStates);
            }
        }
        
        //periodic map update
        if (levelMap.getChanges().count > 0) {
            var states = { 
                type: "updateMap",
                content : levelMap.getChanges()
            }
            for(i=0;i<numberOfPacman;i++)
            {
                if (sockets[i]) {
                    setTimeout(unicast, 0, sockets[i], states);
                }
            }
            levelMap.flushChanges();
        }
        // Send Updates here
    }

    /*
     * priviledge method: start
     *
     * Create the objects, draws the GUI, and starts the rendering 
     * loop
     * Starting game play by calling game loop
     */
     this.startGame = function() 
     {
        // Initialize game objects
        levelMap = new Map();
        var i;
        for(i=0;i<count;i++)
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

var server = new GameServer();
server.start();