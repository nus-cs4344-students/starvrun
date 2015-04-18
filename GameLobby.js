"use strict";

var LIB_PATH = "./";
require(LIB_PATH + "CorrectingInterval.js");
require(LIB_PATH + "Starvrun.js");
require(LIB_PATH + "Player.js");
require(LIB_PATH + "GameServer.js");

function GameLobby() {
    // Private Variables
    var port;         // Lobby port 
    var IP;           // Server IP
    var name;         // Server name
    var nextPID;      // PID to assign to next connected player (i.e. which player slot is open) 
    var gameInterval; // Interval variable used for gameLoop 
    var sockets;      // Associative array for sockets, indexed via player ID
    var players;      // Associative array for players, indexed via socket ID

    var gameServers = {};
    var numServers = 9;

    // Network 

    // Constructor
    port = Starvrun.PORT;
    IP = Starvrun.SERVER_IP;
    name = Starvrun.SERVER_NAME;

    var broadcast = function (msg) {
        var id;
        for (id in sockets) {
            // Workaround to get delay
            for (var p in players) {
                if (players[p].pid == id) {
                    setTimeout(unicast, players[p].getDelay(), sockets[id], msg);
                    break;
                }
            }
        }
    }

    var unicast = function (socket, msg) {
        var date = new Date();
        var currentTime = date.getTime();
        if (msg) {
            msg["timestamp"] = currentTime;
            if (socket)
                socket.write(JSON.stringify(msg));
        }
    }

    var newPlayer = function (conn) {
        // Create player object and insert into players with key = conn.id
        players[conn.id] = new Player(conn.id, nextPID);
        sockets[nextPID] = conn;

        nextPID = (nextPID + 1)
    }

    this.start = function () {
        try {
            var express = require('express');
            var http = require('http');
            var sockjs = require('sockjs');
            var sock = sockjs.createServer();

            // reinitialize 
            nextPID = 0;
            players = new Object;
            sockets = new Object;

            // Upon connection established from a client socket
            sock.on('connection', function (conn) {
                console.log("connected");
                // Sends to client
                //broadcast({type: "message", content: "There is now " + players.length + " players waiting."});
                newPlayer(conn);

                // When the client closes the connection to the server/closes the window
                conn.on('close', function () {
                    var p = players[conn.id];
                    // Cleanup
                    //broadcast({type: "message", content: "There is now " + players.length + " players waiting."});
                    delete sockets[p.pid];
                    delete players[conn.id];
                });

                // When the client send something to the server.
                conn.on('data', function (data) {
                    var message = JSON.parse(data);
                    var p = players[conn.id]

                    if (p === undefined) {
                        return;
                    }
                    var s = sockets[p.pid];

                    switch (message.type) {
                        // one of the player change the delay
                        case "delay":
                            players[conn.id].delay = message.delay;
                            break;
                        case "ping":
                            var msg = {};
                            msg.type = "pong";
                            msg.startTime = message.startTime;
                            unicast(s, msg);
                            break;
                        case "joinGame":
                            var msg = {};
                            msg.type = "gameToJoin";
                            msg.port = searchForGame();

                            unicast(s, msg);
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
            sock.installHandlers(httpServer, {prefix: '/lobby'});
            httpServer.listen(port, IP);
            app.use(express.static(__dirname));
            var url = "http://" + IP + ":" + port;
            console.log("Server running on" + url + "\n");
            console.log("Visit " + url + "/index.html in your " +
                    "browser to start the game")

            initGameServers();
        } catch (e) {
            console.log("Cannot listen to " + port);
            console.log("Error: " + e);
        }
    }

    var initGameServers = function () {
        for (var i = 1; i <= numServers; ++i) {
            var gameServer = new GameServer(Starvrun.PORT + i);
            gameServers[gameServer.getPort()] = gameServer;
            gameServer.start();
        }
    }

    // Returns -1 if there is no open servers to join
    var searchForGame = function () {
        for (port in gameServers) {
            if (!gameServers[port].isFull()) {
                return port;
            }
        }
        return -1;
    }
}

// This will auto run after this script is loaded
var gameLobby = new GameLobby();
gameLobby.start();

