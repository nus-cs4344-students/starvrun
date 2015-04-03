/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Player(connid,pid){
     // Public variables
    this.connid;   // Socket id. Used to uniquely identify players via 
                // the socket they are connected from
    this.pid;   // Player id. In this case, 1 or 2 
    this.pacman;// player's pacman object 
    this.delay; // player's delay 
    this.lastUpdated; // timestamp of last paddle update

    // Constructor
    this.connid = connid;
    this.pid = pid;
    this.pacman = new Object();
    this.delay = 0;
    this.lastUpdated = new Date().getTime();
    
    this.getDelay = function() {       
        return this.delay;
    }
    
    this.setPacman = function(pm){
        this.pacman = pm;
    }

}

global.Player = Player;