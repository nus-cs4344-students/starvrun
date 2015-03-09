function Map() {
	//Private variable
	var width = 0;
	var height = 0;
	var grids = [];

	this.widthPx = function () {
		return width*Starvrun.GRID_SIZE;
	}

	this.heightPx = function () {
		return height*Starvrun.GRID_SIZE;
	}

	this.pxToGrid = function (pos) {
		return floor(pos/Starvrun.GRID_SIZE);
	}

	this.gridToPx = function (pos){
		return pos*Starvrun.GRID_SIZE;
	}
	
	this.getMapContentPx = function (x,y) {
		return getMapContent(pxToGrid(x), pxToGrid(y));
	}

	this.getMapContent = function (x,y) {
		return grids[x][y];
	}

	this.setMapContent = function (x,y,i) {
		grids[x][y] = i;
	}

	this.eatAt = function(x,y) {
		grids[x][y] = Starvrun.FREE;
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