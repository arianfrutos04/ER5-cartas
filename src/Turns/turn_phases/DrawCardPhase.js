import { CardActions, CardImageId, MAXIMUN_CARDS_IN_HAND, Sound } from "../../constants.js";
import Phase from "./Phase.js";

export default class DrawCardPhase extends Phase{

    constructor(handDeck, handGrid, eventDeck, graveyardDeck, josephDeck){
        super();
        this.handDeck       = handDeck;
        this.handGrid       = handGrid;
        this.eventDeck      = eventDeck;
        this.graveyardDeck  = graveyardDeck;
        this.josephDeck     = josephDeck;
    }
    execute(eventContainer, soundManager, quantity = 1){
        for (let i = 0; i < quantity; i++) {
            if (this.eventDeck.cards.length > 0) {                
                if (this.handDeck.cards.length < MAXIMUN_CARDS_IN_HAND) {
                    const card = this.eventDeck.cards[this.eventDeck.cards.length - 1]
                    if (card.id === CardImageId.JOSEPH) {
                        i--
                        card.action = CardActions.READY
                        card.setDeck(this.josephDeck)
                        card.graveyardDeck = this.graveyardDeck
                        card.eventContainer = eventContainer
                        this.josephDeck.cards.push(card)
                        this.eventDeck.cards.pop();
                    }else{
                        this.handDeck.cards.push(card);
                        card.setDeck(this.handDeck)
                        this.eventDeck.cards.pop();            
                    }
                    soundManager.currentSound = Sound.DRAW
                }            
            } else {
                this.restoreEventDeck()
                i--
            }
        }
    }
    
    restoreEventDeck(){
        for (let i = this.graveyardDeck.cards.length-1; i > -1; i--) {
            const card = this.graveyardDeck.cards[i];
            this.eventDeck.cards.push(card)
            card.setDeck(this.eventDeck)
            card.restoreValues()
            card.deck = this.eventDeck
            this.graveyardDeck.cards.pop()
        }
        this.eventDeck.shuffle()
    }
}