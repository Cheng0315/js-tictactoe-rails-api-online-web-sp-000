// Code your JavaScript / jQuery solution here
var turn = 0;
var currentGame = 0;

function player() {
  return turn % 2 === 0 ? "X" : 'O'
}

function updateState(sqr) {
  $(sqr).append(player())
}

function setMessage(msg) {
  document.getElementById('message').innerHTML = msg
}

function checkWinner() {
  const cells = $('td')
  let won = false

  const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]

  for (const ele of winningCombos) {
    if (cells[ele[0]].innerHTML !== '' && cells[ele[0]].innerHTML === cells[ele[1]].innerHTML && cells[ele[1]].innerHTML === cells[ele[2]].innerHTML) {
      setMessage(`Player ${cells[ele[0]].innerHTML} Won!`)
      won = true
    }
  }

  return won
}

function doTurn(cell) {
  updateState(cell)
  turn += 1
  if (turn === 9 && !checkWinner()) {
    saveGame()
    setMessage('Tie game.')
    clearGame()
  } else if (checkWinner()) {
    turn = 0
    saveGame()
    clearGame()
  }
}

$(function() {
  attachListeners()
})

function attachListeners() {
  $('td').on('click', function() {
    if (this.innerHTML === '' && !checkWinner()) {
      doTurn(this)
    }
  })

  $('#previous').on('click', function() {
    previousGame()
  })

  $('#clear').on('click', function() {
    clearGame()
  })

  $('#save').on('click', function() {
    saveGame()
  })
}

function saveGame() {
  let gameData = {state: []}
  var cells = $('td')

  for (const ele of cells) {
    gameData.state.push(ele.innerHTML)
  }

  if (currentGame) {
    $.ajax({
      url: `/games/${currentGame}`,
      type: 'PATCH',
      data: gameData
    })
  } else {
    $.post('/games', gameData, function(game) {
      currentGame = game.data.id
      addGameBtn(currentGame)
    })
  }
}

function addGameBtn(currentGame) {
  $('#games').append(`<button id='game-${currentGame}' onClick='loadGame(${currentGame})'> ${currentGame}</button><br>`)
}

function clearGame() {
  currentGame = 0
  turn = 0
  $('td').empty()
}

function previousGame() {
  $.get('/games', function(response) {
    if (response.data) {
      $('#games').empty()
      for (const game of response.data) {
        addGameBtn(game.id)
      }
    }
  })
}

function loadGame(id) {
  $.get('/games/' + id, function(game) {
    let state = game.data.attributes.state
    var cells = $('td')
    currentGame = game.data.id
    turn = state.filter(Boolean).length
    for (i=0; i<9; i++) {
      cells[i].innerHTML = state[i]
    }
  })
}
