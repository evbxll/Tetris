/*
RULES FOR TETRIS

SIZE OF BOARD = 10 WIDE, 20 TALL (24 TALL, BUT TOP 4 ARE NOT IN PLAY)
TYPES OF PIECES = { ALL ARE SIZE 4 SQUARES :
  T, 
  SQUARE, 
  LEFT L,
  RIGHT L,
  LEFT Z,
  RIGHT Z,
  STRAIGHT
}

ACTIONS AVAIBLE = {
  MOVE LEFT,
  MOVE RIGHT, 
  DOWN,
  ROTATE,
  MOVE TO HOLD
}


"NEXT" contains 3 pieces to come next, not including one in play
"HOLD" contains 1 piece which swaps with the piece in play


SCORING = { BASED ON LEVEL (N) MULTIPLIED BY  NUMBER OF LINES CLEARED AT ONCE
  ONE LINE = 40(N+1)
  TWO LINES = 100(N+1)
  THREE LINES 300(N+1)
  FOUR LINES 1200(N+1)
}
*/
export default class Board {
  //USED TO INITIALIZE THE BOARD

  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.board = [];
    this.score = 0;
    this.level = 0;
    this.pivot = [];
    this.pieces = [2,3,4,5,6,7,8] //tracks for tetris "random generator"
    this.coor = [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ];
  this.hold = 4; // default hold: I piece (vertical block)
    this.hold_swapped = false
    this.next = [0, 0, 0]; //stores next three not including one in play
    this.highlevel = 0;
    this.highscore = 0;
    this.droptime = 900;
    this.interval = null; // do not auto-start; App/controls will call start_drop()
    this.create_board();
  }

  create_board() {
    //CREATES BLANK 2D ARRAY OF GIVEN SIZE (HEIGHT AND WIDTH)
    let temp = [];
    for (let row = 0; row < this.height; row++) {
      temp[row] = [];
      for (let col = 0; col < this.width; col++) {
        temp[row][col] = 0; //0;
      }
    }
    this.board = temp;
    this.next_piece_grab();

    return this.board;
  }

  /*
  TYPES OF PIECES AND CODE VALUES ASSIGNED TO THEM = {
    EMPTY = 0
    GHOST/VISUALIZED = 1
    T = 2
    SQUARE = 3
    STRAIGHT LINE = 4
    NORMAL L = 5
    BACKWARDS L = 6
    LEFT Z = 7
    RIGHT Z = 8
    (ALL ABOVE ARE FOR PEICE THAT ARE PLACED)
    (FOR PIECES THAT ARE NOT PLACES, THE CODE WILL BE NEGATIVE THE NUMBER, SO UNPLACED T IS -1)
  }
  */



  gen_piece(mutate, specific_piece) {
    //GENERATES A NEW PIECE
    const piece_codes = {
      //EACH PIECE HAS A NUMBER AS A KEY (COLOR AND PEICE INDETIFIER) AND A SET OF 4 COORDINATEES, AND A PIVOT POINT
      2: [
        [0, 0],
        [1, -1],
        [1, 0],
        [1, 1],
        [1, 0], // RELATIVE PIVOT POINT
      ],
      3: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
        [0.5, 0.5], //RELATIVE PIVOT POINT
      ],
      4: [
        [0, -1],
        [0, 0],
        [0, 1],
        [0, 2],
        [0.5, 0.5], //RELATIVE PIVOT POINT
      ],
      5: [
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
        [1, 0], //RELATIVE PIVOT POINT
      ],
      6: [
        [0, -1],
        [1, -1],
        [1, 0],
        [1, 1],
        [1, 0], //RELATIVE PIVOT POINT
      ],
      7: [
        [0, -1],
        [0, 0],
        [1, 0],
        [1, 1],
        [1, 0], //RELATIVE PIVOT POINT
      ],
      8: [
        [1, -1],
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 0], //RELATIVE PIVOT POINT
      ],
    };  

    if(this.pieces.length === 0){ //MAKES IT SO THAT EACH PIECE GETS GIVEN EVENLY
      this.pieces = [2,3,4,5,6,7,8];
    }
    this.pieces = this.pieces.sort(() => {
      return Math.random() - 0.5;
    })
    let piece_num = this.pieces.pop(this.pieces.length-1); //GETS LAST INT FROM RANDOM SORT LIST
    if (specific_piece > 1) {
      piece_num = 1 * specific_piece;
    }
    if (mutate) {
      let piece = piece_codes[piece_num];
      for (let g = 0; g < 4; g++) { //SHIFTS THE PIECE OVER TO CENTER OF BOARD INSTEAD OF DEAD TOP
        this.board[piece[g][0] + 1][piece[g][1] + 4] = -piece_num;
      }

      this.pivot = piece[4];
      this.pivot[0] += 1;
      this.pivot[1] += 4; //MOVE THE PIVOT ACCORDINGLY WITH THE PIECE SHIFT ABOVE
      this.update_ghost();
    }
    return piece_num;
  }

  sleep(ms) {//USED FOR FALLING TIMEOUT
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  piece_fall() {
    //DROPS PIECE DOWN ONE
    let coor = this.update_coor(); //grabs Coordinates
    let flag = true;
    for (let i = 0; i < 4; i++) {
      let row = coor[i][0];
      let col = coor[i][1];
      if (row === this.height - 1 || this.board[row + 1][col] > 1) {
        flag = false;
      }
    }
    if (flag !== true) {
      this.solidify_piece();
      this.over_stack_check();
    } else {
      //REMOVES THE SPOT AT EACH OF COORDINATES AND ADDS ONE BELOW EACH COORDINATE

      let typ = this.board[coor[0][0]][coor[0][1]];
      for (let i = 0; i < 4; i++) {
        this.board[coor[i][0]][coor[i][1]] = 0;
      }
      for (let i = 0; i < 4; i++) {
        this.board[coor[i][0] + 1][coor[i][1]] = typ;
      }
      this.pivot[0] += 1;
    }
    return flag;
  }

  update_coor() {
    let temp = [[], [], [], []];
    let counter = 0;
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.board[row][col] < 0) {
          this.coor[counter][0] = row;
          this.coor[counter][1] = col;
          temp[counter][0] = row;
          temp[counter][1] = col;
          counter++;
        }
      }
    }
    return temp;
  }

  rotate_piece() {
    //ROTATES THE PIECE CLOCKWISE
    // Rules for rotation taken from here https://gamedev.stackexchange.com/questions/17974/how-to-rotate-blocks-in-tetris

    let coor = this.update_coor(); //grabs Coordinates

    //COVERT EACH POINT RELATIVE TO PIVOT then rotates and stores in new_coor
    let xPivot = this.pivot[0];
    let yPivot = this.pivot[1];
    let new_coor = coor.slice(); //copies but without same memory pointer
    for (let g = 0; g < 4; g++) {
      let temp = [0, 0];
      temp[0] = xPivot + (coor[g][1] - yPivot);
      temp[1] = yPivot + -(coor[g][0] - xPivot);
      new_coor[g] = temp;
    }

    let typ = this.board[coor[0][0]][coor[0][1]]; //Stores value to use for replacing same piece
    //REMOVES THE OLD COOR (NEW COOR IS STILL STORED, SO IT IS OK)
    for (let i = 0; i < 4; i++) {
      this.board[coor[i][0]][coor[i][1]] = 0;
    }

    //GENERATES COORDINATES AND PIV SHIFTED IN EVERY DIR
    let [new_coor_down, new_piv_down] = this.shift_coor(new_coor, this.pivot, 1, 0);
    let [new_coor_up, new_piv_up]= this.shift_coor(new_coor, this.pivot, -1, 0);
    let [new_coor_left, new_piv_left] = this.shift_coor(new_coor, this.pivot, 0, -1);
    let [new_coor_right, new_piv_right] = this.shift_coor(new_coor, this.pivot, 0, 1);


    //CHECKS THAT NEW POSSIBLE COOR ARE VALID
    if (this.coor_is_valid(new_coor)) {
      // no-op: rotation is valid and we'll use new_coor as-is
    } else if (this.coor_is_valid(new_coor_down)) {
      new_coor = new_coor_down;
      this.pivot = new_piv_down;
    } else if (this.coor_is_valid(new_coor_left)) {
      new_coor = new_coor_left;
      this.pivot = new_piv_left;
    } else if (this.coor_is_valid(new_coor_right)) {
      new_coor = new_coor_right;
      this.pivot = new_piv_right;
    } else if (this.coor_is_valid(new_coor_up)) {
      new_coor = new_coor_up;
      this.pivot = new_piv_up;
    } else {
      //Sets old coor as new coor, so no change is made
      new_coor = coor;
    }

    //GO THROUGH AND REPLACE each coor WITH new_coor TO MAKE ROTATED PIECE
    for (let i = 0; i < 4; i++) {
      this.board[new_coor[i][0]][new_coor[i][1]] = typ;
    }

    this.update_ghost();
    return new_coor;
  }



  shift_coor(Coordinates, piv, ver, hor){//SHIFTS COOR IN A GIVEN DIR
    let shifted_coor = []
    for (let i = 0; i < 4; i++) {
      let temp = [];
      temp[0] = Coordinates[i][0] + ver;
      temp[1] = Coordinates[i][1] + hor;
      shifted_coor[i] = temp;
    }
    let shifted_piv = [piv[0] + ver, piv[1] + hor];
    return [shifted_coor, shifted_piv];
  }

  shift_piece(Coordinates, ver, hor){//SHIFTS COOR IN A GIVEN DIR
    let typ = this.board[Coordinates[0][0]][Coordinates[0][1]];
      for (let i = 0; i < 4; i++) {
        this.board[Coordinates[i][0]][Coordinates[i][1]] = 0;
      }
      for (let i = 0; i < 4; i++) {
        this.board[Coordinates[i][0] + ver][Coordinates[i][1] + hor] = typ;
      }
      this.pivot[0] += ver;
      this.pivot[1] += hor;
      this.update_ghost();
  }


  coor_is_valid(coors) {//CHECKS IF COOR IS VALID
    let flag = true;
    for (let i = 0; i < 4; i++) {
      let row = coors[i][0];
      let col = coors[i][1];
      if (
        row > this.board.length - 1 ||
        row < 0 ||
        col > this.board[0].length - 1 ||
        col < 0
      ) {
        flag = false;
        break;
      }
      let coor = this.board[row][col];
      if (coor > 1) {
        flag = false;
      }
    }
    return flag;
  }


  
  move_left() {
    //CHECKS IF MOVE LEFT IS POSSIBLE, THEN DOES IT, OTHERWISE NOTHING
    let coor = this.update_coor(); //grabs Coordinates

    let new_coor = this.shift_coor(coor, this.pivot, 0, -1)[0];
    if(this.coor_is_valid(new_coor)){
      this.shift_piece(coor, 0, -1)
    }
    return true
  }



  move_right() {
    //CHECKS IF MOVE RIGHT IS POSSIBLE, THEN DOES IT, OTHERWISE NOTHING
    let coor = this.update_coor(); //grabs Coordinates
    let new_coor = this.shift_coor(coor, this.pivot, 0, 1)[0];
    if(this.coor_is_valid(new_coor)){
      this.shift_piece(coor, 0, 1)
    }
    return true
  }



  move_drop() {
    //SCANS FOR PEICE, WHEN FOUND IT DOES PIECE_FALL() UNTIL PIECE NO LONGER EXISTS
    let check = this.piece_fall();
    this.score_increase(100);
    clearInterval(this.interval);
    this.interval = setInterval(() => {this.piece_fall()}, this.droptime);
    return check;
  }


  hard_drop(){
    let diff = 0;
    let coor = this.update_coor();
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.board[row][col] === 1) {

          //Used to add 2 points times level times the number of levels dropped
          diff = 2*(row-coor[0][0]-1); 

          this.board[row][col] = this.board[coor[0][0]][coor[0][1]];
        }
      }
    }
    for (let i = 0; i < 4; i++) {
      this.board[coor[i][0]][coor[i][1]] = 1;
    }
    this.score_increase(diff*100);
    this.solidify_piece();
    this.over_stack_check();
    return true
  }



  move_hold_swap() {
    if(this.hold_swapped === false) {
      //SWAPS INTO HOLD
      let coor = this.update_coor();
      if (this.hold < 2) {
        this.hold = -this.board[coor[0][0]][coor[0][1]];
        for (let i = 0; i < 4; i++) {
          this.board[coor[i][0]][coor[i][1]] = 0;
        }
        this.next_piece_grab();
      } else {
        let temp = 1 * -this.board[coor[0][0]][coor[0][1]];
        for (let i = 0; i < 4; i++) {
          this.board[coor[i][0]][coor[i][1]] = 0;
        }
        this.gen_piece(true, this.hold);
        this.hold = 1 * temp; //copies without same memory
      }
      this.hold_swapped = true;
      return this.hold;
    }
  }



  next_piece_grab() {
    if (this.next[0] === 0 || this.next[1] === 0) {
      for (let i = 0; i < 3; i++) {
        this.next[i] = this.gen_piece(false, 0);
      }
    }
    let next_piece = 1 * this.next[0];
    this.next = [this.next[1], this.next[2], this.gen_piece(false, 0)];
    this.gen_piece(true, next_piece);
    return next_piece;
  }




  solidify_piece() {
    let coor = this.update_coor();
    for (let i = 0; i < 4; i++) {
      this.board[coor[i][0]][coor[i][1]] *= -1;
    }
    this.hold_swapped = false;
    this.line_cleared_check();
    this.next_piece_grab();
  }

  update_ghost() {
    //removes old ghost tiles
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.board[row][col] === 1) {
          this.board[row][col] = 0;
        }
      }
    }

    //PUTS THE GHOST piece in
    let coor = this.update_coor();
    let counter = 0;
    let ghost_dist = 0;
    let flag = true;
    while (flag) {
      counter++;
      for (let i = 0; i < 4; i++) {
        if (coor[i][0] + counter > this.board.length - 1) {
          flag = false;
        } else {
          let spot = this.board[coor[i][0] + counter][coor[i][1]];
          if (spot > 1) {
            flag = false;
          }
        }
      }
      if (flag) {
        ghost_dist++;
      }
    }
    for (let i = 0; i < 4; i++) {
      let spot = this.board[coor[i][0] + ghost_dist][coor[i][1]];
      if (spot === 0) {
        this.board[coor[i][0] + ghost_dist][coor[i][1]] = 1;
      }
    }
    return ghost_dist;
  }

  line_cleared_check() {
    let rows_clear = [];
    for (let i = 0; i < this.board.length; i++) {
      let row_cleared = true;
      for (let j = 0; j < this.board[i].length; j++) {
        if (this.board[i][j] <= 1) {
          row_cleared = false;
        }
      }
      if (row_cleared) {
        rows_clear.push(i);
      }
    }
    let cleared_lines_len = rows_clear.length;
    this.score_increase(cleared_lines_len);

    for (let i = 0; i < cleared_lines_len; i++) {
      for (let j = 0; j < this.board[rows_clear[i]].length; j++) {
        this.board[rows_clear[i]][j] = 0;
      }
    }
    let row_cleared_max = Math.max(...rows_clear);

    for (let i = row_cleared_max; i >= 0; i--) {
      for (let j = 0; j < this.board[i].length; j++) {
        if (this.board[i][j] > 1) {
          let counter = 0;
          for (let each = 0; each < cleared_lines_len; each++) {
            if (rows_clear[each] > i) {
              counter++;
            }
          }
          let temp = this.board[i][j];
          this.board[i][j] = 0;
          this.board[i + counter][j] = temp;
        }
      }
    }

    return rows_clear;
  }

  over_stack_check() {
    //checks if stack goes above top, then ends if it does
    let flag = true;
    for(let i=0; i<this.board[3].length; i++){
        if(this.board[3][i] > 0){
          flag = false;
        }
    }
    if(flag !== true){
      let level_score = this.reset_all();
      this.highscore = Math.max(level_score[1], this.highscore);
      this.highlevel = Math.max(level_score[0], this.highlevel);
    }
  } 

  time_drop_calc(){
    this.droptime = 700*((0.86)**(0.5*(this.level)))+200;
  }

  level_update(){
    this.level = Math.max(this.level, Math.floor(     (-65+Math.sqrt(13*(325+this.score*2)))/130  ));
    this.time_drop_calc();
  }

  reset_all(){
    //RESETS THE BOARD AND ALL THE SCORE, RETURNS THE SCORE AND LEVEL
    let score = this.score;
    let level = this.level;
    this.board = [];
    this.score = 0;
    this.level = 0;
    this.droptime = 900;
    this.pieces = [2,3,4,5,6,7,8] //tracks for tetris "random generator"
    this.pivot = [];
    this.coor = [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ];
  this.hold = 4; // reset default hold to I piece
    this.hold_swapped = false;
    this.next = [0, 0, 0]; //stores next three not including one in play
    this.create_board();
    return [level, score];
  }

  score_increase(lines_cleared) {
    //input of greater than 100 means I want to increment, not lines clear

    if (lines_cleared > 4) {
      let increment = lines_cleared/100;
      this.score = this.score + increment*(this.level+1);
    } else {
      if (lines_cleared === 1) {
        this.score = this.score + (this.level + 1) * 40;
      }
      if (lines_cleared === 2) {
        this.score = this.score + (this.level + 1) * 100;
      }
      if (lines_cleared === 3) {
        this.score = this.score + (this.level + 1) * 300;
      }
      if (lines_cleared === 4) {
        this.score = this.score + (this.level + 1) * 1200;
      }
      this.level_update();
    }
    return this.score;
  }

  stop_drop(){
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = null;
  }

  start_drop(){
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {this.piece_fall()}, this.droptime);
  }
}

