/* ============================================================
   Connect Four Arena — script.js
   ============================================================ */

const ROWS = 6;
const COLS = 7;

const RED = "red";
const YELLOW = "yellow";
const EMPTY = null;

const SCORE_KEY = "connect_four_scores";
const HISTORY_KEY = "connect_four_history";


let board = [];
let currentPlayer = RED;
let gameOver = false;

let players = {
    red: "Player 1",
    yellow: "Player 2"
};

let scores = {
    red: 0,
    yellow: 0
};

let history = [];


// DOM
const setupScreen = document.getElementById("setup-screen");
const gameScreen = document.getElementById("game-screen");

const boardEl = document.getElementById("board");
const colTargetsEl = document.getElementById("col-targets");

const turnDisc = document.getElementById("turn-disc");
const turnLabel = document.getElementById("turn-label");

const scoreNameP1 = document.getElementById("score-name-p1");
const scoreNameP2 = document.getElementById("score-name-p2");

const scoreP1 = document.getElementById("score-val-p1");
const scoreP2 = document.getElementById("score-val-p2");

const historyList = document.getElementById("history-list");

const resultOverlay = document.getElementById("result-overlay");
const resultTitle = document.getElementById("result-title");
const resultBody = document.getElementById("result-body");
const resultIcon = document.getElementById("result-icon");



// START GAME
document.getElementById("start-btn").onclick = () => {

    players.red =
        document.getElementById("p1-name").value.trim()
        || "Player 1";


    players.yellow =
        document.getElementById("p2-name").value.trim()
        || "Player 2";


    loadScores();
    loadHistory();

    setupScreen.classList.remove("active");
    gameScreen.classList.add("active");

    updateScore();

    newGame();
};



// NEW GAME BUTTON
document.getElementById("new-game-btn").onclick = () => {

    closePopup();

    newGame();

};



// RESET SCORE BUTTON
document.getElementById("reset-scores-btn").onclick = () => {


    scores = {
        red:0,
        yellow:0
    };


    localStorage.removeItem(SCORE_KEY);

    updateScore();

};



// PLAY AGAIN
document.getElementById("play-again-btn").onclick = () => {

    closePopup();

    newGame();

};



// CHANGE PLAYERS
document.getElementById("change-players-btn").onclick = () => {

    closePopup();

    gameScreen.classList.remove("active");
    setupScreen.classList.add("active");

};




// CREATE BOARD
function newGame(){

    board = [];

    for(let r=0;r<ROWS;r++){

        board.push(
            Array(COLS).fill(EMPTY)
        );

    }


    currentPlayer = RED;
    gameOver=false;


    createBoard();
    createColumns();

    updateTurn();

}





// DRAW BOARD
function createBoard(){

    boardEl.innerHTML="";


    for(let r=ROWS-1;r>=0;r--){

        for(let c=0;c<COLS;c++){


            let cell=document.createElement("div");

            cell.className="cell";

            cell.dataset.row=r;
            cell.dataset.col=c;


            boardEl.appendChild(cell);

        }

    }

}




// CLICK COLUMNS
function createColumns(){

    colTargetsEl.innerHTML="";


    for(let c=0;c<COLS;c++){


        let col=document.createElement("div");

        col.className="col-target";


        col.onclick=()=>{

            dropDisc(c);

        };


        colTargetsEl.appendChild(col);

    }

}




// DROP DISC
function dropDisc(col){


    if(gameOver)
        return;



    let row=-1;


    for(let r=0;r<ROWS;r++){


        if(board[r][col]===EMPTY){

            row=r;
            break;

        }

    }


    if(row===-1)
        return;



    board[row][col]=currentPlayer;



    render();



    if(checkWinner(row,col,currentPlayer)){


        scores[currentPlayer]++;

        saveScores();

        updateScore();


        addHistory(currentPlayer);


        showResult(
            "🏆",
            players[currentPlayer]+" wins!",
            "Congratulations!"
        );


        gameOver=true;

        return;

    }



    if(isDraw()){


        showResult(
            "🤝",
            "Draw Game",
            "No more moves available"
        );


        gameOver=true;

        return;

    }



    currentPlayer =
        currentPlayer===RED
        ? YELLOW
        : RED;



    updateTurn();


}




// DISPLAY BOARD
function render(){


    document.querySelectorAll(".cell")
    .forEach(cell=>{


        cell.className="cell";


        let r=cell.dataset.row;
        let c=cell.dataset.col;


        if(board[r][c]){

            cell.classList.add(board[r][c]);

        }


    });


}





// WIN CHECK
function checkWinner(r,c,color){


    const directions=[

        [1,0],
        [0,1],
        [1,1],
        [1,-1]

    ];


    for(let d of directions){


        let count=1;


        count += countDirection(r,c,d[0],d[1],color);

        count += countDirection(r,c,-d[0],-d[1],color);



        if(count>=4)
            return true;


    }


    return false;

}




function countDirection(r,c,dr,dc,color){


    let count=0;


    r+=dr;
    c+=dc;



    while(

        r>=0 &&
        r<ROWS &&
        c>=0 &&
        c<COLS &&
        board[r][c]===color

    ){

        count++;

        r+=dr;
        c+=dc;

    }


    return count;

}




function isDraw(){


    return board[ROWS-1]
    .every(cell=>cell!==EMPTY);


}




// TURN
function updateTurn(){


    turnDisc.className =
    "turn-disc "+currentPlayer;


    turnLabel.innerText =
    players[currentPlayer]+" 's turn";


}




// SCORE
function updateScore(){


    scoreNameP1.innerText=players.red;
    scoreNameP2.innerText=players.yellow;


    scoreP1.innerText=scores.red;
    scoreP2.innerText=scores.yellow;


}





// POPUP
function showResult(icon,title,body){


    resultIcon.innerText=icon;

    resultTitle.innerText=title;

    resultBody.innerText=body;


    resultOverlay.classList.remove("hidden");


}



function closePopup(){

    resultOverlay.classList.add("hidden");

}





// STORAGE

function saveScores(){

    localStorage.setItem(
        SCORE_KEY,
        JSON.stringify(scores)
    );

}



function loadScores(){


    let data=
    localStorage.getItem(SCORE_KEY);


    if(data){

        scores=JSON.parse(data);

    }

}




// HISTORY

function addHistory(winner){


    history.unshift({

        name:players[winner],

        time:new Date()
        .toLocaleTimeString()

    });



    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );


    showHistory();

}



function loadHistory(){

    let data =
    localStorage.getItem(HISTORY_KEY);


    if(data){

        history=JSON.parse(data);

    }


    showHistory();

}




function showHistory(){


    historyList.innerHTML="";


    history.forEach((item,index)=>{


        let li=document.createElement("li");


        li.className="history-item";


        li.innerHTML=

        `
        #${index+1}
        🏆 ${item.name}
        <span>${item.time}</span>
        `;


        historyList.appendChild(li);


    });


}