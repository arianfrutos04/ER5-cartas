import { CardId, DecksId, TypeId } from "../constants.js";
import CardFactory from "./CardFactory.js";
import { resetCardNumbers } from "./cardNumbers.js";
import Messages from "../Messages.js";
import { MessageType, MessageState } from "../constants.js";


export default class Deck {
    constructor(deckId, cards = []){

        this.deckId = deckId;
        this.cards  = cards
    }
    static createInitDeck(data, images, language){
        const cardFact = new CardFactory(data, images)
        cardFact.createCards(language)

        return new Deck (DecksId.INITIAL_DECK, cardFact.cards)
    }
    updateScale(mouse, decks, turnState, messagesContainer, language){
        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            card.updateScale(mouse, decks, turnState, messagesContainer, language)
            
        } 
    }
    update(mouse, decks = this, messagesContainer){
        
        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            card.update(mouse, decks, messagesContainer)
            
        }
    }

    
    isAnyCard(decks, state){
        
        let result = []
        const quantity = decks.length === undefined ? 1 : decks.length
        for (let i = 0; i < quantity; i++) {
            const deck = quantity === 1 ? decks : decks[i];
            if (deck.cards != undefined){
                for (let j = 0; j < deck.cards.length; j++) {
                    const card = deck.cards[j]
                    result[0] = card.state === state ? true : false
                    if (result[0] === true) {
                        result[1] = j
                        result[2] = card
                        return result
                    }
                }        
            }
            else{
                const card = deck
                result[0] = card.state === state ? true : false
                if (result[0] === true) {
                    result[1] = 0
                    result[2] = card
                    return result
                }
            }          
        }
        return result
    }

    shuffle(){
        for (let i = this.cards.length-1; i > 0; i--){

            const random = Math.floor(Math.random() * (i+1));
            [this.cards[i], this.cards[random]] = [this.cards[random], this.cards[i]]; 
            
        }

    }

    isAnyCardSelected(){
        for(let i = 0; i < this.cards.length; i++){

            const card = this.cards[i];

            if(card.state === CardId.SELECTED){

                return true;
            }
        }
        return false;
    }

    spawnNewMinions(activeMinionDeck){

        if (activeMinionDeck.cards.length < 3 && this.cards.length > 0){
            
            activeMinionDeck.cards.push(this.cards[this.cards.length - 1]);
            
            const card = activeMinionDeck.cards[activeMinionDeck.cards.length - 1];

            card.setDeck(activeMinionDeck);
            this.cards.pop();
            
            return card;
        }
    }

    restoreDeckMinionsStats(messagesContainer){
        
        for (let i = 0; i < this.cards.length; i++){

            const minion = this.cards[i];

            const health  = minion.previousHealth - minion.health;

            // El restablecimiento coincide con el cambio de turno y no se anima en los numeros
            minion.restoreMinionsStats();
            resetCardNumbers(minion);
            let minionYPos =  minion.yPos;
            let yPosMessage  =  minion.yPos < 364 ? minionYPos += 400 :
                                minion.yPos > 525 ? minionYPos -= 400 :
                                minionYPos;

            if(health > 0){
                
                console.log(yPosMessage);
                const message = new Messages(minion.xPos, yPosMessage, "+ " + health, MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.3, 1.5, 50, "#04ff00");
                messagesContainer.addMessage(message);
            }
        }
    }

    removeEquipIfdurability0(){

        for (let i = 0; i < this.cards.length; i++){

            const card = this.cards[i];
            
            if (card.weapon != undefined && card.weapon.durability <= 0){

                card.setWeapon(undefined);
            }

            if (card.armor != undefined && card.armor.durability <= 0){

                card.setArmor(undefined);
            }
        }
    }

    removeIfWornOut(graveyardDeck){

        for (let i = 0; i < this.cards.length; i++){

            const card = this.cards[i];
            
            card.removeIfWornOut(this, graveyardDeck);
        }  
    }

    autoSelectAnyCard(){

        const card = Math.floor(Math.random() * this.cards.length);
        
        this.cards[card].state = CardId.SELECTED;
    }

    renderCards(ctx, language, mouse, team){

        for (let i = 0; i < this.cards.length; i++){

            const card = this.cards[i];
            if (card.state != CardId.SCALED){

                card.render(ctx, language, team);

            }
            
            this.renderTooltips(mouse, language, ctx);
        }

    }

    renderTooltips(mouse, language, ctx){
        let isCollidingWithWeapon

        for (let i = 0; i < this.cards.length; i++){

            const card = this.cards[i];
            
            if (card.category === TypeId.WEAPON){
                
                isCollidingWithWeapon = mouse.isCollidingWithCard(card);

                if (isCollidingWithWeapon){

                    break;
                }
            }
        }

        for(let i = 0; i < this.cards.length; i++){

            const card = this.cards[i];

            const renderTooltip = card.checkTooltip();
            
            if (renderTooltip) {
                
                    if (this.deckId != DecksId.PLAYER_1_HAND_DECK && this.deckId != DecksId.PLAYER_2_HAND_DECK) {
    
                        let yPosModifier = 0
                        let xPosModifier = 0
                        if (mouse.y >600 && isCollidingWithWeapon) {
                            yPosModifier = 83
                        }
                        else if (mouse.y >600){
                            yPosModifier = 63
                        }
                        if (mouse.x >1750) {
                            xPosModifier = 218
                        }
                        const xPos = mouse.x - xPosModifier
                        const yPos = mouse.y - yPosModifier
                        
                        switch(card.category){
                            case TypeId.ARMOR:
                            case TypeId.BUFF:
                            case TypeId.JOSEPH:
                            case TypeId.MINION:
                            case TypeId.SPELL:
                            case TypeId.CURSE:
                                card.toolTip.render(xPos, yPos, language, ctx);
                                break;
                            case TypeId.WEAPON:
                                card.toolTip.render(xPos, yPos, language, ctx, card.range);
                                break;
                        }
                        
                }
            }
        }
    }

    deselect(){

        for (let i = 0; i < this.cards.length; i++){

            const card = this.cards[i];
            card.deselect();
        }
    }
}