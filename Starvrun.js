/*=====================================================
  Declared as literal object (All variables are static)	  
  =====================================================*/
var Starvrun = {
	SERVER_NAME : "localhost",	// server name of Starvrun game
        SERVER_IP : "0.0.0.0",
	PORT : 4344,				// port of Starvrun game

	FRAME_RATE : 30,			// frame rate of Starvrun game

        // Map Constants
	GRID_SIZE : 32,				// a grid length in pixels
        EMPTY: -1,
	WALL: 0,
	FREE: 1,
	PELLET: 2,
	POWERUP: 3,

        // Pacman Constants
        // Directions for PACMAN ?
        BEAST_TIME : 3,                         // time in seconds pacman in beast
        PELLET_SCORE : 10,
        POWERUP_SCORE : 50,
	RIGHT : 0,
	UP: 1,
	LEFT: 2,
	DOWN: 3,

	
        // Rendering Constants
        BG_COLOUR : "black",
        WALL_COLOUR : "blue",
        PELLET_COLOUR : "white",
        POWERUP_COLOUR : "red"
};

//global.Starvrun = Starvrun;