import { CardId } from "../../constants.js";
import Phase from "./Phase.js";
import { PhaseStates, messageDiscardPhase } from "../../constants.js";

export default class DiscardPhase extends Phase{

    constructor(handDeck,  graveyardDeck, mouse){
        super();
        this.handDeck       = handDeck;
        this.graveyardDeck  = graveyardDeck;
        this.mouse          = mouse
    }
    execute(messagesContainer, value){
        this.handDeck.update(this.mouse, this.handDeck)
        
        messagesContainer.activeMessage(messageDiscardPhase);
        
        if (this.handDeck.cards.length > 4) {

            if (value <= 0){
                
                this.handDeck.autoSelectAnyCard();
            }

            const isAnyCardSelected = this.handDeck.isAnyCard(this.handDeck, CardId.SELECTED)
            if (isAnyCardSelected[0]) {

                const position = isAnyCardSelected[1]
                const card = this.handDeck.cards[position]
                this.handDeck.cards.splice(position, 1)
                this.graveyardDeck.cards.push(card)
                card.setDeck(this.graveyardDeck)
                card.state = CardId.NOT_SELECTED
                card.xPos = 2200;
                card.yPos = 1200;
                return false
            }
        }else {
            return true
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