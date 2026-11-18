import { BuffId, CurseId, PhaseStates, messageDefaultPhase } from "../../constants.js";
import Phase from "./Phase.js";

export default class messagesContainerDefaultPhase extends Phase {

    constructor(buttonContainer, activeEventDeck, enemyEventDeck, graveyardDeck, eventContainer){  
        super();
        this.state              = PhaseStates.DEFAULT;
        this.buttonContainer    = buttonContainer;
        this.activeEventDeck    = activeEventDeck;
        this.enemyEventDeck     = enemyEventDeck;
        this.graveyardDeck      = graveyardDeck;
        this.eventContainer     = eventContainer;

    }

    execute(messagesContainer){
        messagesContainer.activeMessage(messageDefaultPhase);
     
        let returnState = this.buttonContainer.isAnyButtonSelected();

        this.updateEventDeck();
        if(returnState !== undefined){
            
            return returnState;

        }else{
            return this.state;

        }

    }

    isPhaseCancelled(buttonContainer){
        
        const buttonState = buttonContainer.isAnyButtonSelected();

        if(buttonState != PhaseStates.DEFAULT){

            return buttonState;
        }else {

            return false;
        }

    }

    updateEventDeck(){
        for(let i = 0; i < this.activeEventDeck.cards.length; i++){
            const card = this.activeEventDeck.cards[i];

            if(card.id === BuffId.HERO_EMPOWERMENT ||card.id === BuffId.TOAST){
                card.eventContainer = this.eventContainer;
                card.logic();
            }

            switch(card.id){
                case CurseId.MOLOTOV_COCKTAIL:
                    card.curseLogic();
                    break;
                case BuffId.DECEPTION:
                    card.eventContainer = this.eventContainer;
                    card.logic();
                    break;
            }
            
        }
    }
}


