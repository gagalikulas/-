const DiagonalMovement = {
    Always: 1,
    Never: 2,
    IfAtMostOneObstacle: 3,
    OnlyWhenNoObstacles: 4
};

var Heap, defaultCmp, floor, heappop, heappush, min, updateItem, _siftdown, _siftup;

floor = Math.floor, min = Math.min;

defaultCmp = function(x, y) {
    if (x < y) {
    	return -1;
    }
    if (x > y) {
        return 1;
    }
    return 0;
};

heappush = function(array, item, cmp) {
    if (cmp == null) {
        cmp = defaultCmp;
    }
    array.push(item);
    return _siftdown(array, 0, array.length - 1, cmp);
};

heappop = function(array, cmp) {
    var lastelt, returnitem;
    if (cmp == null) {
        cmp = defaultCmp;
    }
    lastelt = array.pop();
    if (array.length) {
        returnitem = array[0];
        array[0] = lastelt;
        _siftup(array, 0, cmp);
    } else {
        returnitem = lastelt;
    }
    return returnitem;
};

updateItem = function(array, item, cmp) {
    var pos;
    if (cmp == null) {
        cmp = defaultCmp;
    }
    pos = array.indexOf(item);
    if (pos === -1) {
        return;
    }
    _siftdown(array, 0, pos, cmp);
    return _siftup(array, pos, cmp);
};

_siftdown = function(array, startpos, pos, cmp) {
    var newitem, parent, parentpos;
    if (cmp == null) {
    	cmp = defaultCmp;
    }
    newitem = array[pos];
    while (pos > startpos) {
    	parentpos = (pos - 1) >> 1;
        parent = array[parentpos];
    	if (cmp(newitem, parent) < 0) {
        	array[pos] = parent;
        	pos = parentpos;
        	continue;
        }
      	break;
    }
    return array[pos] = newitem;
};

_siftup = function(array, pos, cmp) {
    var childpos, endpos, newitem, rightpos, startpos;
    if (cmp == null) {
    	cmp = defaultCmp;
    }
    endpos = array.length;
    startpos = pos;
    newitem = array[pos];
    childpos = 2 * pos + 1;
    while (childpos < endpos) {
    	rightpos = childpos + 1;
    	if (rightpos < endpos && !(cmp(array[childpos], array[rightpos]) < 0)) {
        	childpos = rightpos;
      	}
      	array[pos] = array[childpos];
      	pos = childpos;
      	childpos = 2 * pos + 1;
    }
    array[pos] = newitem;
    return _siftdown(array, startpos, pos, cmp);
};

Heap = (function() {
    Heap.push = heappush;

    Heap.pop = heappop;

    Heap.updateItem = updateItem;

    function Heap(cmp) {
    	this.cmp = cmp != null ? cmp : defaultCmp;
      	this.nodes = [];
    }

    Heap.prototype.push = function(x) {
      	return heappush(this.nodes, x, this.cmp);
    };

    Heap.prototype.pop = function() {
      	return heappop(this.nodes, this.cmp);
    };

    Heap.prototype.empty = function() {
      	return this.nodes.length === 0;
    };

    Heap.prototype.updateItem = function(x) {
      	return updateItem(this.nodes, x, this.cmp);
    };

    return Heap;
})();

function backtrace(node) {
    var path = [[node.x, node.y]];
    while (node.parent) {
        node = node.parent;
        path.push([node.x, node.y]);
    }
    return path.reverse();
};

const manhattan = (dx, dy) => {return dx + dy};

function octile(dx, dy){
    var F = Math.SQRT2 - 1;
	return (dx < dy) ? F * dx + dy : F * dy + dx;
};

function Node(x, y, walkable) {
    this.x = x;
    this.y = y;
    this.walkable = (walkable === undefined ? true : walkable);
}

function Grid(width_or_matrix, height, matrix) {
    var width;

    if (typeof width_or_matrix !== 'object') {
        width = width_or_matrix;
    } else {
        height = width_or_matrix.length;
        width = width_or_matrix[0].length;
        matrix = width_or_matrix;
    }

    this.width = width;
    this.height = height;
    this.nodes = this._buildNodes(width, height, matrix);
};

Grid.prototype.getNodeAt = function(x, y) {
    return this.nodes[y][x];
};

Grid.prototype.isInside = function(x, y) {
    return (x >= 0 && x < this.width) && (y >= 0 && y < this.height);
};

Grid.prototype.isWalkableAt = function(x, y) {
    return this.isInside(x, y) && this.nodes[y][x].walkable;
};

