import Phase from "./Phase.js";
import { CardId, SlotsState, PhaseStates, messageMovimentPhase1, messageMovimentPhase2, Sound, BoardCardSizes } from "../../constants.js";
import globals from "../../globals.js";
import ParticlesContainer from "../../ParticlesContainer.js";

export default class MinionMovementPhase extends Phase {

    constructor(activeMinionDeck, enemyActiveMinionDeck, boardGrid, mouse) {
        super();
        this.activeMinionDeck = activeMinionDeck;         // Deck de minions activos
        this.enemyActiveMinionDeck = enemyActiveMinionDeck  // Deck de minions enemigos activos
        this.boardGrid = boardGrid;             // Grid del tablero
        this.mouse = mouse;                    // Objeto Mouse
        this.sound = false
        this.isMoving = false;                  // El esbirro va de camino a la casilla elegida
    }

    execute(messagesContainer, particlesContainer, soundManager){

        this.boardGrid.cancelAviableSlots();
        this.activeMinionDeck.update(this.mouse, this.activeMinionDeck);
        this.boardGrid.update(this.mouse, [this.activeMinionDeck, this.enemyActiveMinionDeck]);

        const isAnyCardSelected = this.activeMinionDeck.isAnyCard(this.activeMinionDeck, CardId.SELECTED);
        const isAnySlotHovered  = this.boardGrid.isAnySlot(SlotsState.HOVER);
        const isAnySlotSelected  = this.boardGrid.isAnySlot(SlotsState.SELECTED);

        const minionSelected = isAnyCardSelected[2];

        let distance;
        let slotHovered;
        let slotSelected;

        if (isAnyCardSelected[0] === false){

            messagesContainer.activeMessage(messageMovimentPhase1);
        }

        if (isAnyCardSelected[0]){

            this.boardGrid.aviableMoveSlots(minionSelected);
            messagesContainer.activeMessage(messageMovimentPhase2);
        }

        if (isAnyCardSelected[0] && isAnySlotHovered[0]){

            const slotPositionHoveredI      = isAnySlotHovered[1];
            const slotPositionHoveredJ      = isAnySlotHovered[2];

            slotHovered       = this.boardGrid.slots[slotPositionHoveredI][slotPositionHoveredJ];

            distance = slotHovered.calculateDistance(minionSelected);
        }

        if (isAnyCardSelected[0] && isAnySlotSelected[0]){

            const slotPositionSelectedI     = isAnySlotSelected[1];
            const slotPositionSelectedJ     = isAnySlotSelected[2];

            slotSelected      = this.boardGrid.slots[slotPositionSelectedI][slotPositionSelectedJ];

            distance = slotSelected.calculateDistance(minionSelected);
        }

        if (minionSelected != undefined && minionSelected.speed >= distance){

            if (isAnySlotSelected[0]){
                this.isMoving = true;
                if(!this.sound){
                    soundManager.currentSound = Sound.MOVEMENT
                    this.sound = true
                }
                const isMovementFinish = this.moveMinion(minionSelected, slotSelected, particlesContainer);
                this.boardGrid.cancelAviableSlots();
                
                if (isMovementFinish){
                    this.isMoving = false;
                    this.sound = false
                    this.boardGrid.clearSlots();
                    return true;
                }
            }
        }
    }

    // funcion para realizar el movimiento
    moveMinion(minionSelected, slotSelected, particlesContainer){

        let speed = 350;

        const xDistance = slotSelected.xPos - minionSelected.xPos;
        const yDistance = slotSelected.yPos - minionSelected.yPos;
        const distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

        if (distance <= 15){

            speed = 30;
        }

        let vX = speed * (xDistance / distance);
        let vY = speed * (yDistance / distance);

        const minionXPos = minionSelected.xPos;
        const minionYPos = minionSelected.yPos;
        const minionXSize = BoardCardSizes.X_SIZE;
        const minionYSize = BoardCardSizes.Y_SIZE;
        const minionXSpeed = 20 * (xDistance / distance);
        const minionYSpeed = 20 * (yDistance / distance);

        particlesContainer.createMovement(minionXPos, minionYPos, minionXSize, minionYSize, minionXSpeed, minionYSpeed);

        minionSelected.xPos += vX * globals.deltaTime;
        minionSelected.yPos += vY * globals.deltaTime;

        if (distance < 5){
            
            minionSelected.xPos = slotSelected.xPos;
            minionSelected.yPos = slotSelected.yPos;
            minionSelected.state = CardId.NOT_SELECTED;
            return true;
        }
    }

    isPhaseCancelled(buttonContainer){

        const buttonState = buttonContainer.isAnyButtonSelected();

        if(buttonState === PhaseStates.DEFAULT){

            return true;
        }else {

            return false;
        }

    }
}