	/*put in Game.js*/
	// Direction Class
	function Direction(name,angle1,angle2,dirX,dirY) {
		this.name = name;
		this.sAngle = angle1;
		this.eAngle = angle2;
		this.dirX = dirX;
		this.dirY = dirY;
	}

	// Direction Objects (with initialized value)
	var right = new Direction("right", 0.25, 1.75, 1, 0);	// RIGHT
	var down = new Direction("down", 0.75, 0.25, 0, 1);		// DOWN
	var left = new Direction("left", 1.25, 0.75, -1, 0);	// LEFT
	var up = new Direction("up", 1.75, 1.25, 0, -1);		// UP 


	// DirectionWatcher
	function directionWatcher() {
		//this is the temp dir upon key pressed
		//used to update curDirection
		this.dir = null;
		this.set = function(dir) {
			this.dir = dir;
            //console.log(this.dir);
		}
        this.setUp = function(){         
            this.set(up);
        }
        this.setDown = function(){
            this.set(down);                    
        }
       this.setLeft = function(){
            this.set(left);
        }
       this.setRight = function(){
                this.set(right);
        }
       this.get = function() {
			return this.dir;
		}
	}

	function between (x, min, max) {
		return x >= min && x <= max;
	}

	function Pacman(game) {

		this.width = 32;
		this.height = 32;

		this.radius= 16;

		this.posX = 48;
		this.posY = 48;

		this.stuckX = 0;
		this.stuckY = 0;

		//multiple of 1 square grid px
		this.speed = 4;

        //mouth state(1/-1; use as multiplier for mouth angle)
		this.mouth = 1;

		//should be in Game.js
		var score = 0;

		//initialization for direction
		this.curDirection = right;
		this.dirX = this.curDirection.dirX; //1
		this.dirY = this.curDirection.dirY; //0
        this.sAngle = 0.25;
        this.eAngle = 1.75;

		this.lives = 3;

		//when dead, hold the pacman on position
		//used to play die animation
		this.frozen = false;		
		
		this.beastMode = false;
		this.beastModeTimer = 0;
                this.stunned = false;
                this.stunnedTimer = 0;

        var game = game;
        var map = game.getMap();

		var noOfGridX = map.getWidthPx()/Starvrun.GRID_SIZE;
		var noOfGridY = map.getHeightPx()/Starvrun.GRID_SIZE;

		//create a directionWatcher object
		this.directionWatcher = new directionWatcher();

                this.getScore = function(){
                    return score;
                }
                
		this.setPosition = function(x, y) {
			this.posX = x;
			this.posY = y;
		}

		this.getPosX = function(x) {
			return this.posX;
		}

		this.getPosY = function(y) {
			return this.posY;
		}

		this.getGridPosX = function() {
			return (this.posX - (this.posX % Starvrun.GRID_SIZE))/Starvrun.GRID_SIZE;
		}

		this.getGridPosY = function() {
			return (this.posY - (this.posY % Starvrun.GRID_SIZE))/Starvrun.GRID_SIZE;
		}

		this.inGrid = function() {
			if((this.posX % (2*this.radius) === 16) && (this.posY % (2*this.radius) === 16)) return true;
			return false;
		}

		this.enableBeastMode = function() {
			this.beastMode = true;
			this.beastModeTimer = Starvrun.FRAME_RATE * Starvrun.BEAST_TIME; // 3seconds
		}
                
                this.enableStunned = function(){
                    this.stunned = true;
                    this.stunnedTimer = Starvrun.FRAME_RATE * 2;
                }
                
                this.disableStunned = function(){
                    this.stunned = false; 
                }

		this.disableBeastMode = function() { 
			this.beastMode = false; 
		}

		this.freeze = function () {
			this.frozen = true;
		}

		this.unfreeze = function() {
			this.frozen = false;
		}

		this.checkDirectionChange = function() {
			if (this.directionWatcher.get() != null) {

				if ((this.stuckX == 1) && this.directionWatcher.get() == right) this.directionWatcher.set(null);
				else {
					this.stuckX = 0;
					this.stuckY = 0;

					if ((this.inGrid())) {
						
						// check if possible to change direction without getting stuck
						var x = this.getGridPosX() + this.directionWatcher.get().dirX;
						var y = this.getGridPosY() + this.directionWatcher.get().dirY;
						//boundary checking, ensure Pac can move across other side of map
						if (x <= -1) x = map.getWidthPx()/(this.radius*2)-1;
						if (x >= map.getWidthPx()/(this.radius*2)) x = 0;
						if (y <= -1) y = map.getHeightPx()/(this.radius*2)-1;
						if (y >= map.getHeightPx()/(this.radius*2)) y = 0;

						//console.log("x: "+x);
						//console.log("y: "+y);
						var nextGrid = map.getMapContent(x,y);
						//console.log("checkNextTile: "+nextTile);

						if (nextGrid != Starvrun.WALL) {
                                                        
							this.setDirection(this.directionWatcher.get());
							this.directionWatcher.set(null);
						}
					}
				}
			}
		}

		this.checkCollision = function () {
			
			if ((this.stuckX == 0) && (this.stuckY == 0) && this.frozen == false) {
				if(this.inGrid()){
					//get current grid position of pac
					var gridX = this.getGridPosX();
					var gridY = this.getGridPosY();

					var gridAheadX = gridX;
					var gridAheadY = gridY;
					
					var mapItem = map.getMapContent(gridX, gridY);

					// get 1 grid ahead for wall collision
					if ((this.dirX == 1) && (gridAheadX < noOfGridX)) gridAheadX += 1;
					if ((this.dirY == 1) && (gridAheadY < noOfGridY)) gridAheadY += 1;
					if ((this.dirX == -1) && (gridAheadX >= 0)) gridAheadX -= 1;
					if ((this.dirY == -1) && (gridAheadY >= 0)) gridAheadY -= 1;

					var mapItemAhead = map.getMapContent(gridAheadX, gridAheadY);
					//check for pellet eating
					if ((mapItem === Starvrun.PELLET) || (mapItem === Starvrun.POWERUP)) {
						//console.log("Pellet found at ("+gridX+"/"+gridY+"). Pacman at ("+this.posX+"/"+this.posY+")");
						var point = Starvrun.PELLET_SCORE;
                                                if (mapItem === Starvrun.POWERUP) {
                                                    point = Starvrun.POWERUP_SCORE;
                                                    this.enableBeastMode();
						}
						//clear the item on map
                                                score += point;
                                                map.eatAt(gridX, gridY);
						//game.score.add(point);
                                                //console.log(score);
                                        }

					//check for wall
					if ((mapItemAhead === Starvrun.WALL || mapItemAhead === Starvrun.EMPTY)) {
						this.stuckX = this.dirX;
						this.stuckY = this.dirY;
						this.stop();
						// get out of the wall
						// 4(which is also the speed) is the first step into the cell
						if ((this.stuckX == 1) && ((this.posX % 2*this.radius) != 0)) this.posX -= 4;
						if ((this.stuckY == 1) && ((this.posY % 2*this.radius) != 0)) this.posY -= 4;
					}
					
				}
			}
		}

		this.move = function() {
		
			this.checkDirectionChange();
			this.checkCollision();
                        this.eat();

			if (!this.frozen) {
				if (this.beastModeTimer > 0) {
					this.beastModeTimer--;
				}
                                if(this.stunnedTimer > 0){
                                    this.stunnedTimer --;
                                }

				if ((this.beastModeTimer == 0) && (this.beastMode == true)) this.disableBeastMode();
                                if ((this.stunnedTimer == 0) && this.stunned) this.disableStunned();
				
				this.posX += this.speed * this.dirX;
				this.posY += this.speed * this.dirY;
				
				// Check if out of canvas
				//boundary checking, ensure Pac can move across other side of map
				if (this.posX >= map.getWidthPx-this.radius) this.posX = 4-this.radius;
				if (this.posX <= 0-this.radius) this.posX = map.getWidthPx-4-this.radius;
				if (this.posY >= map.getHeightPx-this.radius) this.posY = 4-this.radius;
				if (this.posY <= 0-this.radius) this.posY = map.getHeightPx-4-this.radius;
			}
              
		}
		
		this.eat = function () {
		
			if (!this.frozen) {
				if (this.dirX == this.dirY == 0) {
				
					this.sAngle -= this.mouth*0.07;
					this.eAngle += this.mouth*0.07;
					
					var limitMax1 = this.curDirection.sAngle;
					var limitMax2 = this.curDirection.eAngle;
					var limitMin1 = this.curDirection.sAngle - 0.21;
					var limitMin2 = this.curDirection.eAngle + 0.21;
						
					if (this.sAngle < limitMin1 || this.eAngle > limitMin2)
					{
						this.mouth = -1;
					}
					if (this.sAngle >= limitMax1 || this.eAngle <= limitMax2)
					{
						this.mouth = 1;
					}
				}
			}
		}

		this.setDirection = function(dir) {
			if (!this.frozen) {
				this.dirX = dir.dirX;
				this.dirY = dir.dirY;
				this.sAngle = dir.sAngle;
				this.eAngle = dir.eAngle;
				this.curDirection = dir;
			}
		}

		this.stop = function() {
			//this will make the pacman speed to 0
			this.dirX = 0;
			this.dirY = 0;
		}
		
		this.reset = function() {
			this.unfreeze();
			this.posX = 48;
			this.posY = 48;
			this.setDirection(right);
			this.stop();
			this.stuckX = 0;
			this.stuckY = 0;
			//console.log("reset pacman");
		}

		this.dieAnimation = function() {
			this.freeze();
			this.sAngle += 0.05;
			this.eAngle -= 0.05;
			if (this.sAngle >= this.curDirection.sAngle+0.7 || this.eAngle <= this.curDirection.eAngle-0.7) {
				this.reset();
	    		this.lives--;
		        //console.log("pacman died, "+this.lives+" lives left");
		    	if (this.lives <= 0) {
					//game.showMessage("Game over","Total Score: "+game.score.score+input);
					//game.gameOver = true;
				}
				//game.drawHearts(this.lives);
			}
		}
                
        this.render = function(context) {
            
            var colour = "yellow";
            var radius = this.width / 4;
            //console.log("rendering at " + this.posX + " , " + this.posY);
            if(this.beastMode){ radius = this.width / 2;}
            
            
            
            // Fixed For now, Check for Direction
            var angle1 = this.sAngle * Math.PI;
            var angle2 = this.eAngle * Math.PI;

            // Draw the Pacman
            context.fillStyle = colour;
            context.beginPath();
            context.arc(this.posX, this.posY, radius, angle1, angle2, false);
            context.lineTo(this.posX,this.posY);
            context.closePath();
            context.fill();
        }

	}