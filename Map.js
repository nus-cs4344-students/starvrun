function Map(isServer) {
	//Private variable
	var self = this; 
	var width = 0;
	var height = 0;
	var grids = [];
	var pelletNumber = 0;
	var powerupNumber = 0;
	this.isServer = isServer;
	if (this.isServer == undefined) {
		this.isServer = false;
	}

	var changes = [];

	this.getChanges = function() {
		return changes;
	}

	this.flushChanges = function() {
		changes = [];
	}

	this.setChanges = function(newChanges) {
		changes = newChanges;
	}

	var pushChange = function(x,y,i) {
		changes.push({x:x, y:y, i:i});
	}

	this.implementChanges = function() {
		for (var i = 0; i < changes.length; i++) {
			grids[changes[i]['x']][changes[i]['y']] = changes[i]['i'];
		}
	}

	this.getWidth = function() {
		return width;
	}

	this.getHeight = function() {
		return height;
	}

	//return width of the map in pixels
	this.getWidthPx = function () {
		return width*Starvrun.GRID_SIZE;
	}

	//return height of the map in pixels
	this.getHeightPx = function () {
		return height*Starvrun.GRID_SIZE;
	}

	//input: either x or y in grid
	//return the x or y in pixels
	this.gridToPx = function (pos){
		return (pos+0.50)*Starvrun.GRID_SIZE;
	}

	//input: either x or y in pixels
	//return the x or y in grid
	this.pxToGrid = function (pos){
		return (pos- (pos % Starvrun.GRID_SIZE))/Starvrun.GRID_SIZE;
	}
	
	//input: x and y in grid
	//return the content of the map in grid coordinate x,y
	this.getMapContent = function (x,y) {
		return grids[x][y];
	}

	//input: x and y in grid
	//modify the content of the map in grid coordinate x,y
	//return none
	this.setMapContent = function (x,y,i) {
		grids[x][y] = i;
		pushChange(x,y,i);
	}


	//input: x and y in grid
	//try to eat a pellet in a grid coordinate, if a pellet/powerup is found, set it to free block
	//return Starvrun.PELLET if pellet is found, return Starvrun.POWERUP if powerup is found, return 0 if none are found
	this.tryEatAt = function (x,y) {
		if ((grids[x][y] == Starvrun.PELLET) || (grids[x][y] == Starvrun.POWERUP)) {
			var res = grids[x][y];
			this.eatAt(x,y);
			return res;
		} else {
			return 0;
		}
	}

	//input: x and y in grid
	//set the grid to free block
	this.eatAt = function(x,y) {
		if (!isServer) return;
		if (grids[x][y] = Starvrun.PELLET) pelletNumber--;
		if (grids[x][y] = Starvrun.POWERUP) powerupNumber--;
		this.setMapContent(x,y,Starvrun.FREE);
	}

	//input: x and y in grid
	//return true if the map in grid coordinate x and y is passable, return false otherwise
	this.canPass = function(x,y) {
		if (grids[x][y]==undefined) {
			return 0;
		}
		return grids[x][y] > 0;
	}

	function Queue() {
		var q = [];
		var start = 0;
		this.empty = function() {
			if (q.length <= start) return true;
			return false;
		}
		this.pop = function () {
			start++;
			if (q[start-1]==undefined) {
				start--; //revert
				return q[start];
			}
			return q[start-1];
		}
		this.push = function (pos) {
			q.push(pos);
		}
	}

	var bfs = function(sx,sy,tx,ty) {
		var prev = new Array(width);
		for (var i = 0; i < width; i++) {
    		prev[i] = new Array(height);
			for (var j = 0; j < height; j++) {
	    		prev[i][j] = -1;
			}
		}

		var q = new Queue();
		q.push({x:sx, y:sy});
		while (!q.empty()) {
			var cur = q.pop();

			var next;
			next = {x:cur.x-1, y:cur.y};
			if ((prev[next.x][next.y] == -1) && (self.canPass(next.x, next.y))) {
				prev[next.x][next.y] = {x:cur.x, y:cur.y};
				if ((next.x==tx) && (next.y==ty)) break;
				q.push({x:next.x, y:next.y});
			}
			next = {x:cur.x+1, y:cur.y};
			if ((prev[next.x][next.y] == -1) && (self.canPass(next.x, next.y))) {
				prev[next.x][next.y] = {x:cur.x, y:cur.y};
				if ((next.x==tx) && (next.y==ty)) break;
				q.push({x:next.x, y:next.y});
			}
			next = {x:cur.x, y:cur.y-1};
			if ((prev[next.x][next.y] == -1) && (self.canPass(next.x, next.y))) {
				prev[next.x][next.y] = {x:cur.x, y:cur.y};
				if ((next.x==tx) && (next.y==ty)) break;
				q.push({x:next.x, y:next.y});
			}
			next = {x:cur.x, y:cur.y+1};
			if ((prev[next.x][next.y] == -1) && (self.canPass(next.x, next.y))) {
				prev[next.x][next.y] = {x:cur.x, y:cur.y};
				if ((next.x==tx) && (next.y==ty)) break;
				q.push({x:next.x, y:next.y});
			}

		}

		var trace = {x: tx, y: ty};
		var path = [];
		while ((prev[trace.x][trace.y]!=-1)  && ((prev[trace.x][trace.y].x != sx) || (prev[trace.x][trace.y].y != sy))) {
			var dumX = prev[trace.x][trace.y].x;
			var dumY = prev[trace.x][trace.y].y;
			trace.x = dumX;
			trace.y = dumY;
			var newtrace = {x: trace.x, y: trace.y};
			path.push(newtrace);
		}
		return path;

	}

	this.getDistance = function(sx,sy,tx,ty) {
		if ((sx==tx) && (sy==ty)) return 0;
		var path = bfs(sx,sy,tx,ty);
		return path.length;
	}

	this.spawnPelletBetween = function(sx,sy,tx,ty) {
		var path = bfs(sx,sy,tx,ty);
		for (var i = 0; i < path.length; i++) {
			var posX = path[i].x;
			var posY = path[i].y;
			this.setPelletAt(posX, posY);
		}
		return path;
	}

	this.spawnPelletAndPowerupBetween = function(sx,sy,tx,ty) {
		var path = bfs(sx,sy,tx,ty);
		for (var i = 0; i < path.length; i++) {
			var posX = path[i].x;
			var posY = path[i].y;
			if (i==Math.floor(path.length/2)) {
				this.setPowerupAt(posX, posY);
			} else {
				this.setPelletAt(posX, posY);
			}
		}
		return path;
	}

	//input: x and y in grid
	//try to spawn a pellet in a grid coordinate, if free block is found, set to pellet
	//return true if the pellet is spawned, return false otherwise 
	this.trySetPelletAt = function (x,y) {
		if (grids[x][y] == Starvrun.FREE) {
			this.setPelletAt(x,y)
			return true;
		} else {
			return false;
		}
	}

	//input: x and y in grid
	//modify the content of the map in grid to pellet
	//return none
	this.setPelletAt = function (x,y) {
		if (grids[x][y] != Starvrun.PELLET) {
			pelletNumber++;
			this.setMapContent(x,y,Starvrun.PELLET);
		}
	}

	//input: x and y in grid
	//modify the content of the map in grid to pellet
	//return none
	this.setPowerupAt = function (x,y) {
		if (grids[x][y] != Starvrun.POWERUP) {
			powerupNumber++;
			this.setMapContent(x,y,Starvrun.POWERUP);
		}
	}

	//dummy, later read from textfile
	var map0 = "###################\n#........#........#\n#.##.###.#.###.##.#\n#.................#\n#.##.#.#####.#.##.#\n#....#...#...#....#\n####.###.#.###.####\n   #.#.......#.#   \n   #.#.#####.#.#   \n   #...#...#...#   \n   #.#.#####.#.#   \n   #.#.......#.#   \n####.#.#####.#.####\n#........#........#\n#.##.###.#.###.##.#\n#..#...........#..#\n##.#.#.#####.#.#.##\n#....#...#...#....#\n#.######.#.######.#\n#.................#\n###################";

	var txt = map0;
	var it = 0;
	while (it < txt.length) {
		var c = txt.charAt(it);
		if (height==0) grids[width] = [];
		if (c==' ') {
			grids[width][height] = Starvrun.EMPTY;
		} else if (c=='.') {
			grids[width][height] = Starvrun.FREE;
		} else if (c=='#') {
			grids[width][height] = Starvrun.WALL;
		} else if (c=='\n') {
			width = -1;
			height++;
		}
		width++;
		it++;
	}
	height++;	
}

// For nodejs.require
global.Map = Map;