// game params
/**Khoảng thời gian chờ đợi cho máy đánh */
const computerWait = 1; // -> 1s
const startOver = 3;
const FPS = 30; // frames

/**Kích thước lưới dot (rows and cols) */
const gridSize = 3;
const HEIGHT = 550; // pixels

// calculated dimensions
const WIDTH = HEIGHT * 0.9;
const CELL = WIDTH / (gridSize + 2); // size of the cells  and margins
const STROKE = CELL / 12; // for lines
const DOT = STROKE; // dot radius
const MARGIN = HEIGHT - (gridSize + 1) * CELL; // top margin

// colors
const boardColor = "grey";
const boarderColor = "black";
const dotColor = "white";
// Màu cho player
const playerColor = "blue"; // Khi nhấn vào dòng
const playerColorLight = "lightblue"; // Khi di chuột vào dòng
// Màu cho máy
const compColor = "red";
const compColorLight = "pink";

//texts
const textComp = "CPU";
const textPlayer = "Player";

// for the squares
const Side = {
  BOT: 0,
  LEFT: 1,
  RIGHT: 2,
  TOP: 3,
};

// Tạo khung màn hình game
var canv = document.createElement("canvas");
canv.height = HEIGHT;
canv.width = WIDTH;
document.body.appendChild(canv);

// mouse and canv cords are not the same so have to do some weird math to help
var canvRect = canv.getBoundingClientRect();

// setting up the context
var ctx = canv.getContext("2d");
ctx.lineWidth = STROKE;

// game vars
var squares;
var tempSquares;
var compSide = [];
var playerTurn;
var currentCells;
var playerScore, compScore;
var timeComp;
var MAXLEVEL = 2;
var choice;

var move = [];

var validSquare = [];
var cX;
var cY;

// start new
newGame();

// Xử lí sự kiện trên canvas
canv.addEventListener("mousemove", highlightGrid); // Khi di chuột
canv.addEventListener("click", click); // Khi nhấn

// setting up game loop
var myVar = setInterval(loop, 1000 / FPS);

// NEW GAME TO RESET THE GAME BOARD AND VARS (NOT COMPLETELY IMPLEMNTED GAME JUST ENDS RIGHT NOW)
function newGame() {
  // init squares
  currentCells = [];
  // Điểm ban đầu (player và computer)
  playerScore = 0;
  compScore = 0;

  playerTurn = 1;
  squares = [];

  // Thực hiện tạo UI dựa trên các ô vuông
  for (let i = 0; i < gridSize; i++) {
    // row
    squares[i] = [];
    for (let j = 0; j < gridSize; j++) {
      // row
      squares[i][j] = new Square(getX(j), getY(i), CELL, CELL);
    }
  }
}

// main loop
function loop() {
  drawBoard();
  drawSquares();
  drawGrid();
  drawScores();
  choose(1);
}

// ############# FUNCTIONS FOR DRAWING BOARD AND LINE #######################
// drawing booard
function drawBoard() {
  ctx.fillStyle = boardColor;
  ctx.strokeStyle = boarderColor;
  ctx.fillRect(0, 0, WIDTH, HEIGHT); // fist two params are start of rect
  ctx.strokeRect(STROKE / 2, STROKE / 2, WIDTH - STROKE, HEIGHT - STROKE);
}

// function to be able to get cord to draw the dots
function drawDot(x, y) {
  ctx.fillStyle = dotColor;
  // draw a circle
  ctx.beginPath();
  ctx.arc(x, y, DOT, 0, Math.PI * 2, false);
  ctx.fill();
}

function drawGrid() {
  for (let i = 0; i < gridSize + 1; i++) {
    // loop for rows
    for (let j = 0; j < gridSize + 1; j++) {
      // loop for cols
      drawDot(getX(j), getY(i));
    }
  }
}

