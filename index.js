import { LEVEL, OBJECT_TYPE } from './setup';
// classes
import GameBoard from './GameBoard';

// Dom elements 
const gameGrid = document.querySelector('#game')//посмотреть селектор
const scoreTabl = document.querySelector('#score')
const startButton = document.querySelector('#start-button')

// game constants 
const POWER_PILL_TIME = 10000; // ms
const GLOBAL_SPEED = 80; // ms
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);

//initial setup
let score = 0;
let timer = 0;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null

function startGame() {
    /*New variable */

    var playing = false; // Check if the game is currently being played
    var startButton; // Representing the button

    /*Initialiser les classes du jeu*/
}

function gameOver (pacman, grid){

}

function checkCollision (pacman, ghosts) {

}

function gameLoop (pacman, ghosts){
    
}