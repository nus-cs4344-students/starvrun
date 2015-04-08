 function GameLobbyClient() {
    // Network Variables
    var socket;         // socket used to connect to server 
    
    var playArea;
    var player = 0;
    var delay;
    var gameClient; 
    
    var sendPing = function(){
        var startTime = Date.now();
        var message = {};
        message.type = "ping";
        message.startTime = startTime;
        sendToServer(message);   
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
            
            //var url= "http://" + Starvrun.SERVER_NAME + ":" + Starvrun.PORT + "/starvrun";
            var url= "http://" + Starvrun.SERVER_IP + ":" + Starvrun.PORT + "/lobby";
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
                    break;
                case "pong":
                    var RTT = Date.now() - message.startTime;
                    RTT /= 2;
                    if(delay) {
                        delay *= 0.9;
                        delay += 0.1 * RTT;
                    }else{
                        delay = RTT;
                    }
                    //console.log(delay);
                    sendToServer({type:"delay", delay:delay});
                   break;
               case  "gameToJoin":
                    gameClient = new GameClient(message.port);
                    gameClient.start();
                    break;
                default: 
                    appendMessage("serverMsg", "unhandled meesage type " + message.type);
                }
            }
        } catch (e) {
            console.log("Failed to connect to " + "http://" + Starvrun.SERVER_NAME+ ":" + Starvrun.PORT);
        }
    }

    /*
     * private method: initGUI
     *
     * Initialize a play area and add events.
     */
     var initGUI = function()
     {	
        //Create Button under player-details which says look for game
        createLFGButton();
     }
     
     var createLFGButton = function(){
        var pd = document.getElementById("player_details");
        pd.innerHTML = "<button id='LFG'> Look For Game </button>";
        document.getElementById("LFG").addEventListener("click", lookForGame);
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
        initGUI();
        initNetwork();
        setInterval(function() {sendPing();}, 3000/Starvrun.FRAME_RATE);  
//        setTimeout(function(){lookForGame();}, 500);
        
    };
    
    var lookForGame = function(){
        var msg = {};
        msg.type = "joinGame";
        sendToServer(msg);
    }
}

var client = new GameLobbyClient(4344);
client.start();