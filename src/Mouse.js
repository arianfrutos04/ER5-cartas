import { CardId, SlotsState } from "./constants.js";
import { BorderId } from "./constants.js";

// El cursor del juego se pinta en el lienzo en vez de ser un cursor de imagen del navegador: Chrome cambia los cursores de
// imagen por el suyo cuando se salen por el borde derecho o el de abajo de la ventana, en cuanto la escala de la
// pantalla o el zoom los hacen mas grandes de 32 px. Asi se ve igual en toda la pantalla
const CURSOR_FILES = ["../media/images/others/cursor_normal.png", "../media/images/others/cursor_click.png"];

export default class Mouse {

    constructor(canvas){
        this.x              = 0;
        this.y              = 0;
        this.rightClick     = false;
        this.leftClick      = false;
        this.canvas         = canvas;
        this.previousStateLeft  = false;
        this.previousStateRight = false;
        this.isInside       = false;                        // Si el raton esta encima del lienzo
        this.cursorImages   = CURSOR_FILES.map((file) => {

            const image = new Image();
            image.src = file;
            return image;
        });
    }
    update(){
        this.previousStateLeft  = this.leftClick;
        this.previousStateRight = this.rightClick;

        // El del navegador no se ve encima del juego: el del juego lo pinta render
        this.canvas.style.cursor = "none";
    }

    // El cursor del juego, normal o pulsado, encima de todo y del mismo tamano en la pantalla aunque el lienzo este
    // escalado a la ventana
    render(ctx){

        const image = this.cursorImages[this.leftClick || this.rightClick ? 1 : 0];

        if (!this.isInside || !image.complete || image.naturalWidth === 0){

            return;
        }

        const scale = this.canvas.width / this.canvas.clientWidth;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.filter = "none";
        ctx.shadowColor = "transparent";
        ctx.drawImage(image, this.x, this.y, image.naturalWidth * scale, image.naturalHeight * scale);
        ctx.restore();
    }
    isCollidingWithCard(card){
        const cardLength =  card.size === BorderId.NORMAL_SIZE  ? 197.6    : 
                            card.size === BorderId.SMALL_SIZE   ? 133      : 90
                            
        const cardHeight =  card.size === BorderId.NORMAL_SIZE  ? 303.2    : 
                            card.size === BorderId.SMALL_SIZE   ? 155      : 94

        let result
        if (this.x >= card.xPos && this.x <=card.xPos + cardLength) {
            if (this.y >= card.yPos && this.y <=card.yPos + cardHeight) {
                result = true
            } else{
                result = false
            }
        }else{
            result = false
        }
        return result
    }

    static create(canvas){
        
        const mouse = new Mouse(canvas);

        return mouse;
    }

    isCollidingWithButton(button){
        const buttonWidth   = button.width;
        const buttonHeight  = button.height;
  
        let colision;

        if(this.x >= button.x && this.x <= button.x + buttonWidth){

            if(this.y >= button.y && this.y <= button.y + buttonHeight){

                colision = true;
            }else{

                colision = false;
            }

        }else {

            colision = false;
        }

        return colision;
    }

    assignAddEventListeners(){

        this.canvas.addEventListener("mousemove", this.canvasMousemoveHandler.bind(this), false);
        this.canvas.addEventListener("mouseleave", () => this.isInside = false, false);
        this.canvas.addEventListener("mousedown", this.mouseDown.bind(this), false);
        this.canvas.addEventListener("mouseup", this.mouseUp.bind(this), false);
        
        document.oncontextmenu = this.disableRightClickMenu
    }

    canvasMousemoveHandler(event){

        //PREGUNTAR A OSCAR/ MIGUEL SOBRE EL CANVAS DE ESTA FUNCION
        // const canvas = document.getElementById('gameScreen');
        // Find the mouse's X and Y positions on the canvas
        this.x = Math.floor((event.pageX - this.canvas.offsetLeft) * (this.canvas.width / this.canvas.clientWidth));
        this.y = Math.floor((event.pageY - this.canvas.offsetTop) * (this.canvas.height / this.canvas.clientHeight));
        this.isInside = true;
    }

    mouseDown(e) {
        e = e 
        switch (e.which) {
          case 1: this.leftClick = true;
            break;
          case 3: this.rightClick = true;
        }
      } 
    
    
    mouseUp(mouse){
        this.leftClick = false;
        this.rightClick= false;
    
    }
    
    disableRightClickMenu() {

        return false
    }
    
    isCollidingWithSlot(slot){

        let result = false;

        const slotFirstWidthPoint = slot.xPos;
        const slotSecondWidthPoint = slot.xPos + slot.xSize;
        const slotFirstHeigthPoint = slot.yPos;
        const slotSecondHeigthPoint = slot.yPos + slot.ySize;

        if (this.x > slotFirstWidthPoint && this.x < slotSecondWidthPoint && this.y > slotFirstHeigthPoint && this.y < slotSecondHeigthPoint){
            
            result = true;
            return result;
        }

        return result;
    }
}
