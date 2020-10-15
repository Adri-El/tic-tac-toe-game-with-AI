class Board {
	constructor(state = ['','','','','','','','','']) {
        this.state = state;
    }

    printFormattedBoard() {
      let formattedString = '';
        this.state.forEach((cell, index) => {
          formattedString += cell ? ` ${cell} |` : '   |';
         
          if((index + 1) % 3 == 0)  {
            formattedString = formattedString.slice(0, -1);
            if(index < 8) formattedString += '\n\u2015\u2015\u2015 \u2015\u2015\u2015 \u2015\u2015\u2015\n';
          }
      });
      console.log('%c' + formattedString, 'color: #6d4e42;font-size:16px');
    }
    isEmpty() {
      return this.state.every(cell => !cell);
    }
    isFull() {
      return this.state.every(cell => cell);
  }
  isTerminal() {
    //Return False if board in empty
      if(this.isEmpty()) return false;
      //Check for Horizontal Wins
      if(this.state[0] == this.state[1] && this.state[0] == this.state[2] && this.state[0]) {
        return {'winner': this.state[0], 'direction': 'H', 'row': 1};
      }
      if(this.state[3] == this.state[4] && this.state[3] == this.state[5] && this.state[3]) {
        return {'winner': this.state[3], 'direction': 'H', 'row': 2};
      }
      if(this.state[6] == this.state[7] && this.state[6] == this.state[8] && this.state[6]) {
        return {'winner': this.state[6], 'direction': 'H', 'row': 3};
      }
      //Check for Vertical Wins
      if(this.state[0] == this.state[3] && this.state[0] == this.state[6] && this.state[0]) {
        return {'winner': this.state[0], 'direction': 'V', 'row': 1};
      }
      if(this.state[1] == this.state[4] && this.state[1] == this.state[7] && this.state[1]) {
        return {'winner': this.state[1], 'direction': 'V', 'row': 2};
      }
      if(this.state[2] == this.state[5] && this.state[2] == this.state[8] && this.state[2]) {
        return {'winner': this.state[2], 'direction': 'V', 'row': 3};
      }
      //Check for Diagonal Wins
      if(this.state[0] == this.state[4] && this.state[0] == this.state[8] && this.state[0]) {
        return {'winner': this.state[0], 'direction': 'D', 'row': 1};
      }
      if(this.state[2] == this.state[4] && this.state[2] == this.state[6] && this.state[2]) {
        return {'winner': this.state[2], 'direction': 'D', 'row': 2};
      }
      //If there is no winner but the board is full, then it's a draw
      if(this.isFull()) {
          return {'winner': 'draw'};
      }
      
      //return false otherwise
      return false;
  }
  insert(symbol, position) {
    if(position > 8 || this.state[position]) return false; //Cell is either occupied or does not exist
    this.state[position] = symbol;
    return true;
}
getAvailableMoves(){
  const moves = []
  this.state.forEach((cell, index)=>{
    if(!cell) moves.push(index)
  })
  return moves
}  
}

let board = new Board(['', '', '', '', '', '', '', '', ''])




