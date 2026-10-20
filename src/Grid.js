import { CardId, SlotsState } from "./constants.js";
import Slot from "./Slot.js";

export default class Grid{

    constructor(xPos, yPos, id, rows, columns, slots){

        this.xPos               = xPos;
        this.yPos               = yPos;
        this.id                 = id;
        this.rows               = rows;
        this.columns            = columns;
        this.slots              = slots;
    }

    // Funcion crea un Grid y sus Slots
    static initGrids(xPosGrid, yPosGrid, rowsNum, columnsNum, gridId, xSizeSlots, ySizeSlots, xGapSlots = 6.252, yGapSlots = 6.251){

        // Posicion del Grid
        const gridXPos = xPosGrid;
        const gridYpos = yPosGrid;

        // Filas y Columnas
        const rows = rowsNum;
        const columns = columnsNum;

        // Id del Grid
        const id = gridId;
        
        // Array de Slots para guardar en el Grid
        let slotsArray = [];

        for (let i = 0; i < columns; i++){

            slotsArray[i] = [];
            
            for (let j = 0; j < rows; j++){

                // Tamaño de los Slots
                const slotsXsize = xSizeSlots;
                const slotsYsize = ySizeSlots;

                // Calculo de la posicion de los Slots
                let slotsXPos = Math.floor(gridXPos + slotsXsize * j )+ xGapSlots*j;
                let slotsYPos = Math.floor(gridYpos + slotsYsize * i )+ yGapSlots*i;

                // Crear Slots
                const slots = new Slot(slotsXPos, slotsYPos, slotsXsize, slotsYsize);

                slotsArray[i][j] = slots;
            }
        }
        
        // Crear Grid
        return new Grid(gridXPos, gridYpos, id, rows, columns, slotsArray);
    }

    update(mouse, deck){

        for (let i = 0; i < this.slots.length; i++){

            for (let j = 0; j < this.slots[0].length; j++){

                const slot = this.slots[i][j];
                slot.update(mouse, this, deck);
            }
        }
    }

    render(ctx){
                    // Numero de filas y comumnas de los Slots
                    const rows = this.slots.length;
                    const columns = this.slots[0].length;
        
                    for (let j = 0; j < rows; j++) {
        
                        for (let k = 0; k < columns; k++) {
        
                            const slot = this.slots[j][k];
                            slot.render(ctx)
                            
                        }
                    }
    }
    aviableMoveSlots(minionSelected){

        for (let i = 0; i < this.slots.length; i++){

            for (let j = 0; j < this.slots[0].length; j++){

                const slot = this.slots[i][j];
                const distance = slot.calculateDistance(minionSelected);

                if (minionSelected.speed >= distance && slot.isEmpty){
                    slot.isMoveAviable = true;
                    slot.color = "green";
                }
            }
        }
    }

    aviableAttackSlots(minionSelected, deck){

        for (let i = 0; i < this.slots.length; i++){

            for (let j = 0; j < this.slots[0].length; j++){

                const slot = this.slots[i][j];
                const distance = slot.calculateDistance(minionSelected);
                const isSlotUsed = slot.isSlotUsed(deck);

                let range;

                if (minionSelected.weapon != undefined){
                    range = minionSelected.weapon.range;
                }

                else{
                    range = minionSelected.range;
                }

                if (range >= distance && isSlotUsed === false){
                    slot.isAttackAviable = true;

                    if (minionSelected.weapon != null && minionSelected.weapon.range === 1){

                        slot.color = "orange";
                    }

                    else if (minionSelected.weapon != null && minionSelected.weapon.range > 1){

                        slot.color = "blue";
                    }

                    else{

                        slot.color = "red";
                    }
                }
            }
        }
    }

    cancelAviableSlots(){

        for (let i = 0; i < this.slots.length; i++){

            for (let j = 0; j < this.slots[0].length; j++){

                const slot = this.slots[i][j];
                slot.isMoveAviable = false;
                slot.isAttackAviable = false;
                slot.color = "black";
            }
        }
    }

    clearSlots(){

        for (let i = 0; i < this.slots.length; i++){

            for (let j = 0; j < this.slots[0].length; j++){

                const slot = this.slots[i][j];
                slot.isAviable = false;
                slot.state = SlotsState.NOT_SELECTED
                slot.color = "black";
            }
        }
    }

    freeSlots(){

        for (let i = 0; i < this.slots.length; i++){

            for (let j = 0; j < this.slots[0].length; j++){

                const slot = this.slots[i][j];
                slot.isEmpty = true;
                slot.color = "black";
            }
        }
    }
    isAnySlot(state){

        let result = []
        
        for (let i = 0; i < this.slots.length; i++){
            
            for (let j = 0; j < this.slots[0].length; j++){

                const slot = this.slots[i][j];
                
                if (slot.state === state){

                    result[0] = true;
                    result[1] = i;
                    result[2] = j;
                    return result
                }

                else{

                    result[0] = false;
                }
            }         
        }

        return result
    }

    deselect(){

        for (let i = 0; i < this.slots.length; i++){

            for (let j = 0; j < this.slots[0].length; j++){
            
                const slot = this.slots[i][j];
                slot.deselect(this.deck);
            }
        }
    }
}