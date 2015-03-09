function Map() {
	//Private variable
	var width = 0;
	var height = 0;
	var grids = [];

	//return width of the map in pixels
	this.widthPx = function () {
		return width*Starvrun.GRID_SIZE;
	}

	//return height of the map in pixels
	this.heightPx = function () {
		return height*Starvrun.GRID_SIZE;
	}

	//input: either x or y in pixels
	//return the x or y in grid
	this.pxToGrid = function (pos) {
		return Math.floor(pos/Starvrun.GRID_SIZE);
	}

	//input: either x or y in grid
	//return the x or y in pixels
	this.gridToPx = function (pos){
		return pos*Starvrun.GRID_SIZE;
	}
	

	//input: x and y in pixels
	//return the content of the map in pixel coordinate x,y
	this.getMapContentPx = function (x,y) {
		return this.getMapContent(this.pxToGrid(x), this.pxToGrid(y));
	}

	//input: x and y in grid
	//return the content of the map in grid coordinate x,y
	this.getMapContent = function (x,y) {
		return grids[x][y];
	}

	//input: x and y in pixels
	//modify the content of the map in pixel coordinate x,y
	//return none
	this.setMapContentPx = function (x,y) {
		this.setMapContent(this.pxToGrid(x), this.pxToGrid(y));
	}

	//input: x and y in grid
	//modify the content of the map in grid coordinate x,y
	//return none
	this.setMapContent = function (x,y,i) {
		grids[x][y] = i;
	}


	//input: x and y in grid
	//try to eat a pellet in a grid coordinate, if a pellet/powerup is found, set it to free block
	//return Starvrun.PELLET if pellet is found, return Starvrun.POWERUP if powerup is found, return 0 if none are found
	this.tryEatAt = function (x,y) {
		if ((grids[x][y] == Starvrun.PELLET) || (grids[x][y] == Starvrun.POWERUP)) {
			var res = grids[x][y];
			eatAt(x,y);
			return res;
		} else {
			return 0;
		}
	}

	//input: x and y in grid
	//set the grid to free block
	this.eatAt = function(x,y) {
		grids[x][y] = Starvrun.FREE;
	}

	//input: x and y in pixels
	//return true if the map in pixel coordinate x and y is passable, return false otherwise
	this.canPassPx = function(x,y) {
		return this.canPass(this.pxToGrid(x), this.pxToGrid(y));
	}

	//input: x and y in grid
	//return true if the map in grid coordinate x and y is passable, return false otherwise
	this.canPass = function(x,y) {
		return grids[x][y] > 0;
	}

	//dummy, later read from textfile
	var map0 = "###################\n#........#........#\n#.##.###.#.###.##.#\n#.................#\n#.##.#.#####.#.##.#\n#....#...#...#....#\n####.###.#.###.####\n   #.#.......#.#   \n   #.#.#####.#.#   \n   #...#####...#   \n   #.#.#####.#.#   \n   #.#.......#.#   \n####.#.#####.#.####\n#........#........#\n#.##.###.#.###.##.#\n#..#...........#..#\n##.#.#.#####.#.#.##\n#....#...#...#....#\n#.######.#.######.#\n#.................#\n###################";

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