function drawLine(x, y, x1, y1, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

function drawScores() {
  drawText("PLAYER", WIDTH * 0.15, MARGIN * 0.25, playerColor, "25px Arial");
  drawText("COMPUTER", WIDTH * 0.6, MARGIN * 0.25, compColor, "25px Arial");

  drawText(playerScore, WIDTH * 0.23, MARGIN * 0.6, playerColor, "50px Arial");
  drawText(compScore, WIDTH * 0.73, MARGIN * 0.6, compColor, "50px Arial");

  if (playerScore + compScore == gridSize * gridSize) {
    if (playerScore > compScore) {
      drawText(
        "PLAYER WINS!",
        WIDTH * 0.4,
        MARGIN * 0.5,
        compColor,
        "15px Arial"
      );
      clearInterval(myVar);
    } else if (playerScore < compScore) {
      drawText(
        "COMPUTER WINS!",
        WIDTH * 0.4,
        MARGIN * 0.5,
        compColor,
        "15px Arial"
      );
      clearInterval(myVar);
    }
  }
}

function drawSquares() {
  for (let row of squares) {
    for (let square of row) {
      square.drawSides();
      square.drawFill();
    }
  }
}

function drawText(text, x, y, color, size) {
  ctx.fillStyle = color;
  ctx.font = size;
  ctx.fillText(text, x, y);
}
// ############# END OF DRAWING FUNCTIONS #######################

function getColor(player, light) {
  if (player) {
    if (light) {
      return playerColorLight;
    } else {
      return playerColor;
    }
  } else {
    if (light) {
      return compColorLight;
    } else {
      return compColor;
    }
  }
}

// get col
function getX(col) {
  return CELL * (col + 1);
}

// get roe
function getY(row) {
  return MARGIN + CELL * row;
}

// ############# MAIN AI FUNCTIONS #######################

// functions to copy the real squares to temp squares
function copy() {
  let tempsquares = [];
  // init temps squares
  for (let i = 0; i < gridSize; i++) {
    // row
    tempsquares[i] = [];
    for (let j = 0; j < gridSize; j++) {
      // row
      tempsquares[i][j] = new Square(getX(j), getY(i), CELL, CELL);
    }
  }

  // need json so i can succesfully copy objects deeper
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[0].length; j++) {
      tempsquares[i][j] = JSON.parse(JSON.stringify(squares[i][j]));
    }
  }

  return tempsquares;
}

// main H va
function eval(squares, who) {
  let owned = 0;
  let powned = 0;
  let three = 0;
  let one = 0;
  let two = 0;
  let pthree = 0;
  let playerScore = 0;
  let tempSquare;
  let count = 0;

  for (let i = 0; i < tempSquares.length; i++) {
    for (let j = 0; j < tempSquares[0].length; j++) {
      if (who == 1) {
        if (tempSquares[i][j].numSelected == 4) {
          owned++;
          console.log("owned");
        } else if (tempSquares[i][j].numSelected == 3) {
          three++;
        } else if (tempSquares[i][j].numSelected == 2) {
          two++;
        } else if (tempSquares[i][j].numSelected == 1) {
          one++;
        }

        if (tempSquares[i][j].owner == true) {
          playerScore++;
        }
      } else {
        if (tempSquares[i][j].numSelected == 4) {
          powned++;
          //console.log("owned");
        } else if (tempSquares[i][j].numSelected == 3) {
          pthree++;
        } else if (tempSquares[i][j].numSelected == 2) {
          two++;
        } else if (tempSquares[i][j].numSelected == 1) {
          one++;
        }

        if (tempSquares[i][j].owner == true) {
          playerScore++;
        }
      }
    }
  }
  return one * 10 + two * 5 + powned * 20 - owned * 20 - three * 30;
}

function choose(level) {
  if (playerTurn) {
    return;
  }

  // computer selection counf
  if (timeComp > 0) {
    timeComp--;
    if (timeComp == 0) {
      selectSide();

      //            /validSquare = [];
      //choose();
      //playerTurn = !playerTurn;
    }
    return;
  }

  //    let rand = Math.floor(Math.random() * validSquare.length);
  getMax(1);
  console.log(compSide[0]);

  let rand = Math.floor(Math.random() * validSquare.length);
  let coords = validSquare[rand].getFreeSide(compSide[rand]);
  highlightSide(coords.x, coords.y);
  validSquare = [];
  compSide = [];
  //selectSide();

  timeComp = Math.ceil(computerWait * FPS);
}

