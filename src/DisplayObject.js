export default class DisplayObject {
    constructor (props = {}){
        this.visible = props.visible ?? true 
        this.debug = props.debug ?? false // нужен для отрисовки фрейма

        this.x = props.x ?? 0
        this.y = props.y ?? 0

        this.width = props.width ?? 0
        this.height = props.height ?? 0 
    }

    update(){}
    
    draw(context){
        if (this.debug){
            // создает зеленый прямоугольник
            context.beginPath()
            context.rect(this.x, this.y, this.width, this.height)
            context.fillstyle = 'rgba(0, 225, 0, 0.3)'
            context.fill()
            // ввод его в код
            context.beginPath()
            context.rect(this.x, this.y, this.width, this.height)
            context.lineWidth = 3
            context.strokeStyle = 'green'
            context.stroke()
            // создаем прямую линию
            context.beginPath()
            context.moveTo(this.x, this.y)
            context.lineTo(this.x + this.width,this.y + this.height)

        } 
    }
}