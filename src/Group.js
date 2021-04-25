import DisplayObject from './DisplayObject.js'
export default class Group extends DisplayObject{ // stores all the elements that we need to draw on the canvas
    constructor (props = {}){
        super(props) // passes the initialization argument an instance of the class to the parent constructor
        
        this.container = new Set 
    }
    // returns the container as an array
    get items (){
        return Array.from(this.container)
    }
    // methods for working with the Set container
    add (...dos){
        for (const displayObject of dos){
            this.container.add(displayObject)
        }
    }
    remove (...dos){
        for (const displayObject of dos){
            this.container.delete(displayObject)
        }
    }
    update (delta){
        this.items.forEach(x => x.update(delta))
    }
    
    draw (context){
        this.items.forEach(x => x.draw(context))
    }
}