function getMax(level) {
  let max = -1;
  let val;
  let tempSquare = [];

  validSquare = [];

  let count = 0;
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[0].length; j++) {
      for (let t = 0; t < 4; t++) {
        tempSquares = copy();
        tempSquare = [
          tempSquares[i][j].sideBot,
          tempSquares[i][j].sideLeft,
          tempSquares[i][j].sideRight,
          tempSquares[i][j].sideTop,
        ];

        if (tempSquare[t].selected == false) {
          tempSquare[t].selected = true;
          tempSquares[i][j].numSelected++;

          console.log(" square : ", tempSquares[i][j]);

          let row = i,
            col = j;
          if (Side.LEFT == t && j > 0) {
            col = j - 1;
            tempSquares[row][col].sideRight.selected = true;
            tempSquares[row][col].numSelected++;
          } else if (Side.RIGHT == t && j < col - 1) {
            col = j + 1;
            tempSquares[row][col].sideLeft.selected = true;
            tempSquares[row][col].numSelected++;
          } else if (Side.TOP == t && i > 0) {
            row = i - 1;
            tempSquares[row][col].sideBot.selected = true;
            tempSquares[row][col].numSelected++;
          } else if (Side.BOT == t && i < row - 1) {
            row = i + 1;
            tempSquares[row][col].sideTop.selected = true;
            tempSquares[row][col].numSelected++;
          }

          // max level
          if (level == MAXLEVEL) {
            val = eval(tempSquares, 1);
            //tempSquare[t].selected = false;
          } else {
            val = getMin(2);
            console.log("this is val: ", val);
            //tempSquare[t].selected = false;
          }
          console.log(val);

          tempSquare[t].selected = false;
          tempSquares[i][j].numSelected--;
          if (t == 0) {
            tempSquares[row][row].sideBot.selected = false;
            tempSquares[row][col].numSelected--;
          } else if (t == 1) {
            tempSquares[row][row].sideLeft.selected = false;
            tempSquares[row][col].numSelected--;
          } else if (t == 2) {
            tempSquares[row][row].sideRight.selected = false;
            tempSquares[row][col].numSelected--;
          } else if (t == 0) {
            tempSquares[row][row].sideTop.selected = false;
            tempSquares[row][col].numSelected--;
          }

          if (val >= max) {
            max = val;
            validSquare[0] = squares[i][j];

            if (t == 0) {
              compSide[0] = "Bot";
            } else if (t == 1) {
              compSide[0] = "Left";
            } else if (t == 2) {
              compSide[0] = "Right";
            } else {
              compSide[0] = "Top";
            }
          }
        }
      }
    }
  }
  return max;
}

function getMin(level) {
  let min = 1001;
  let val;
  let side;
  let holder;

  let tempSquare = [];
  // set up temp board
  // loop through the square

  for (let i = 0; i < tempSquares.length; i++) {
    for (let j = 0; j < tempSquares[0].length; j++) {
      //tempSquares = copy(tempSquares,squares);

      for (let t = 0; t < 4; t++) {
        //tempSquares = copy();
        tempSquare = [
          tempSquares[i][j].sideBot,
          tempSquares[i][j].sideLeft,
          tempSquares[i][j].sideRight,
          tempSquares[i][j].sideTop,
        ];

        if (tempSquare[t].selected != true) {
          tempSquare[t].selected = true;
          tempSquares[i][j].numSelected++;

          //console.log(MAXLEVEL);
          let row = i,
            col = j;
          if (Side.LEFT == t && j > 0) {
            col = j - 1;
            tempSquares[row][col].sideRight.selected = true;
            tempSquares[row][col].numSelected++;
          } else if (Side.RIGHT == t && j < col - 1) {
            col = j + 1;
            tempSquares[row][col].sideLeft.selected = true;
            tempSquares[row][col].numSelected++;
          } else if (Side.TOP == t && i > 0) {
            row = i - 1;
            tempSquares[row][col].sideBot.selected = true;
            tempSquares[row][col].numSelected++;
          } else if (Side.BOT == t && i < row - 1) {
            row = i + 1;
            tempSquares[row][col].sideTop.selected = true;
            tempSquares[row][col].numSelected++;
          }

          // max level
          if (level == MAXLEVEL) {
            val = eval(tempSquares, 0);
            //tempSquare[t].selected = false;
          } else {
            val = getMax(2);
            // tempSquare[t].selected = false;
          }
          tempSquare[t].selected = false;
          tempSquares[i][j].numSelected--;
          if (t == 0) {
            tempSquares[row][row].sideBot.selected = false;
            tempSquares[row][col].numSelected--;
          } else if (t == 1) {
            tempSquares[row][row].sideLeft.selected = false;
            tempSquares[row][col].numSelected--;
          } else if (t == 2) {
            tempSquares[row][row].sideRight.selected = false;
            tempSquares[row][col].numSelected--;
          } else if (t == 0) {
            tempSquares[row][row].sideTop.selected = false;
            tempSquares[row][col].numSelected--;
          }
          //console.log(val);
          if (val <= min) {
            min = val;
          }
        }
      }
    }
  }

  console.log("0: ", tempSquares[0][0]);
  return min;
}

