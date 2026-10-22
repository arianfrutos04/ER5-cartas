
import Text from "./Text.js";
import { LanguageId , IconsPos, messageDefaultPhase, messageDiscardPhase, messageEndTurn, messageMovimentPhase1, messageMovimentPhase2, messageAttackPhase1, messageAttackPhase2, messagePrepareEventPhase1, messagePrepareEventPhase2, messageUseEventPhase1, messageUseEventPhase2, messageUseEventPhase3 } from "./constants.js";

export default class TextContainer{

    constructor(texts){

        this.texts = texts;
    }

    static createCardText(cardData){

        const description   = new Text([cardData.description, cardData.deskripzioa], IconsPos.DESCRIPTION, 12, 20, 55, 400);
        const name          = new Text([cardData.name, cardData.izena], IconsPos.NAME, 15, null, null, 260);
        const container     = [description, name];

        return new TextContainer(container);
    }

    static createMessageText(){
        
        const defaultPhase          = new Text(messageDefaultPhase, null, 18, 25, 130, 700);
        const discardPhase          = new Text(messageDiscardPhase, null, 18, 25, 130, 700);
        const movimentPhase1        = new Text(messageMovimentPhase1, null, 18, 25, 130, 700);
        const movimentPhase2        = new Text(messageMovimentPhase2, null, 18, 25, 130, 700);
        const attackPhase1          = new Text(messageAttackPhase1, null, 18, 25, 130, 700);
        const attackPhase2          = new Text(messageAttackPhase2, null, 18, 25, 130, 700);
        const prepareEventPhase1    = new Text(messagePrepareEventPhase1, null, 18, 25, 130, 700);
        const prepareEventPhase2    = new Text(messagePrepareEventPhase2, null, 18, 25, 130, 700);
        const useEventPhase1        = new Text(messageUseEventPhase1, null, 18, 25, 130, 700);
        const useEventPhase2        = new Text(messageUseEventPhase2, null, 18, 25, 130, 700);
        const useEventPhase3        = new Text(messageUseEventPhase3, null, 18, 25, 130, 700);
        const endTurn               = new Text(messageEndTurn, null, 18, 25, 130, 700);
        const container             = [defaultPhase, discardPhase, movimentPhase1, movimentPhase2, attackPhase1, attackPhase2, prepareEventPhase1, prepareEventPhase2, useEventPhase1, useEventPhase2, useEventPhase3, endTurn];

        return new TextContainer(container);
    }

    static create(text, type, size, lineSpace, maxHeigth, maxWidth){
        text =  [new Text(text, type, size, lineSpace, maxHeigth, maxWidth)];
        return new TextContainer(text)
    }
    render(ctx, xPos, yPos, language){

        for(let i = 0; i < this.texts.length; i++){

            const text = this.texts[i];
                
            text.render(ctx, xPos, yPos, language);
        }
    }
}