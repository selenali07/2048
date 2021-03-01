import Game from "./engine/game.js";

function init() {
    let game = new Game(4);
    game.onWin((gameState) => {
        $('#winLose').text('You win! Congrats you beat 2048');
    });

    game.onLose((gamestate) => {
        $('#winLose').text('Game over! Click new game to play again');
    })
    loadGame(game);
}
function loadGame(game) {
    let size = game.size;
    $('.score').html(`<div><h2>Score</h2><h3>${game.gameState.score}</h3></div>`);
    for (let i = 0; i < size; i++) {
        let row = '<div class="row">'
        for (let j = 0; j < size; j++) {
            let tile = (game.gameState.board[i * size + j] == 0 ? '' : game.gameState.board[i * size + j]);
            row += `<div class="tile${tile}" id="tile${i * size + j}">${tile}</div>`;
        }
        row += '</div>'
        $('#board').append(row);
    }

    document.addEventListener("keydown", function (event) {
        if (event.keyCode == 39) {
            game.move('right');
            event.preventDefault();
        }

        if (event.keyCode == 38) {
            game.move('up');
            event.preventDefault();
        }

        if (event.keyCode == 37) {
            game.move('left');
            event.preventDefault();
        }

        if (event.keyCode == 40) {
            game.move('down');
            event.preventDefault();
        }
        updateGame(game);
    });

    $(".restart").click(() => {
        game.setupNewGame();
        $('#winLose').text('');
        updateGame(game);
    })
}

function updateGame(game) {
    let size = game.size;
    $('.score').html(`<div><h2>Score</h2><h3>${game.gameState.score}</h3></div>`);

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let tile = (game.gameState.board[i * size + j] == 0 ? '' : game.gameState.board[i * size + j]);
            $(`#tile${(i * size + j)}`).replaceWith(`<div class="tile${tile}" id="tile${i * size + j}">${tile}</div>`);
        }
    }
}

$(document).ready(init());