class Player{
  constructor(max_depth = - 1){
    this.max_depth = max_depth
    this.nodes_map = new Map()
  }
  getBestMove(board, maximizing = false, callback = ()=>{}, depth = 0){
    //clear node_map if the function is called for a new move
    if(depth == 0) this.nodes_map.clear()

    //if board state is a terminal one return the heuristic value
    if(board.isTerminal() || depth == this.max_depth){
      if(board.isTerminal().winner == "X"){
        return 100 - depth
      }
      else if(board.isTerminal().winner == "O"){
        return -100 + depth
      }
      return 0
    }

    if(maximizing){
      // Initialize the lowest possible value
      let best = -100

      // loop through all available cells
      board.getAvailableMoves().forEach(index =>{
        // initialize a new boared with the current state (slice is used to create a new array and not modify the intial one)
        let child = new Board(board.state.slice())

        // create a child node by inserting the maximizing symbol 'x' into the current empty cell
        child.insert('X', index)

        //Recursively calling getBestMove this time with the new board and minimizing turn and incrementing the depth
        let node_value = this.getBestMove(child, false, callback, depth + 1)

        //updating best value
        best = Math.max(best, node_value)

        //If its the main function call, not a recursive one map each heuristic value with its move indecies
        if(depth == 0){
          // comma seperated indecies if multiple moves have the same heuristic value 
          var moves = this.nodes_map.has(node_value) ? `${this.nodes_map.get(node_value)}, ${index}` : index
          this.nodes_map.set(node_value, moves)
        }
      })
      // if its the main call, return index of the best move or a random index if multiple indecies have the same value
      
      if(depth == 0){
        if(typeof this.nodes_map.get(best) == 'string'){
          var arr = this.nodes_map.get(best).split(',')
          var rand = Math.floor(Math.random() * arr.length)
          var ret = parseInt(arr[rand])
        }
        else{ret = this.nodes_map.get(best)}

        // return a callback after calculation and return the index
        callback(ret)
        return ret
      }
      // if not main call return heuristic value for the next calculation
      return best
    }

    if(!maximizing) {
			//Initializ best to the highest possible value
			let best = 100;
			//Loop through all empty cells
			board.getAvailableMoves().forEach(index => {
				//Initialize a new board with the current state (slice() is used to create a new array and not modify the original)
				let child = new Board(board.state.slice());
				//Create a child node by inserting the minimizing symbol o into the current emoty cell
				child.insert('O', index);
			
				//Recursively calling getBestMove this time with the new board and maximizing turn and incrementing the depth
        let node_value = this.getBestMove(child, true, callback, depth + 1);
        
				//Updating best value
				best = Math.min(best, node_value);
				
				//If it's the main function call, not a recursive one, map each heuristic value with it's moves indicies
				if(depth == 0) {
					//Comma seperated indicies if multiple moves have the same heuristic value
					var moves = this.nodes_map.has(node_value) ? this.nodes_map.get(node_value) + ',' + index : index;
					this.nodes_map.set(node_value, moves);
				}
      });
      //If it's the main call, return the index of the best move or a random index if multiple indicies have the same value
			if(depth == 0) {
				if(typeof this.nodes_map.get(best) == 'string') {
					var arr = this.nodes_map.get(best).split(',');
					var rand = Math.floor(Math.random() * arr.length);
					var ret = parseInt(arr[rand]);
				} else {
					ret = this.nodes_map.get(best);
				}
				//run a callback after calculation and return the index
				callback(ret);
				return ret;
			}
			//If not main call (recursive) return the heuristic value for next calculation
			return best;
		}
  }
}

/*let board = new Board(['x', 'o', '', '', '', '', 'o', '', 'x'])
board.printFormattedBoard()
let p = new Player
console.log(p.getBestMove(board))
console.log(p.nodes_map) */


const container = document.getElementById("container")
const player = document.getElementById("player")
const computer = document.getElementById("computer")
const player_scoreTag = document.getElementById("player_scoreTag")
const computer_scoreTag = document.getElementById("computer_scoreTag")
const reset = document.getElementById("reset")
const humanPlayer = 'You'
const computerPlayer = 'computer'
let turnToPlay = true
const winColor = "green"
const drawColor = "yellow"
const loseColor = "red"
const player_symbol = "X"
const player_color = "red"
const computer_symbol = "O"
const computer_color = "white"
let player_score = 0
let computer_score = 0
let activePlayer = ""


let comp = new Player

container.addEventListener("click", markBox)
reset.addEventListener("click", restoreToDefault)


function markBox(e){
    
  if(turnToPlay){
    activePlayer = humanPlayer
    e.target.innerText = player_symbol
    board.insert(player_symbol, parseInt(e.target.id))
     
    e.target.style.color = player_color
    activePlayer = player_symbol
      
    if(!board.isTerminal() || !board.isFull()){
      activePlayer = computerPlayer
      let check = comp.getBestMove(board)
      board.insert(computer_symbol, check)
     
      for(let i of container.children){
        if(parseInt(i.id) === check ){
          i.innerText = computer_symbol
          i.style.color = computer_color
        }
      }
    }
          
    board.printFormattedBoard();
    console.log(board.getAvailableMoves())

  }

  identifyWinningBox()
}



