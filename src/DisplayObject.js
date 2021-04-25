export default class DisplayObject { //everything that can be drawn without sprite 
    constructor (props = {}){
        this.visible = props.visible ?? true 
        this.debug = props.debug ?? false // need to draw the frames

        this.x = props.x ?? 0
        this.y = props.y ?? 0

        this.width = props.width ?? 0
        this.height = props.height ?? 0 
    }

    update(){}
    
    draw(context){ // its necessary to stroking elements for the debugger
        if (this.debug){
            // creates a green rectangle
            context.beginPath()
            context.rect(this.x, this.y, this.width, this.height)
            context.fillstyle = 'rgba(0, 225, 0, 0.3)'
            context.fill()
            // inputting it in the canvas
            context.beginPath()
            context.rect(this.x, this.y, this.width, this.height)
            context.lineWidth = 3
            context.strokeStyle = 'green'
            context.stroke()
            // creates a straight diagonal
            context.beginPath()
            context.moveTo(this.x, this.y)
            context.lineTo(this.x + this.width,this.y + this.height)

        } 
    }
}