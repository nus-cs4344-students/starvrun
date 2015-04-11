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
var right = new Direction("right", 0.25, 1.75, 1, 0);   // RIGHT
var down = new Direction("down", 0.75, 0.25, 0, 1);     // DOWN
var left = new Direction("left", 1.25, 0.75, -1, 0);    // LEFT
var up = new Direction("up", 1.75, 1.25, 0, -1);        // UP 
var startDir = new Direction("start", 0.25, 1.75, 0, 0);


// DirectionWatcher
function directionWatcher() {
    //this is the temp dir upon key pressed
    //used to update curDirection
    var me = this;
    me.dir = null;
    this.set = function(dir) { me.dir = dir; }

    this.setUp = function(){ me.set(up); }
    this.setDown = function(){ me.set(down); }
    this.setLeft = function(){ me.set(left); }
    this.setRight = function(){ me.set(right); }

    this.get = function() { return me.dir; }
}

function between (x, min, max) {
    return x >= min && x <= max;
 }

function Pacman(map, isPlayer) {
    // Public Variables

    var isPlayer = isPlayer;
    if (isPlayer == undefined) {
        isPlayer = false;
    }
    
    this.directionWatcher = new directionWatcher();  // For KeyPress
    // Private Variables
    // Game Level States
    var startX = map.getWidth()+1; // In Grid
    var startY = map.getHeight()+1; // In Grid
    
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

    // Blinking animation for the pacman during eating and collision
    var blinkMode = false;
    var blinkTimer = 0;
    this.blinkUpdate = false;
        
    // Movement Variables
    var speed = 4;

    var curDirection = startDir;
    var dirX = 0;
    var dirY = 0;

    var stuckX = 0;
    var stuckY = 0; // >? What are these used for?

    //Rendering Constants
    var COLOR = "yellow";
    var curColor = COLOR;
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

    this.isBlinking = function()
    {
        return blinkMode;
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
        if((posX % WIDTH === Starvrun.GRID_SIZE/2) && (posY % (WIDTH) === Starvrun.GRID_SIZE/2)) { return true; }   
        return false;
    }

    this.setColor = function(color) {
        COLOR = color;
    }

    // Private Methods for State Management
    this.enableBeastMode = function(){
        beastMode = true;
        beastMode_Timer = Starvrun.FRAME_RATE * Starvrun.BEAST_TIME; // 3seconds
    }

    this.disableBeastMode = function() { 
      beastMode = false; 
    }

    this.enableBlinkAnim = function()
    {
        blinkMode = true;
        blinkTimer = Starvrun.FRAME_RATE * Starvrun.BLINK_TIME;
    }

    this.disableBlinkAnim = function()
    {
        blinkMode = false;
        this.setColor(COLOR);
    }

    this.enableStunned = function(){
        stunned = true;
        stunned_Timer = Starvrun.FRAME_RATE * Starvrun.STUN_TIME;
        //console.log("Stunned for " + stunned_Timer );
    }

    this.disableStunned = function(){
        if (this.inGrid()) {
            stunned = false;
            this.stop();
        }
    }

    this.checkDirectionChange = function() {
      if (this.directionWatcher.get() !== null) {
        if ((stuckX === 1) && this.directionWatcher.get() === right){ 
            this.directionWatcher.set(null);
        }
        else {
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

        if(blinkTimer>0)
        {
            blinkTimer--;
        }

        if ((beastMode_Timer === 0) && (beastMode === true)) this.disableBeastMode();
        if ((stunned_Timer === 0) && (stunned === true)) this.disableStunned();
        if ((blinkTimer === 0) && (blinkMode === true)) this.disableBlinkAnim();
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
        if(beastMode||stunned)this.blinkAnimation();
        if(dead) this.dieAnimation();
    }

    this.setDirection = function(dir) {                
        if (!dead && dir) {
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
        var me = this;
        if(lives > 0){
            dead = false;
            posX = map.gridToPx(startX);
            posY = map.gridToPx(startY);
            me.setDirection(startDir);
            me.stop();
            stuckX = 0;
            stuckY = 0;
            lives --;
            //console.log("Lives Remaining = " + lives);
        }else{
            dead= true;
            posX = map.gridToPx(map.getWidth()+1);
            posY = map.gridToPx(map.getHeight()+1);
            me.stop();
            //console.log("No more Lives");
        }
    }
        
    this.reset = function(){
        var me = this;
        lives = Starvrun.LIVES + 1;
        me.respawn();
    }

    this.dieAnimation = function() {
        dead = true;
        sAngle += 0.05;
        eAngle -= 0.05;
        if (sAngle >= curDirection.sAngle+0.7 || eAngle <= curDirection.eAngle-0.7) {
            if(lives > 0) this.respawn();
        }    
    }
    
    this.setStartColor = function(color){
        COLOR = color;
        curColor = COLOR;
    }

    this.setColor = function(color) {
        curColor = color;
        pacmanColor = color;
    }

    this.getColor = function()
    {
        return COLOR;
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
            context.fillStyle = curColor;
            context.beginPath();
            context.arc(posX, posY, radius, angle1, angle2, false);
            context.lineTo(posX,posY);
            context.closePath();
            context.fill();
    } 

    this.blinkAnimation = function()
    {
        if(blinkMode)
        {
            if(Math.floor(blinkTimer/4)%2===0){ this.setColor("red"); }
        
            else { this.setColor("white"); }
        }
    }
}

// For nodejs require        
global.Pacman = Pacman;