function restoreToDefault(){
  turnToPlay = true
  board.state = ['','','','','','','','','']
  comp.nodes_map.clear()
  player_score = 0
  computer_score = 0
  player_scoreTag.innerText = 0
  computer_scoreTag.innerText = 0
  player.style.color = ""
  computer.style.color = ""
  for(let i of container.children){
      i.innerText = ''
      i.classList.remove(winColor)
  }
}





function identifyWinningBox(){
  const i = {zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8}
  const {zero, one, two, three, four, five, six, seven, eight} = i
  let innerTextArray = []
  for(let index of container.children){
      innerTextArray.push(index.innerText)
  }

  if(board.isTerminal()['winner'] === "draw"){

    setTimeout(()=>{
      alert(`Game Over: Draw`)
      board.state = ['','','','','','','','','']
      comp.nodes_map.clear() 
      for(let i of container.children){
          i.innerText = ''
         
      }
    })    

  }

  if(innerTextArray[zero] !== "" && innerTextArray[zero] === innerTextArray[one] && innerTextArray[zero] === innerTextArray[two]){
      highlightWinningBox(zero, one, two)
  }
  else if(innerTextArray[three] !== "" && innerTextArray[three] === innerTextArray[four] && innerTextArray[three] === innerTextArray[five]){
      highlightWinningBox(three, four, five)   
  }
  else if(innerTextArray[six] !== "" && innerTextArray[six] === innerTextArray[seven] && innerTextArray[six] === innerTextArray[eight]){
      highlightWinningBox(six, seven, eight)  
  }
  else if(innerTextArray[zero] !== "" && innerTextArray[zero] === innerTextArray[three] && innerTextArray[zero] === innerTextArray[six]){
      highlightWinningBox(zero, three, six)  
  }
  else if(innerTextArray[one] !== "" && innerTextArray[one] === innerTextArray[four] && innerTextArray[one] === innerTextArray[seven]){
      highlightWinningBox(1, four, seven)   
  }
  else if(innerTextArray[two] !== "" && innerTextArray[two] === innerTextArray[five] && innerTextArray[two] === innerTextArray[eight]){
      highlightWinningBox(two, five, eight)  
  }
  else if(innerTextArray[zero] !== "" && innerTextArray[zero] === innerTextArray[four] && innerTextArray[zero] === innerTextArray[eight]){
      highlightWinningBox(zero, four, eight) 
  }
  else if(innerTextArray[two] !== "" && innerTextArray[two] === innerTextArray[four] && innerTextArray[two] === innerTextArray[six]){
      highlightWinningBox(two, four, six)   
  }   
}

function highlightWinningBox(box1, box2, box3){
  container.children[box1].classList.add(winColor)
  container.children[box2].classList.add(winColor)
  container.children[box3].classList.add(winColor)
  alertWinner()
}

function alertWinner(){
  setTimeout(()=>{
      alert(`Game Over ${activePlayer} won`)
      board.state = ['','','','','','','','','']
      comp.nodes_map.clear() 
      declareScores()
      for(let i of container.children){
          i.innerText = ''
          i.classList.remove(winColor)
      }
  })

  function declareScores(){
      if(activePlayer === humanPlayer){
          player_score += 1
          player_scoreTag.innerText = player_score
      }
      else{
          computer_score += 1
          computer_scoreTag.innerText = computer_score
      }

      if(player_score > computer_score){
          player.style.color = winColor
          computer.style.color = loseColor
      }
      else if(computer_score > player_score){
          computer.style.color = winColor
          player.style.color = loseColor
      }
      else{
          player.style.color = ""
          computer.style.color = ""
      }
  }
      
}
