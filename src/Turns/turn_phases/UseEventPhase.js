import { CardId, TypeId, PhaseStates, messageUseEventPhase1, messageUseEventPhase2, messageUseEventPhase3, CardActions, BuffId, TypeNames, Sound } from "../../constants.js";
import Phase from "./Phase.js";
import Messages from "../../Messages.js";
import { BoardCardSizes, MessageType, MessageState, TypeColors } from "../../constants.js";
import Card from "../../Cards/Card.js";

export default class UseEventPhase extends Phase{

    constructor(eventGrid, eventDeck, boardGrid, activeMinions, enemyActiveMinions, mouse, turn){
        super();
        this.eventGrid              = eventGrid;
        this.eventDeck              = eventDeck;
        this.boardGrid              = boardGrid;
        this.activeMinions          = activeMinions;
        this.enemyActiveMinions     = enemyActiveMinions;
        this.mouse                  = mouse;
        this.damageDone             = 0;
        this.turn                   = turn
    }
    execute(eventContainer, mouse, messagesContainer, soundManager, particlesContainer){

        this.eventGrid.update(mouse, this.eventDeck);
        this.boardGrid.update(mouse, [this.activeMinions, this.enemyActiveMinions]);
        const decks = [this.eventDeck, this.activeMinions, this.enemyActiveMinions]
        for (let i = 0; i < decks.length; i++) {
            const deck = decks[i];
            deck.update(mouse, decks)
            
        }
        
        const isAnyCardSelected  = this.eventDeck.isAnyCard(this.eventDeck, CardId.SELECTED);
        
        if (isAnyCardSelected.length === 0){
            
            messagesContainer.activeMessage(messageUseEventPhase1);
        }

        else{

            if (isAnyCardSelected[0] === false){

                messagesContainer.activeMessage(messageUseEventPhase2);
            }
    
            if (isAnyCardSelected[0]){
    
                messagesContainer.activeMessage(messageUseEventPhase3);
            }
        }

        if (isAnyCardSelected[0]) {
            
            const eventPosition     = isAnyCardSelected[1]
            const eventCard         = this.eventDeck.cards[eventPosition]
            
            let minionDeck;
            let sound = undefined
            switch (eventCard.category){

                case TypeId.BUFF:
                    minionDeck = this.activeMinions;
                    sound = Sound.BUFF
                    break;
                case TypeId.CURSE:
                    minionDeck = this.enemyActiveMinions;
                    sound = Sound.CURSE
                    break;
                case TypeId.SPELL:
                    minionDeck = this.enemyActiveMinions
                    sound = Sound.FIREBALL
                    break;
                case TypeId.WEAPON:
                    minionDeck = this.activeMinions;
                    sound = Sound.EQUIP_ARMOR
                    break;
                case TypeId.ARMOR:
                    minionDeck = this.activeMinions;
                    sound = Sound.EQUIP_ARMOR
                    break;
                default:
                    break;
            }
            
            const isAnyMinionHovered = this.activeMinions.isAnyCard(minionDeck, CardId.HOVER)
            
            if (isAnyMinionHovered[0]){

                const minionPosition    = isAnyMinionHovered[1]
                const minionCard        = minionDeck.cards[minionPosition]

                if (isAnyMinionHovered[0] && !mouse.leftClick && mouse.previousStateLeft) {
                    
                    if(eventCard.action !== CardActions.ON_USE){
                        const message = new Messages(minionCard.xPos, minionCard.yPos, TypeNames[eventCard.category], MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.3, 0.3, 50, TypeColors[eventCard.category]);
                        messagesContainer.addMessage(message);
                        particlesContainer.createEvent(minionCard.xPos, minionCard.yPos, BoardCardSizes.X_SIZE, BoardCardSizes.Y_SIZE, eventCard.category);
                    }
                    
                    let result;
                    if (eventCard.id != BuffId.TELEPORT) {
                        result = eventContainer.createDurabilityEvent(eventCard);
                        result = eventContainer.createCommonEvent(eventCard, minionCard, messagesContainer, soundManager, sound);
                        this.calculateDamageDone(eventCard);
                        
                    }else{
                        if (eventCard.action != CardActions.ON_USE) {
                            result = eventContainer.createDurabilityEvent(eventCard);
                            eventContainer.createTeleportEvent(this.turn, eventCard, minionCard, messagesContainer, soundManager, sound);
                            
                        }
                    }

                    return result;
                }
            }
        }
    }

    isEventCancelled(buttonContainer){
        
        const buttonState = buttonContainer.isAnyButtonSelected();

        if(buttonState === PhaseStates.DEFAULT){

            return true;
        }else {

            return false;
        }

    }

    setEventGrid(grid){
        this.activeEventGrid = grid
    }

    calculateDamageDone(eventCard){
        if(eventCard.effect != undefined){
            for(let i = 0; i < eventCard.effect.length; i++){
                this.damageDone += eventCard.effect[i].common_effect_value;          
            }
        }

    }

}