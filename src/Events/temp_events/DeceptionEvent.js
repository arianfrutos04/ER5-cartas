import { CardId } from "../../constants.js";
import Event from "../Event.js";

export default class DeceptionEvent extends Event{
    constructor(card, handDeck, enemyHandeck) {
        super();
        this.card           = card;
        this.handDeck       = handDeck;
        this.enemyHandeck   = enemyHandeck;
        this.active         = true;
    }

    execute(){
        if(this.card.durability === 0){
            return true;
        }
        this.card.durability -= 0.5;

        if(this.active){
            
            const finalHandeck      = this.enemyHandeck.cards;
            const finalEnemyHandeck = this.handDeck.cards;
            const mainYPos = this.handDeck.cards[0].yPos
            const enemyYPos = this.enemyHandeck.cards[0].yPos
            for (let i = 0; i < finalHandeck.length; i++) {
                const card = finalHandeck[i];
                card.deck = this.handDeck
                card.yPos = enemyYPos
                card.state = CardId.BLOCKED
                
            }
            for (let i = 0; i < finalEnemyHandeck.length; i++) {
                const card = finalEnemyHandeck[i];
                card.deck = this.enemyHandeck
                card.yPos = mainYPos
                card.state = CardId.NOT_SELECTED
                
            }
            this.enemyHandeck.cards       = finalEnemyHandeck;
            this.handDeck.cards           = finalHandeck;

            this.active = false;
        }
    }


}