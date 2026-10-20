import { SlotsState } from "./constants.js";

// Color del brillo de un Slot segun el color de su estado
const SLOT_GLOW_COLORS = {
    white:  [255, 236, 190],
    yellow: [255, 196, 64],
    green:  [96, 214, 120],
    red:    [235, 64, 52],
    orange: [255, 140, 40],
    blue:   [90, 170, 255],
};

export default class Slot{

    constructor(xPos, yPos, xSize, ySize){

        this.xPos               = xPos;
        this.yPos               = yPos;
        this.xSize              = xSize;
        this.ySize              = ySize;
        this.state              = SlotsState.NOT_SELECTED;
        this.isEmpty            = true;
        this.isMoveAviable      = false;
        this.isAttackAviable    = false;
        this.color;
    }

    update(mouse, grid, deck){

        const isSlotSelected = this.isSlotSelected(grid);
        this.isSlotUsed(deck);
        
        if (this.isEmpty){
            
            const isCollidingWithMouse = mouse.isCollidingWithSlot(this);
            const isLeftClick          = mouse.leftClick;
            const isLeftClickPrevious  = mouse.previousStateLeft;
    
            switch (this.state){
                
                case SlotsState.NOT_SELECTED:
    
                    this.color = "black";

                    if (isCollidingWithMouse){

                        this.state = SlotsState.HOVER;
                    }
                    break;
    
                case SlotsState.HOVER:

                    this.color = "white";
                    
                    if (isCollidingWithMouse === false){
                        
                        this.state = SlotsState.NOT_SELECTED;
                    }

                    else if (isLeftClick === false && isSlotSelected === false && isLeftClickPrevious){
                        
                        this.state = SlotsState.SELECTED;
                    }
                    break;

                case SlotsState.SELECTED:
                    
                    this.color = "yellow";

                    if (isLeftClick === false && isLeftClickPrevious && isCollidingWithMouse){
                        
                        this.state = SlotsState.NOT_SELECTED;
                    }
                    break;
            
                default:

                    break;
            }
        }

        else{

            this.color = "black";
        }
    }

    render(ctx){
        // Posicion y tamaño de los Slots
        const slotsXPos = this.xPos;
        const slotsYPos = this.yPos;
        const slotsXSize = this.xSize;
        const slotsYSize = this.ySize;

        // Los Slots de eventos son los unicos de menos de 100 px de ancho
        const isEventSlot = slotsXSize < 100;
        const glowColor = SLOT_GLOW_COLORS[this.color];

        ctx.save();

        if (glowColor === undefined){

            const inset = isEventSlot ? 0 : 2;

            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "black";
            Slot.roundedPath(ctx, slotsXPos + inset, slotsYPos + inset, slotsXSize - inset * 2, slotsYSize - inset * 2, isEventSlot ? 11 : 16);
            ctx.fill();
        }

        else{

            const [red, green, blue] = glowColor;
            const radius = isEventSlot ? 11 : 13;
            const inset = isEventSlot ? 3 : 4;
            const xPos = slotsXPos + inset;
            const yPos = slotsYPos + inset;
            const width = slotsXSize - inset * 2;
            const height = slotsYSize - inset * 2;
            const xCenter = slotsXPos + slotsXSize / 2;
            const yCenter = slotsYPos + slotsYSize / 2;

            // El brillo nace del borde hacia dentro, sin salirse del Slot
            Slot.roundedPath(ctx, xPos, yPos, width, height, radius);
            ctx.clip();

            const gradient = ctx.createRadialGradient(xCenter, yCenter, Math.min(slotsXSize, slotsYSize) * 0.15, xCenter, yCenter, Math.max(slotsXSize, slotsYSize) * 0.62);
            gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0.06)`);
            gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0.30)`);
            ctx.fillStyle = gradient;
            ctx.fillRect(xPos, yPos, width, height);

            ctx.shadowColor = `rgba(${red}, ${green}, ${blue}, 0.85)`;
            ctx.shadowBlur = 12;
            ctx.lineWidth = 4;
            ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, 0.55)`;
            Slot.roundedPath(ctx, xPos, yPos, width, height, radius);
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, 0.9)`;
            Slot.roundedPath(ctx, xPos + 0.75, yPos + 0.75, width - 1.5, height - 1.5, radius - 0.75);
            ctx.stroke();
        }

        ctx.restore();
        ctx.fillStyle = "black";
    }

    static roundedPath(ctx, xPos, yPos, width, height, radius){

        ctx.beginPath();
        ctx.moveTo(xPos + radius, yPos);
        ctx.arcTo(xPos + width, yPos, xPos + width, yPos + height, radius);
        ctx.arcTo(xPos + width, yPos + height, xPos, yPos + height, radius);
        ctx.arcTo(xPos, yPos + height, xPos, yPos, radius);
        ctx.arcTo(xPos, yPos, xPos + width, yPos, radius);
        ctx.closePath();
    }
    
    isSlotSelected(grid){
        
        let result = false;
        
        for (let i = 0; i < grid.slots.length; i++){

            for (let j = 0; j < grid.slots[0].length; j++){

                const slot = grid.slots[i][j];

                if (slot.state === SlotsState.SELECTED){
                    
                    result = true;
                    return result;
                }
            }
        }

        return result;
    }
    
    isSlotUsed(decks){

        if (decks.length === undefined && decks.cards.length != undefined){

            for (let j = 0; j < decks.cards.length; j++){

                const card = decks.cards[j];

                if (card.xPos === this.xPos && card.yPos === this.yPos){
                    
                    this.isEmpty = false;
                    this.isAviable = false;
                    this.state = SlotsState.NOT_SELECTED;
                    this.color = "black";
                    return true;
                }
            }
        }

        else{
            
            for (let i = 0; i < decks.length; i++){

                const deck = decks[i];
                
                for (let j = 0; j < deck.cards.length; j++){
                    
                    const card = deck.cards[j];

                    if (card.xPos === this.xPos && card.yPos === this.yPos){
                            
                        this.isEmpty = false;
                        this.isAviable = false;
                        this.state = SlotsState.NOT_SELECTED;
                        this.color = "black";
                        return true;
                    }
                }
            }
 
        }

        this.isEmpty = true;
        return false;
    }

    calculateDistance(minion){

        const slotXSize = this.xSize;     // Ancho del slot en x
        const slotYSize = this.ySize;     // Alto del slot en y

        const xPosMinion = minion.xPos;     // Posicion en x del Minion
        const xPosSlot = this.xPos;          // Posicion en x del Slot
        const yPosMinion = minion.yPos;     // Posicion en y del Minion
        const yPosSlot = this.yPos;          // Posicion en y del Slot

        // Calcular la diferencia en píxeles en slots
        const xDifference = Math.abs(xPosMinion - xPosSlot);
        const yDifference = Math.abs(yPosMinion - yPosSlot);
        
        // Calcular la distancia en  slots
        const distanceXSlots = Math.floor(xDifference / slotXSize);
        const distanceYSlots = Math.floor(yDifference / slotYSize);
        return distanceXSlots + distanceYSlots;
    }

    deselect(){

        this.state = SlotsState.NOT_SELECTED;
        this.isMoveAviable = false;
        this.isAttackAviable = false;
        this.color = "black";
    }
}