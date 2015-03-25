"use strict"; 

var LIB_PATH = "./";
require(LIB_PATH + "Starvrun.js");
require(LIB_PATH + "Map.js");
require(LIB_PATH + "Pacman.js");
    


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
    var numberOfPacman = 2;
    
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
        
        // Send message to new player (the current client)
        unicast(conn, {type: "message", content:"You are Player " + nextPID });

        // Create player object and insert into players with key = conn.id
        //players[conn.id] = new Player(conn.id, nextPID);
        sockets[nextPID] = conn;

        // Updates the nextPID to issue 
        nextPID = (nextPID + 1);
    }
    
    /*No Rendering Required*/
    var gameLoop = function(){
        
        var states = { 
                type: "update",
                content : "Updated Loop"
            }
            if(sockets[0]){
            setTimeout(unicast, 0, sockets[0], states);
            }
        // Send Updates here
    }
    
    this.start = function(){
       try {
            var express = require('express');
            var http = require('http');
            var sockjs = require('sockjs');
            var sock = sockjs.createServer();

            // reinitialize 
            count = 0;
            nextPID = 1;
            gameInterval = undefined;
            //players = new Object;
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
                    //var p = players[conn.id];

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
                        // one of the player moves the mouse.
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
        var i;
        for(i=0;i<numberOfPacman;i++)
        {
            pacman[i].move();   
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
    this.startGame = function() 
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
                            pacman[i].kill();
                            pacman[j].died();
                        }else {
                            // pacman j eat pacman i
                            pacman[j].kill();
                            pacman[i].died();
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