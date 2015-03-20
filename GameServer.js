"use strict"; 

var LIB_PATH = "./";
require(LIB_PATH + "Starvrun.js");
require(LIB_PATH + "Map.js");
require(LIB_PATH + "Pacman.js");
require(LIB_PATH + "Game.js");

function GameServer() {
    // Private Variables
    var port;         // Game port 
    var count;        // Keeps track how many people are connected to server 
    var nextPID;      // PID to assign to next connected player (i.e. which player slot is open) 
    var gameInterval; // Interval variable used for gameLoop 
    var sockets;      // Associative array for sockets, indexed via player ID
    var players;      // Associative array for players, indexed via socket ID

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
        unicast(conn, {type: "message", content:"You are Player " + nextPID + ". Your paddle is at the " + watchPaddle});

        // Create player object and insert into players with key = conn.id
        players[conn.id] = new Player(conn.id, nextPID);
        sockets[nextPID] = conn;

        // Updates the nextPID to issue 
        nextPID = (nextPID + 1);
    }
    
    /*No Rendering Required*/
    var gameLoop = function(){
        var states = {}
    
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
            players = new Object;
            sockets = new Object;
            port = Starvrun.PORT;
            
            // Upon connection established from a client socket
            sock.on('connection', function (conn) {
                console.log("connected");
                // Sends to client
                broadcast({type:"message", content:"There is now " + count + " players"});

                // create a new player
                newPlayer(conn);

                // When the client closes the connection to the server/closes the window
                conn.on('close', function () {
                    // Stop game if it's playing
                    reset();

                    // Decrease player counter
                    count--;

                    // Do Cleanup here
                    delete players[conn.id];

                    // Sends to everyone connected to server except the client
                    broadcast({type:"message", content: " There is now " + count + " players."});
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
                        // one of the player starts the game.
                        case "start": 
                            break;
                        // one of the player moves the mouse.
                        case "changeDirection":
                        // one of the player moves the mouse.
                            break;
                        default:
                            console.log("Unhandled " + message.type);
                    }
                }); // conn.on("data"
            }); // socket.on("connection"

            // Standard code to starts the Pong server and listen
            // for connection
            var app = express();
            var httpServer = http.createServer(app);
            sock.installHandlers(httpServer, {prefix:'/starvrun'});
            httpServer.listen(Starvrun.PORT, Starvrun.SERVER_IP);
            app.use(express.static(__dirname));
            console.log("Server running on http://"+Starvrun.SERVER_IP + ":" + 
                    Starvrun.PORT + "\n");
            console.log("Visit http://"+ Starvrun.SERVER_IP + ":" + Starvrun.PORT + 
                    "/index.html in your browser to start the game");
        } catch (e) {
            console.log("Cannot listen to " + Starvrun.PORT);
            console.log("Error: " + e);
        }
    }
}