// ############# END AI FUNCTIONS #######################

// ############## Xử lí sự kiện #####################
function click(/** @type {MouseEvent} */ ev) {
  let count = 1;
  if (!playerTurn) {
    //console.log("hello");
    //getMax(squares,1);
    //playerTurn =!playerTurn;
    //selectSide();
    return;
  }

  //getMax(squares, 1);
  selectSide();
  //choose(1);
}

function highlightGrid(/** @type {MouseEvent} */ ev) {
  if (!playerTurn) {
    return;
  }

  // get mouse position in canv
  let x = ev.clientX - canvRect.left;
  let y = ev.clientY - canvRect.top;

  // highlight the squares side
  highlightSide(x, y);
}
// ############### END OF EVENTS #################

// ####### HELPS HIGHLIGHT SIDES FOR PLAYER AND COMP ###########
function highlightSide(x, y) {
  // clear other highlight
  for (let row of squares) {
    for (let square of row) {
      square.highlight = null;
    }
  }

  // checking each cell
  let rows = squares.length;
  let cols = squares[0].length;
  currentCells = [];
  OUTER: for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (squares[i][j].contains(x, y)) {
        // highlight current
        let side = squares[i][j].highlightSide(x, y);
        if (side != null) {
          currentCells.push({ row: i, col: j });
        }

        // determine nieghbor
        let row = i,
          col = j,
          highlight,
          nieghbor = true;
        if (side == Side.LEFT && j > 0) {
          col = j - 1;
          highlight = Side.RIGHT;
        } else if (side == Side.RIGHT && j < cols - 1) {
          col = j + 1;
          highlight = Side.LEFT;
        } else if (side == Side.TOP && i > 0) {
          row = i - 1;
          highlight = Side.BOT;
        } else if (side == Side.BOT && i < rows - 1) {
          row = i + 1;
          highlight = Side.TOP;
        } else {
          nieghbor = false;
        }

        // if there is a nieghbor
        if (nieghbor) {
          squares[row][col].highlight = highlight;
          currentCells.push({ row: row, col: col });
        }
        break OUTER;
      }
    }
  }
}

function selectSide() {
  if (currentCells == null || currentCells.length == 0) {
    return;
  }

  // select sides
  let filledSquare = false;
  for (let cell of currentCells) {
    if (squares[cell.row][cell.col].selectSide()) {
      filledSquare = true;
    }
  }
  currentCells = [];

  // check winner
  if (filledSquare) {
    //todo check winner
    if (compScore + playerScore == gridSize * gridSize) {
      // todo winner
    }
  } else {
    // SWITH PLAYER
    playerTurn = !playerTurn;
  }
}
// ########### END HIGHLIGHTING AND SIDE ######################

