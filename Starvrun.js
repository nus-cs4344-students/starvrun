/*=====================================================
 Declared as literal object (All variables are static)	  
 =====================================================*/
var Starvrun = {
    SERVER_NAME: "localhost", // server name of Starvrun game
    SERVER_IP: "127.0.0.1",
    PORT: 4344, // port of Starvrun game

    FRAME_RATE: 30, // frame rate of Starvrun game

    // Map Constants
    GRID_SIZE: 28, // a grid length in pixels
    EMPTY: -1,
    WALL: 0,
    FREE: 1,
    PELLET: 2,
    POWERUP: 3,
    PELLET_THRESHOLD: 15,

    // Pacman Constants
    BEAST_TIME: 3, // time in seconds pacman in beast
    STUN_TIME: 0.5,
    BLINK_TIME: 1, // time in seconds
    HOLD_AND_WAIT_DESYNC_TIME: 0.50, // time in seconds until hold and wait is void
    PELLET_SCORE: 10,
    POWERUP_SCORE: 50,
    LIVES: 3,
    RIGHT: 0,
    UP: 1,
    LEFT: 2,
    DOWN: 3,

    // Rendering Constants
    BG_COLOUR: "black",
    WALL_COLOUR: "blue",
    PELLET_COLOUR: "white",
    POWERUP_COLOUR: "red",
    WALL_WIDTH: 8,
    DR_THRESHOLD: 2,

    //SERVER CONSTANT 
    GAME_TIMER: 60
};


// For nodejs require
global.Starvrun = Starvrun;