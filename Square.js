/**
 * Đối tượng cho mỗi ô vuông
 * @param {*} x
 * @param {*} y
 * @param {*} w
 * @param {*} h
 */
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

export default Square;