// object for each square
function Square(x, y, w, h) {
  this.w = w;
  this.h = h;
  this.left = x;
  this.right = x + w;
  this.top = y;
  this.bot = y + h;

  this.highlight = null;

  this.numSelected = 0;

  this.owner = null;

  this.sideBot = { owner: null, selected: false };
  this.sideLeft = { owner: null, selected: false };
  this.sideRight = { owner: null, selected: false };
  this.sideTop = { owner: null, selected: false };

  this.contains = function (x, y) {
    return x >= this.left && x < this.right && y >= this.top && y < this.bot;
  };

  this.drawFill = function () {
    // todo fill
    if (this.owner == null) {
      return;
    }

    // give background
    ctx.fillStyle = getColor(this.owner, true);
    ctx.fillRect(
      this.left + STROKE,
      this.top + STROKE,
      this.w - STROKE * 2,
      this.h - STROKE * 2
    );
  };

  this.drawSide = function (side, color) {
    switch (side) {
      case Side.BOT:
        drawLine(this.left, this.bot, this.right, this.bot, color);
        break;
      case Side.LEFT:
        drawLine(this.left, this.top, this.left, this.bot, color);
        break;
      case Side.RIGHT:
        drawLine(this.right, this.top, this.right, this.bot, color);
        break;
      case Side.TOP:
        drawLine(this.left, this.top, this.right, this.top, color);
        break;
    }
  };

  this.drawSides = function () {
    // highlighting
    if (this.highlight != null) {
      this.drawSide(this.highlight, getColor(playerTurn, true));
    }

    // selected sides
    if (this.sideBot.selected) {
      this.drawSide(Side.BOT, getColor(this.sideBot.owner, false));
    }
    if (this.sideLeft.selected) {
      this.drawSide(Side.LEFT, getColor(this.sideLeft.owner, false));
    }
    if (this.sideRight.selected) {
      this.drawSide(Side.RIGHT, getColor(this.sideRight.owner, false));
    }
    if (this.sideTop.selected) {
      this.drawSide(Side.TOP, getColor(this.sideTop.owner, false));
    }
  };

  // return free side
  this.getFreeSide = function (location) {
    // valid cords
    let coordsBot = { x: this.left + this.w / 2, y: this.bot - 1 };
    let coordsLeft = { x: this.left, y: this.top + this.h / 2 };
    let coordsRight = { x: this.right - 1, y: this.top + this.h / 2 };
    let coordsTop = { x: this.left + this.w / 2, y: this.top };

    //choose random side
    let freeCoords = [];
    if (location == "Bot") {
      freeCoords.push(coordsBot);
      //console.log(location);
    }
    if (location == "Left") {
      freeCoords.push(coordsLeft);
      //console.log(location);
    }
    if (location == "Right") {
      freeCoords.push(coordsRight);
      //console.log(location);
    }
    if (location == "Top") {
      freeCoords.push(coordsTop);
      //console.log(location);
    }

    return freeCoords[0];
  };

  this.highlightSide = function (x, y) {
    // calculate distance to side
    let dBot = this.bot - y;
    let dLeft = x - this.left;
    let dRight = this.right - x;
    let dTop = y - this.top;

    // determine closest value
    let dCloset = Math.min(dBot, dLeft, dRight, dTop);

    // highlist closets if not selected
    if (dCloset == dBot && !this.sideBot.selected) {
      this.highlight = Side.BOT;
    } else if (dCloset == dLeft && !this.sideLeft.selected) {
      this.highlight = Side.LEFT;
    } else if (dCloset == dRight && !this.sideRight.selected) {
      this.highlight = Side.RIGHT;
    } else if (dCloset == dTop && !this.sideTop.selected) {
      this.highlight = Side.TOP;
    }

    return this.highlight;
  };

  this.selectSide = function () {
    if (this.highlight == null) {
      return;
    }

    // select highlighted side
    switch (this.highlight) {
      case Side.BOT:
        this.sideBot.owner = playerTurn;
        this.sideBot.selected = true;
        break;
      case Side.LEFT:
        this.sideLeft.owner = playerTurn;
        this.sideLeft.selected = true;
        break;
      case Side.RIGHT:
        this.sideRight.owner = playerTurn;
        this.sideRight.selected = true;
        break;
      case Side.TOP:
        this.sideTop.owner = playerTurn;
        this.sideTop.selected = true;
        break;
    }

    this.highlight == null;

    this.numSelected++;
    if (this.numSelected == 4) {
      this.owner = playerTurn;

      //increment score
      if (playerTurn) {
        playerScore++;
      } else {
        compScore++;
      }
      //filled
      return true;
    }

    // not filled
    return false;
  };
}
