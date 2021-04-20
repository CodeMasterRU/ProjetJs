import Cinematic from './Cinematic.js'
import Game from './Game.js' 
import { loadImage, loadJSON } from './Loader.js'
import Sprite from './Sprite.js'
import { getRandom, haveCollision } from './Additional.js'
import DisplayObject from './DisplayObject.js'

const scale = 4 // позволяет менять масштаб

export default async function main () {
    const game = new Game({
       // width: 672,
        //height: 744,
        background: 'black'
    })
    document.body.append(game.canvas)

    const image = await loadImage('/sets/spritesheet.png') 
    const atlas = await loadJSON('/sets/atlas.json')
    
    const pacman = new Cinematic({
        image,
        x: atlas.position.pacman.x * scale,
        y: atlas.position.pacman.y * scale,
        width: 15 * scale,
        height: 15 * scale,
        animations: atlas.pacman,
       // debug: true,
        speedX: 1
    })
    pacman.start('right') 

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

    // отрисовка еды
    let foods = atlas.maze.foods
    // возращает отмаштабируемые размеры еды
        .map(food =>({
            ...food,
            x: food.x * scale,
            y: food.y * scale,
            width: food.width * scale,
            height: food.height * scale,
        }))
    // передает изображение еды
        .map(food => new Sprite({
            image,
            frame: atlas.food,
            ...food, // передает координаты food из json
        }))
    // приведения
    const ghosts = ['red','pink','turquoise','banana']
        .map(color => {
            const ghost = new Cinematic({
                image,
                x: atlas.position[color].x * scale,
                y: atlas.position[color].y * scale,
                width: 13 * scale,
                height: 13 * scale,
                animations: atlas[`${color}Ghost`]
            })
            ghost.start(atlas.position[color].direction) // задает анимацию приведениям
            ghost.nextDirection = atlas.position[color].direction
            ghost.isBlue = false
            return ghost
        })

    
    
    // создание стен
    const walls = atlas.maze.walls.map(wall => new DisplayObject({
        x : wall.x * scale,
        y : wall.y * scale,
        width : wall.width * scale,
        height : wall.height * scale,
        //debug : true
    }))

    // обьявление телепортов 
    const leftPortal = new DisplayObject({
        x : atlas.leftPortal.x * scale,
        y : atlas.leftPortal.y * scale,
        width : atlas.leftPortal.width * scale,
        height : atlas.leftPortal.height * scale,
    })
    const rightPortal = new DisplayObject({
        x : atlas.rightPortal.x * scale,
        y : atlas.rightPortal.y * scale,
        width : atlas.rightPortal.width * scale,
        height : atlas.rightPortal.height * scale,
    })

    const tablets = atlas.position.tablets
        .map(tablet => new Sprite({
            image,
            frame: atlas.tablet,
            x: tablet.x * scale,
            y: tablet.y * scale,
            width: tablet.width * scale,
            height: tablet.height * scale,
        }))

    // добавление элементов, которые нужно отрисовать
    game.stage.add(maze)
    foods.forEach(food => game.stage.add(food))
    game.stage.add(pacman)
    ghosts.forEach(ghost => game.stage.add(ghost))
    walls.forEach(wall => game.stage.add(wall))
    game.stage.add(leftPortal)
    game.stage.add(rightPortal)
    tablets.forEach(tablet => game.stage.add(tablet))

    
    game.update = () => {
        const eated = []
        for ( const food of foods ){// проверка сьели ли мы еду
            if (haveCollision(pacman, food)){
                eated.push(food)  
                game.stage.remove(food) // удаление еды графически
            }
        }
        foods = foods.filter(food => !eated.includes(food)) // оставляет несьеденную еду
        // смена направления движения
        changeDirection(pacman)
        ghosts.forEach(changeDirection)
          // обнаружение столкновений приведений со стенками
        for(const ghost of ghosts){
            if(!ghost.play){
                return  
            }
            if (getWallCollision(ghost.getNextPosition())){
                ghost.speedX = 0
                ghost.speedY = 0
            }
            if (ghost.speedX === 0 && ghost.speedY === 0){
                if (ghost.animation.name === 'up'){
                    ghost.nextDirection = getRandom('left', 'right', 'down')
                }
                else if (ghost.animation.name === 'down'){
                    ghost.nextDirection = getRandom('left', 'right', 'up')
                }
                else if (ghost.animation.name === 'left'){
                    ghost.nextDirection = getRandom('right', 'up', 'down')
                }
                else if (ghost.animation.name === 'right'){
                    ghost.nextDirection = getRandom('up', 'down', 'left')
                }
            }
        // обнаружение столконовений пакмана и привидения
            if (pacman.play && ghost.play && haveCollision(pacman, ghost)){
                if (ghost.isBlue) { // если голубое приведение
                    ghost.speedX = 0,
                    ghost.speedY = 0,
                    game.stage.remove(ghost)

                }
                else{ // если нет
                    pacman.speedX = 0
                    pacman.speedY = 0
                    pacman.start('die', {// вызов метода конца игры
                        onEnd () {
                        pacman.play = false
                        pacman.stop()
                        game.stage.remove(pacman)
                        }
                    })
                }    
            }
            // обнаружение столконовений пакмана со стеной
            if (getWallCollision(pacman.getNextPosition())){
                pacman.start(`wait${pacman.animation.name}`) // для остановки когда ударяется о стенку
                pacman.speedX = 0
                pacman.speedY = 0
            }
        }
        // обьявление телепортов
        if (haveCollision(pacman, leftPortal)){
            pacman.x = atlas.rightPortal.x * scale - 10 - pacman.width
        }
        if (haveCollision(pacman, rightPortal)){
            pacman.x = atlas.leftPortal.x * scale + 10 + pacman.width
        }
        // обнаружение столкновения пакмана с таблеткой
        for (let i = 0; i < tablets.length; i++){
            const tablet = tablets[i]
            if (haveCollision(pacman, tablet)){
                tablets.splice(i, 1)
                game.stage.remove(tablet)
                
                ghosts.forEach(ghost => {
                    ghost.originalAnimations = ghost.animations
                    ghost.animations = atlas.blueGhost
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
        

    // движения pacman
    document.addEventListener('keydown', event =>{
        if (!pacman.play){
            return
        }
        if (event.key === "ArrowLeft"){
            pacman.nextDirection = 'left'

        }
        else if (event.key === "ArrowRight"){
            pacman.nextDirection = 'right'

        }
        else if (event.key === "ArrowUp"){
            pacman.nextDirection = 'up'
        }
        else if (event.key === "ArrowDown"){
            pacman.nextDirection = 'down'

        }
    })

    // обнаружение прикосновений обьекта со стеной
    function getWallCollision(obj){
        for (const wall of walls){
            if (haveCollision(wall,obj)){
                return wall
            }
        }
        return null
    }
    // улучшенная версия движения пакмана
    function changeDirection(sprite){
        if (!sprite.nextDirection){
            return 
        }
        if (sprite.nextDirection === 'up'){
            sprite.y -= 10
            if (!getWallCollision (sprite)){
                sprite.nextDirection = null
                sprite.speedX = 0
                sprite.speedY = -1
                sprite.start('up')
            }
            sprite.y += 10
        }
        else if (sprite.nextDirection === 'down'){
            sprite.y += 10
            if (!getWallCollision (sprite)){
                sprite.nextDirection = null
                sprite.speedX = 0
                sprite.speedY = 1
                sprite.start('down')
            }
            sprite.y -= 10
        }
        else if (sprite.nextDirection === 'left'){
            sprite.x -= 10
            if (!getWallCollision (sprite)){
                sprite.nextDirection = null
                sprite.speedX = -1
                sprite.speedY = 0
                sprite.start('left')
            }
            sprite.x += 10
        }
        else if (sprite.nextDirection === 'right'){
            sprite.x += 10
            if (!getWallCollision (sprite)){
                sprite.nextDirection = null
                sprite.speedX = 1
                sprite.speedY = 0
                sprite.start('right')
            }
            sprite.x -= 10
        }
        
    }
}