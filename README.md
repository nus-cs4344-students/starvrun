# Starvrun
### CS4344 Final Project for AY2014/15 Semester 2

## Introduction
This folder contains the code for a 4-player game, implemented with Javascript and HTML5. 
The game is a multiplayer, competitive, pac-man, similar to Pacman Battle Royale.

The server runs on ```node.js``` and serves data with ```express```.  Communication is done through ```sockjs```.  

## Installation and Execution
Install ```node.js```.  Then install `sockjs` and `express` with:
```
$ npm install
```

To run the server:
```
$ node GameLobby.js
```

Connects to the server with a modern browser, at the URL ```http://server:port/index.html```

The ```server``` and ```port``` can be configured in ```Starvrun.js```.

Press spacebar to start the game!

Video demo can be found at: https://www.youtube.com/watch?v=m-2fOGmcEJU