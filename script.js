var NUM_MINES = 10;
var MINE = 'M';
var EMPTY = 0;
var MINEFIELD_WIDTH = 10;
var MINEFIELD_HEIGHT = 10;
var MINE_WIDTH = 20;
var MINE_HEIGHT = 20;
var MINE_BORDER = 2;
var minefield = [];
var uncoveredMines = 0;
var timers = [];

$(document).ready(setup);

function setup() {
    $('.build').mousedown(gatherInput);
	gatherInput();
}

function gatherInput() {
    MINEFIELD_WIDTH = parseInt($('input[name=width]').val(), 10);
    MINEFIELD_HEIGHT = parseInt($('input[name=height]').val(), 10);
	if (MINEFIELD_WIDTH > 99) {
		alert("ERROR: Maximum width is 99");
		MINEFIELD_WIDTH = 99;
	}
	if (MINEFIELD_HEIGHT > 99) {
		alert("ERROR: Maximum height is 99");
		MINEFIELD_HEIGHT = 99;
	}
	NUM_MINES = Math.min(parseInt($('input[name=mines]').val(), 10), MINEFIELD_WIDTH * MINEFIELD_HEIGHT);
	generateGame();
}

function resetGame() {
	timers = [];
	minefield = [];
	uncoveredMines = 0;
	for (var i=0; i < timers.length; ++i) {
		clearTimeout(timers[i]);
	}
}

function generateGame() {
	resetGame();
	$('.container').empty();
	$('.container').width(MINEFIELD_WIDTH*(MINE_WIDTH + MINE_BORDER*2));
	$('.container').height(MINEFIELD_HEIGHT*(MINE_WIDTH + MINE_BORDER*2));

    generateMinefield();
    setupMinefield();
    setupButtons();
}

function generateMinefield() {
    for (var x=0; x < MINEFIELD_WIDTH; ++x) {
        minefield.push([]);
        for (var y=0; y < MINEFIELD_HEIGHT; ++y) {
            minefield[x].push(EMPTY);
        }
    }
    
    for (var i=0; i < NUM_MINES; ++i) {
        var placedMine = false;
    	while (!placedMine) {
            var newX = Math.floor(Math.random() * MINEFIELD_WIDTH);
            var newY = Math.floor(Math.random() * MINEFIELD_HEIGHT);
			
			if (minefield[newX][newY] != MINE) {
				minefield[newX][newY] = MINE;
				placedMine = true;
			}
		}
   }
    
	processOnMinefield(function (x, y) {
		if (!isMine(x, y)) {
			processOnNearbyMines(x, y, function(innerX, innerY) {
				minefield[x][y] += (isMine(innerX, innerY) ? 1 : 0);
			});
		}
	});
	
	for (x=0; x < MINEFIELD_WIDTH; ++x) {
		console.log(minefield[x]);
	}
}

function isMine(x, y) { return minefield[x][y] == MINE; }

function setupMinefield() {
    var container = $('.container');
    var all_mines = '';
    var MINE_OUTER_WIDTH = (MINE_WIDTH + MINE_BORDER*2);
    processOnMinefield(function (x, y) {
        var mine = '<div id="mine-' + x + '-' + y + '" class="mine label_color_' + minefield[x][y] + '"';
        mine += ' style="left: ' + (x*MINE_OUTER_WIDTH) + 'px; top: ' + (y*MINE_OUTER_WIDTH) + 'px;">';
        if (minefield[x][y] != EMPTY) {
                mine += ''+ minefield[x][y];
        }
        mine += '</div>';
        all_mines += mine;
    });
    container.append(all_mines);
}

function setupButtons() {
    var container = $('.container');
    var all_buttons = '';
    var MINE_OUTER_WIDTH = (MINE_WIDTH + MINE_BORDER*2);
        processOnMinefield(function (x, y) {
                var button = '<div id="button-' + x + '-' + y + '" class="button"';
                button += ' style="left: ' + (x*MINE_OUTER_WIDTH) + 'px; top: ' + (y*MINE_OUTER_WIDTH) + 'px;"></div>';
                all_buttons += button;
        });
        container.append(all_buttons)
        var buttons = $('[id*=button-]');
        buttons.mousedown(handleMouse);
}

function getXPos(id) {
	return parseInt(id.split('-')[1]);
}

function getYPos(id) {
	return parseInt(id.split('-')[2]);
}

function uncoverMine(btn) {
    var x, y;
    var target_button;

    var btnID = btn.attr('id');
    var btnX = getXPos(btnID);
    var btnY = getYPos(btnID);
	target_button = $('#button-' + btnX + '-' + btnY);
	
	if (isMine(btnX, btnY)) {
		loseGame();
		return;
	}

    if (!btn.hasClass('uncovered')) {
        btn.fadeOut('slow');
        btn.addClass('uncovered');
			
		if (target_button.length) {
			uncoveredMines++;
			if (uncoveredMines + NUM_MINES == MINEFIELD_WIDTH * MINEFIELD_HEIGHT) {
				winGame();
				return;
			}
		}
		if (minefield[btnX][btnY] == EMPTY) {
			processOnNearbyMines(btnX, btnY, function(x, y) {
				target_button = $('#button-' + x + '-' + y);
				if (target_button.length) {
					uncoverMineHelper(target_button);
				}
			});
		}
    }
}

function uncoverMineHelper(btn) {
    timers.push(setTimeout(function() {
        uncoverMine(btn);
    }, 100));
}

function toggleFlag(btn) {
	if (btn.hasClass('flag')) { btn.removeClass('flag'); }
	else { btn.addClass('flag'); }
	//btn.toggleClass('flag');
}

function handleMouse(event) {
    switch (event.which) {
        case 1: //Left mouse
			uncoverMine($(this));
			break;
        case 3:
			toggleFlag($(this));
            break;
        case 2: //Middle mouse
        default: //Other?
    }
}

function loseGame() {
	resetGame();
	alert ('YOU LOSE!');
	generateGame();
}

function winGame() {
	resetGame();
	alert("YOU WIN!");
	generateGame();
}

function processOnMinefield(someFunc) {
	for (var x=0; x < MINEFIELD_WIDTH; ++x) {
        for (var y=0; y < MINEFIELD_HEIGHT; ++y) {
			someFunc(x, y);
		}
	}
}

function processOnNearbyMines(centerX, centerY, someFunc) {
	for (x=centerX-1; x <= centerX+1; ++x) {
		for (y=centerY-1; y <= centerY+1; ++y) {
			if (x >= 0 && x < MINEFIELD_WIDTH && y >= 0 && y < MINEFIELD_HEIGHT) {
				someFunc(x, y);
			}
		}
	}
}