Grid.prototype._buildNodes = function(width, height, matrix) {
    var i, j,
        nodes = new Array(height);

    for (i = 0; i < height; ++i) {
        nodes[i] = new Array(width);
        for (j = 0; j < width; ++j) {
            nodes[i][j] = new Node(j, i);
        }
    }


    if (matrix === undefined) {
        return nodes;
    }

    if (matrix.length !== height || matrix[0].length !== width) {
        throw new Error('Matrix size does not fit');
    }

    for (i = 0; i < height; ++i) {
        for (j = 0; j < width; ++j) {
            if (matrix[i][j]) {
                // 0, false, null will be walkable
                // while others will be un-walkable
                nodes[i][j].walkable = false;
            }
        }
    }

    return nodes;
};


Grid.prototype.getNeighbors = function(node, diagonalMovement) {
    var x = node.x,
        y = node.y,
        neighbors = [],
        s0 = false, d0 = false,
        s1 = false, d1 = false,
        s2 = false, d2 = false,
        s3 = false, d3 = false,
        nodes = this.nodes;


    if (this.isWalkableAt(x, y - 1)) {
        neighbors.push(nodes[y - 1][x]);
        s0 = true;
    }

    if (this.isWalkableAt(x + 1, y)) {
        neighbors.push(nodes[y][x + 1]);
        s1 = true;
    }

    if (this.isWalkableAt(x, y + 1)) {
        neighbors.push(nodes[y + 1][x]);
        s2 = true;
    }

    if (this.isWalkableAt(x - 1, y)) {
        neighbors.push(nodes[y][x - 1]);
        s3 = true;
    }

    if (diagonalMovement === DiagonalMovement.Never) {
        return neighbors;
    }

    if (diagonalMovement === DiagonalMovement.OnlyWhenNoObstacles) {
        d0 = s3 && s0;
        d1 = s0 && s1;
        d2 = s1 && s2;
        d3 = s2 && s3;
    } else if (diagonalMovement === DiagonalMovement.IfAtMostOneObstacle) {
        d0 = s3 || s0;
        d1 = s0 || s1;
        d2 = s1 || s2;
        d3 = s2 || s3;
    } else if (diagonalMovement === DiagonalMovement.Always) {
        d0 = true;
        d1 = true;
        d2 = true;
        d3 = true;
    } else {
        throw new Error('Incorrect value of diagonalMovement');
    }

    if (d0 && this.isWalkableAt(x - 1, y - 1)) {
        neighbors.push(nodes[y - 1][x - 1]);
    }

    if (d1 && this.isWalkableAt(x + 1, y - 1)) {
        neighbors.push(nodes[y - 1][x + 1]);
    }

    if (d2 && this.isWalkableAt(x + 1, y + 1)) {
        neighbors.push(nodes[y + 1][x + 1]);
    }

    if (d3 && this.isWalkableAt(x - 1, y + 1)) {
        neighbors.push(nodes[y + 1][x - 1]);
    }

    return neighbors;
};


function AStarFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal;
    this.dontCrossCorners = opt.dontCrossCorners;
    this.heuristic = opt.heuristic || manhattan;
    this.weight = opt.weight || 1;
    this.diagonalMovement = opt.diagonalMovement;

    if (!this.diagonalMovement) {
        if (!this.allowDiagonal) {
            this.diagonalMovement = DiagonalMovement.Never;
        } else {
            if (this.dontCrossCorners) {
                this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
            } else {
                this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
            }
        }
    }

    if (this.diagonalMovement === DiagonalMovement.Never) {
        this.heuristic = opt.heuristic || manhattan;
    } else {
        this.heuristic = opt.heuristic || octile;
    }
}

AStarFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    var openList = new Heap(function(nodeA, nodeB) {
            return nodeA.f - nodeB.f;
        }),
        startNode = grid.getNodeAt(startX, startY),
        endNode = grid.getNodeAt(endX, endY),
        heuristic = this.heuristic,
        diagonalMovement = this.diagonalMovement,
        weight = this.weight,
        abs = Math.abs, SQRT2 = Math.SQRT2,
        node, neighbors, neighbor, i, l, x, y, ng;

    startNode.g = 0;
    startNode.f = 0;

    openList.push(startNode);
    startNode.opened = true;

    while (!openList.empty()) {

        node = openList.pop();
        node.closed = true;

        if (node === endNode) {
            return backtrace(endNode);
        }

        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0, l = neighbors.length; i < l; ++i) {
            neighbor = neighbors[i];

            if (neighbor.closed) {
                continue;
            }

            x = neighbor.x;
            y = neighbor.y;

            ng = node.g + ((x - node.x === 0 || y - node.y === 0) ? 1 : SQRT2);

            if (!neighbor.opened || ng < neighbor.g) {
                neighbor.g = ng;
                neighbor.h = neighbor.h || weight * heuristic(abs(x - endX), abs(y - endY));
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = node;

                if (!neighbor.opened) {
                    openList.push(neighbor);
                    neighbor.opened = true;
                } else {
                    openList.updateItem(neighbor);
                }
            }
        }
    }
    return [];
};
