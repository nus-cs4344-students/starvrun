/*
 * Usage: 
 *    Include in HTML body onload to run on a web page.
 *    <body onload="loadScript('', 'GameClient.js')">
 */
"use strict"; 

function GameClient() {
    // private variables
    var socket;         // socket used to connect to server 
    var playArea;       // HTML5 canvas game window 
    
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
    
    var gameLoop = function(){
        // Game Loop Code
        setInterval()
    }

   this.start = function(){
        // Initialization Code
        
    }

}

var client = new GameClient();
client.start();