import Cinematic from './Cinematic.js'
import Game from './Game.js'
import { loadImage, loadJSON } from './Loader.js'
import Sprite from './Sprite.js'
import { getRandom, haveCollision } from './Additional.js'
import DisplayObject from './DisplayObject.js'

const scale = 2.5 // allons to change the scale

export default async function main() {
    const game = new Game({ // creation the field of play
        background: 'black'
    })

    document.body.append(game.canvas)

    const image = await loadImage('/sets/spritesheet.png') // read the contents of image file
    const atlas = await loadJSON('/sets/atlas.json') // read the contents of JSON file
    const sprite = await loadJSON('/sets/sprites.json')
    // creation the audio
    const introAudio = new Audio('/sets/intro.ogg')
    introAudio.play()
    // declaration the pacman as a cinematic
    const pacman = new Cinematic({
        image,
        x: atlas.position.pacman.x * scale,
        y: atlas.position.pacman.y * scale,
        width: 15 * scale,
        height: 15 * scale,
        animations: sprite.pacman,
        speedX: 1.5,
        // debug: true
    })
    pacman.start('right')
    // declaration the maze
    const maze = new Sprite({
        image,
        x: 0,
        y: 0,
        width: atlas.maze.width * scale,
        height: atlas.maze.height * scale,
        frame: atlas.maze
    })
    game.canvas.width = maze.width
    game.canvas.height = maze.height

    // drawing food
    let foods = atlas.maze.foods
        //returns scalable food sizes
        .map(food => ({
            ...food,
            x: food.x * scale,
            y: food.y * scale,
            width: food.width * scale,
            height: food.height * scale,
        }))
        // conveys an image and frames the food 
        .map(food => new Sprite({
            image,
            frame: sprite.food,
            ...food, // passes coordinates of food items from json
        }))

    // ghosts
    const ghosts = ['red', 'pink', 'turquoise', 'banana']
        .map(color => {
            const ghost = new Cinematic({
                image,
                x: atlas.position[color].x * scale,
                y: atlas.position[color].y * scale,
                width: 15 * scale,
                height: 15 * scale,
                animations: sprite[`${color}Ghost`],
                // debug: true
            })
            ghost.start(atlas.position[color].direction) // sets the animation of ghosts
            ghost.nextDirection = atlas.position[color].direction
            ghost.isBlue = false
            return ghost
        })

    // creation the walls
    const walls = atlas.maze.walls.map(wall => new DisplayObject({
        x: wall.x * scale,
        y: wall.y * scale,
        width: wall.width * scale,
        height: wall.height * scale,
        // debug : true
    }))

    // creation the portals 
    const leftPortal = new DisplayObject({
        x: atlas.leftPortal.x * scale,
        y: atlas.leftPortal.y * scale,
        width: atlas.leftPortal.width * scale,
        height: atlas.leftPortal.height * scale,
    })
    const rightPortal = new DisplayObject({
        x: atlas.rightPortal.x * scale,
        y: atlas.rightPortal.y * scale,
        width: atlas.rightPortal.width * scale,
        height: atlas.rightPortal.height * scale,
    })
    // creation the tablets
    const tablets = atlas.position.tablets
        .map(tablet => new Sprite({
            image,
            x: tablet.x * scale,
            y: tablet.y * scale,
            width: tablet.width * scale,
            height: tablet.height * scale,
            frame: sprite.tablet,
        }))

    // adding the elements to draw
    foods.forEach(food => game.stage.add(food))
    tablets.forEach(tablet => game.stage.add(tablet))
    walls.forEach(wall => game.stage.add(wall))
    game.stage.add(pacman)
    ghosts.forEach(ghost => game.stage.add(ghost))
    game.stage.add(maze)
    game.stage.add(leftPortal)
    game.stage.add(rightPortal)


    const eated_food = []
    const eated_ghost = []

    game.update = () => {
        foods = foods.filter(food => !eated_food.includes(food)) // leaves uneaten food
        for (const food of foods) {// checking if we have eaten food
            if (haveCollision(pacman, food)) {
                var eat_food = new Audio('/sets/eat-food.ogg')
                eat_food.play()
                eated_food.push(food)
                game.stage.remove(food) // removing food graphically
            }
        }

        //change of direction of movement
        changeDirection(pacman)
        ghosts.forEach(changeDirection)

        // collision detection of ghosts with walls
        for (const ghost of ghosts) {
            if (ghost.play === true) {
                if (getWallCollision(ghost.getNextPosition())) {
                    ghost.speedX = 0
                    ghost.speedY = 0
                }
                if (ghost.speedX === 0 && ghost.speedY === 0) {
                    if (ghost.animation.name === 'up') {
                        ghost.nextDirection = getRandom('left', 'right', 'down')
                    }
                    else if (ghost.animation.name === 'down') {
                        ghost.nextDirection = getRandom('left', 'right', 'up')
                    }
                    else if (ghost.animation.name === 'left') {
                        ghost.nextDirection = getRandom('right', 'up', 'down')
                    }
                    else if (ghost.animation.name === 'right') {
                        ghost.nextDirection = getRandom('up', 'down', 'left')
                    }
                }
            }

            // pacman and ghost collision detection
            if (pacman.play && ghost.play && haveCollision(pacman, ghost)) {
                if (ghost.isBlue) { //if blue ghost
                    new Audio('/sets/eat-ghost.ogg').play()
                    ghost.play = false
                    ghost.speedX = 0
                    ghost.speedY = 0
                    eated_ghost.push(ghost)
                    game.stage.remove(ghost)
                } else { // if no
                    new Audio('/sets/death.ogg').play()
                    introAudio.pause()
                    pacman.play = false
                    pacman.speedX = 0
                    pacman.speedY = 0
                    pacman.start('die', { // call the end game method
                        onEnd() {
                            game.stage.remove(pacman)
                        }
                    })
                }
            }

            // pacman wall collision detection
            if (getWallCollision(pacman.getNextPosition())) {
                pacman.start(`wait${pacman.animation.name}`) //to stop when hitting a wall
                pacman.speedX = 0
                pacman.speedY = 0
            }
        }
        // the score
        document.getElementById("score").textContent = eated_food.length + (eated_ghost.length * 1000)


        // announcement of teleports
        if (haveCollision(pacman, leftPortal)) {
            pacman.x = atlas.rightPortal.x * scale - 10 - pacman.width
        }
        if (haveCollision(pacman, rightPortal)) {
            pacman.x = atlas.leftPortal.x * scale + 10 + pacman.width
        }
        // pacman pill collision detection
        for (let i = 0; i < tablets.length; i++) {
            const tablet = tablets[i]
            if (haveCollision(pacman, tablet)) {
                new Audio('/sets/ghost-noises.ogg').play()
                tablets.splice(i, 1)
                game.stage.remove(tablet)

                ghosts.forEach(ghost => {
                    ghost.originalAnimations = ghost.animations
                    ghost.animations = sprite.blueGhost
                    ghost.isBlue = true
                    ghost.start(ghost.animation.name)
                })

                setTimeout(() => {
                    ghosts.forEach(ghost => {
                        ghost.animations = ghost.originalAnimations
                        ghost.isBlue = false
                        ghost.start(ghost.animation.name)
                    })
                }, 5000)
                break
            }
        }
    }


    // pacman control
    document.addEventListener('keydown', event => {
        if (pacman.play === true) {
            if (event.key === "ArrowLeft") {
                pacman.nextDirection = 'left'
            }
            else if (event.key === "ArrowRight") {
                pacman.nextDirection = 'right'
            }
            else if (event.key === "ArrowUp") {
                pacman.nextDirection = 'up'
            }
            else if (event.key === "ArrowDown") {
                pacman.nextDirection = 'down'
            }

        } else if (pacman.play === false) {
            pacman.nextDirection = null
        }
    })

    //detection of touches of an object with a wall
    function getWallCollision(obj) {
        for (const wall of walls) {
            if (haveCollision(wall, obj)) {
                return wall
            }
        }
        return null
    }
    // pacman movement
    function changeDirection(sprite) {
        if (!sprite.nextDirection) {
            return
        }
        if (sprite.nextDirection === 'up') {
            sprite.y -= 10
            if (!getWallCollision(sprite)) {
                sprite.nextDirection = null
                sprite.speedX = 0
                sprite.speedY = -1.5
                sprite.start('up')
            }
            sprite.y += 10
        }
        else if (sprite.nextDirection === 'down') {
            sprite.y += 10
            if (!getWallCollision(sprite)) {
                sprite.nextDirection = null
                sprite.speedX = 0
                sprite.speedY = 1.5
                sprite.start('down')
            }
            sprite.y -= 10
        }
        else if (sprite.nextDirection === 'left') {
            sprite.x -= 10
            if (!getWallCollision(sprite)) {
                sprite.nextDirection = null
                sprite.speedX = -1.5
                sprite.speedY = 0
                sprite.start('left')
            }
            sprite.x += 10
        }
        else if (sprite.nextDirection === 'right') {
            sprite.x += 10
            if (!getWallCollision(sprite)) {
                sprite.nextDirection = null
                sprite.speedX = 1.5
                sprite.speedY = 0
                sprite.start('right')
            }
            sprite.x -= 10
        }
    }
}