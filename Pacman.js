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

	function Pacman(map) {
            // Public Variables
            
            this.directionWatcher = new directionWatcher();  // For KeyPress
            // Private Variables
            // Game Level States
            var startX = -1; // In Grid
            var startY = -1; // In Grid
            
            var map = map;
            
            // Game Variables
            var score = 0;
            var lives = Starvrun.LIVES
                    
            var posX = 48; // IN PX
            var posY = 48; // IN PX
            
            // POWER UP Stuff
            var beastMode = false;
            var beastMode_Timer = 0;
            this.beastUpdated = false;
            
            // Collision Stuff
            var stunned = false;
            var stunned_Timer = 0;
            this.stunUpdated = false;
            
            // Movement Variables
            var speed = 4;

            var curDirection = right;
            var dirX = curDirection.dirX;
            var dirY = curDirection.dirY;
                        
            var stuckX = 0;
            var stuckY = 0; // >? What are these used for?
                
            //Rendering Constants
            var COLOR = "yellow";
            var WIDTH = Starvrun.GRID_SIZE;
            
            //Rendering Variables 
            var mouthOpen = 1; // Mouth Opening if >0 Mouth closing <0
            var sAngle = curDirection.sAngle;
            var eAngle = curDirection.eAngle;
            var dead = false;  // For holding Pacman in Position while animation is played
            this.deadUpdated = false;

            // Public Method
            // Accessors
            this.getScore = function(){
                return score;
            }
            this.setScore = function(scr){
                score = scr; 
            }
            this.getPosX = function() {
                return posX;
            }
            
            this.getPosY = function() {
		return posY;
            }
            
            this.getSpeed = function(){
                return speed;
            }
            
            this.getGridPosX = function() {
		return (posX - (posX % Starvrun.GRID_SIZE))/Starvrun.GRID_SIZE;
            }

            this.getGridPosY = function() {
		return (posY - (posY % Starvrun.GRID_SIZE))/Starvrun.GRID_SIZE;
            }
            
            this.isStunned = function(){
                return stunned;
            }
            
            this.isBeast = function(){
                return beastMode;
            }
               
            // Mutators
            
            
            this.setPositionPx = function(x, y) {
                posX = x;
                posY = y;
            }
            
            this.setStartGrid = function(x,y){
                startX = x;
                startY = y;
                this.setPositionPx(map.gridToPx(x),map.gridToPx(y));
            }
            
            this.setSpeed  = function(v){
                speed = v; 
            }
            
            this.isDead = function(){
                return dead;
            }
            
            // Checking functions
            
            this.inGrid = function() {
		if((posX % WIDTH === Starvrun.GRID_SIZE/2) 
                    && (posY % (WIDTH) === Starvrun.GRID_SIZE/2)) {
                        return true;
                    }
		return false;
            }

            // Private Methods for State Management
            this.enableBeastMode = function(){
                beastMode = true;
		beastMode_Timer = Starvrun.FRAME_RATE * Starvrun.BEAST_TIME; // 3seconds
            }
            
            this.disableBeastMode = function() { 
		beastMode = false; 
            }
                
            this.enableStunned = function(){
                stunned = true;
                stunned_Timer = Starvrun.FRAME_RATE * Starvrun.STUN_TIME;
                //console.log("Stunned for " + stunned_Timer );
            }
                
            this.disableStunned = function(){
                stunned = false; 
            }

            this.checkDirectionChange = function() {
		if (this.directionWatcher.get() !== null) {
                    if ((stuckX === 1) && this.directionWatcher.get() === right){ 
                        this.directionWatcher.set(null);
                    }else {
                        stuckX = 0;
			stuckY = 0;
                        if ((this.inGrid())) {
                            // check if possible to change direction without getting stuck
                            var x = this.getGridPosX() + this.directionWatcher.get().dirX;
                            var y = this.getGridPosY() + this.directionWatcher.get().dirY;
                            //boundary checking, ensure Pac can move across other side of map
                            if (x < 0) x = map.getWidth()-1;
                            if (x >= map.getWidth()) x = 0;
                            if (y < 0) y = map.getHeight()-1;
                            if (y >= map.getHeight()) y = 0;
                            var nextGrid = map.getMapContent(x,y);
                            if (nextGrid !== Starvrun.WALL) {
                                if (!stunned) {
                                    this.setDirection(this.directionWatcher.get());
                                    this.directionWatcher.set(null);
				}
                            }
			}
                    }
		}
            }

            this.checkCollision = function () {
		if ((stuckX === 0) && (stuckY === 0) && dead === false) {
                    if(this.inGrid()){
                    //get current grid position of pac
			var gridX = this.getGridPosX();
			var gridY = this.getGridPosY();
                        var mapItem = map.getMapContent(gridX, gridY);
                        
			var gridAheadX = gridX;
			var gridAheadY = gridY;
					
                        // get 1 grid ahead for wall collision // Assumes there is a boundary
			if ((dirX == 1) && (gridAheadX < map.getWidth())) gridAheadX += 1;
			if ((dirY == 1) && (gridAheadY < map.getHeight())) gridAheadY += 1;
			if ((dirX == -1) && (gridAheadX >= 0)) gridAheadX -= 1;
			if ((dirY == -1) && (gridAheadY >= 0)) gridAheadY -= 1;

			var mapItemAhead = map.getMapContent(gridAheadX, gridAheadY);
			//check for pellet eating
			if ((mapItem === Starvrun.PELLET) || (mapItem === Starvrun.POWERUP)) {
                            var point = Starvrun.PELLET_SCORE;
                            if (mapItem === Starvrun.POWERUP) {
                                point = Starvrun.POWERUP_SCORE;
                                this.enableBeastMode();
                            }
                            
                            //clear the item on map
                            score += point;
                            map.eatAt(gridX, gridY);
                        }

                        //check for wall
			if ((mapItemAhead === Starvrun.WALL || mapItemAhead === Starvrun.EMPTY)) {
                            stuckX = dirX;
                            stuckY = dirY;
                            this.stop();
                            // get out of the wall
                            // 4(which is also the speed) is the first step into the cell
                            //console.log(posX % (WIDTH/2))
                            if ((stuckX == 1) && ((posX % (WIDTH/2)) !== 0)) posX -= speed;
                            if ((stuckY == 1) && ((posY % (WIDTH/2)) !== 0)) posY -= speed;
			}		
                    }
                }
            }
            
            this.runTimers = function(){
                if (beastMode_Timer > 0) {
			beastMode_Timer--;
                }
                       
                if(stunned_Timer > 0){
                    stunned_Timer --;
                }

		if ((beastMode_Timer === 0) && (beastMode === true)) this.disableBeastMode();
                if ((stunned_Timer === 0) && (stunned === true)) this.disableStunned();
            }

            this.moveBack = function(){
                if(!stunned){
                    this.enableStunned();
                    dirX *= -1;
                    dirY *= -1;
                }
            }
		
            this.move = function() {
                // Game Loop
		this.checkDirectionChange();
		this.checkCollision();
                this.runTimers();

		if (!dead) {
                    posX += speed * dirX;
                    posY += speed * dirY;
                    
                    // Check if out of canvas
                    //boundary checking, ensure Pac can move across other side of map
                    if (posX >= map.getWidthPx()-WIDTH/2) posX = speed-WIDTH/2;
                    if (posX <= 0-WIDTH/2) posX = map.getWidthPx()-speed-WIDTH/2;
                    if (posY >= map.getHeightPx()-WIDTH/2) posY = speed-WIDTH/2;
                    if (posY <= 0-WIDTH/2) posY = map.getHeightPx()-4-WIDTH/2;
		}
            }
                
            this.kill = function (){
                score += 100;
            }
                
            this.died = function() {
                dead = true;
            }
		
            var eat = function () {
		if (!dead) {
                    if (dirX !== 0 || dirY !== 0) {
                        sAngle -= mouthOpen*0.035;
			eAngle += mouthOpen*0.035;
					
			var limitMax1 = curDirection.sAngle;
			var limitMax2 = curDirection.eAngle;
			var limitMin1 = curDirection.sAngle - 0.21;
			var limitMin2 = curDirection.eAngle + 0.21;
						
                        if (sAngle < limitMin1 || eAngle > limitMin2){
                            mouthOpen = -1;
                        }
			
                        if (sAngle >= limitMax1 || eAngle <= limitMax2){
                            mouthOpen = 1;
                        }
                    }
		}
            }
            
            this.animate = function(){
                
                eat();
                if(dead) this.dieAnimation();
            }

            this.setDirection = function(dir) {                
		if (!dead && dir && (dir.name !== curDirection.name)) {
                    dirX = dir.dirX;
                    dirY = dir.dirY;
                    sAngle = dir.sAngle;
                    eAngle = dir.eAngle;
                    curDirection = dir;
		}
            }
            
            this.getDirection = function(){
                return curDirection;
            }
            
            this.stop = function() {
                //this will make the pacman speed to 0
		dirX = 0;
		dirY = 0;
            }
		
            this.respawn = function() {
                if(lives > 0){
                    dead = false;
                    posX = map.gridToPx(startX);
                    posY = map.gridToPx(startY);
                    this.setDirection(right);
                    this.stop();
                    stuckX = 0;
                    stuckY = 0;
                    lives --;
                }else{
                    posX = map.gridToPx(-1);
                    posY = map.gridToPx(-1);
                    this.stop();
                    //console.log("No More Lives");
                    //game.drawHearts(this.lives);
                }
            }
            
            this.reset = function(){
                lives = Starvrun.LIVES + 1;
                this.respawn();
            }

            this.dieAnimation = function() {
		dead = true;
		sAngle += 0.05;
		eAngle -= 0.05;
		if (sAngle >= curDirection.sAngle+0.7 || eAngle <= curDirection.eAngle-0.7) {
                    this.respawn();
		}    
            }
            
            this.setColor = function(color) {
                COLOR = color;
            }
                
            this.render = function(context) {
                if(lives <= 0){
                    return;
                }
                this.animate();
                var radius = WIDTH / 2;
                //console.log("rendering at " + this.posX + " , " + this.posY);
                if(beastMode){radius = WIDTH * 3/4;}
            
                // Fixed For now, Check for Direction
                var angle1 = sAngle * Math.PI;
                var angle2 = eAngle * Math.PI;

                // Draw the Pacman
                context.fillStyle = COLOR;
                context.beginPath();
                context.arc(posX, posY, radius, angle1, angle2, false);
                context.lineTo(posX,posY);
                context.closePath();
                context.fill();
                
            }
	}
        
// For nodejs require        
global.Pacman = Pacman;