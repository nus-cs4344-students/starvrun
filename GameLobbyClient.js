function GameLobbyClient() {
    // Network Variables
    var socket;         // socket used to connect to server 
    var delay;
    var gameClient = null;
    var playingGame = false;

    var sendPing = function () {
        var startTime = Date.now();
        var message = {};
        message.type = "ping";
        message.startTime = startTime;
        sendToServer(message);
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

            var url = "http://" + Starvrun.SERVER_IP + ":" + Starvrun.PORT + "/lobby";
            console.log("Trying to connect to " + url);
            socket = new SockJS(url);
            console.log("connected");
            socket.onmessage = function (e) {
                var message = JSON.parse(e.data);
                switch (message.type) {
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
                    case  "gameToJoin":
                        if (message.port == -1) {
                            appendMessage("serverMsg", "No available game");
                        } else if (gameClient == null) {
                            gameClient = new GameClient(message.port);
                            gameClient.start();
                        } else {
                            appendMessage("serverMsg", "Already in a game");
                        }
                        break;
                    default:
                        appendMessage("serverMsg", "unhandled meesage type " + message.type);
                }
            }

            socket.onclose = function () {
                console.log("Connection Closed");
            }
        } catch (e) {
            console.log("Failed to connect to " + "http://" + Starvrun.SERVER_NAME + ":" + Starvrun.PORT);
        }
    }

    /*
     * private method: initGUI
     *
     * Initialize a play area and add events.
     */
    var initGUI = function ()
    {
        //Create Button under player-details which says look for game
        addControls();
    }
    
    var addControls = function(){
        // Button Listeners for LFG 
        document.getElementById("LFG").addEventListener("click", lookForGame);
        document.getElementById("LFG").addEventListener("touchend", lookForGame, false);
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
        initGUI();
        initNetwork();
        // Wait for a while for the network to initialize
        setTimeout(sendPing, 500);
        new CorrectingInterval(function(){
            if(gameClient != null){
                if(gameClient.isStarted() && !playingGame ){
                    playingGame = true;
                }else if(!gameClient.isStarted() && playingGame){
                    // Game Ended Reset Game
                    gameClient = null;
                    playingGame = false;
                }
            }
        }, 1000);
    };

    var lookForGame = function () {
        var msg = {};
        msg.type = "joinGame";
        sendToServer(msg);
    }
}

var client = new GameLobbyClient(4344);
client.start();