import EventContainer from "../../Events/EventContainer.js";
import { DestroyAllMinionsEvent } from "../../Events/phase_events/DestroyAllMinionsEvent.js";
import { BorderId, CardActions, CardId, DecksId, IconsPos, TurnStates, VFXId, MessageState, MessageType } from "../../constants.js";
import Card from "../Card.js";
import Messages from "../../Messages.js";
export default class Joseph extends Card{

    constructor(id, texts, image, rarity, category, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse,imageVFX, effect, durability, chatBubble, messages, toolTip){

        super(id,texts, image, rarity, category, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, imageVFX, toolTip);
        this.deckObjetives
        this.graveyardDeck
        this.eventContainer
        this.effect = effect; // efecto carta joseph
        this.durability = durability
        this.previousDurability = durability
        this.chatBubble = chatBubble
        this.messages       = messages
        this.previousMessage= undefined
        
    }
    updateScale(mouse, decks, turnState, messagesContainer){
        const isAnyCardScaled = this.deck.isAnyCard(decks, CardId.SCALED)
        if (!isAnyCardScaled[0] && turnState != TurnStates.INITIALIZE) {
            const isCollidingWithMouse = mouse.isCollidingWithCard(this)

            switch (this.state) {
                case CardId.NOT_SELECTED:
                    if (this.previousMessage != undefined) {
                        if (this.previousMessage.state === MessageState.OFF) {
                            this.previousMessage = undefined
                        }
                    }
                    this.state = isCollidingWithMouse ? this.state = CardId.HOVER : CardId.NOT_SELECTED

                    break;

                case CardId.HOVER:
                    this.state = isCollidingWithMouse ? this.state = CardId.HOVER : CardId.NOT_SELECTED
                    this.state = !mouse.rightClick && mouse.previousStateRight ? CardId.SCALED : this.state
                    if (!mouse.leftClick && mouse.previousStateLeft && this.previousMessage === undefined) {
                        const random = Math.floor(Math.random()*this.messages.length)
                        const message       = this.messages[random]
                        const text = messagesContainer.createMessage(IconsPos.JOSEPH_CHAT_TEXT_X, IconsPos.JOSEPH_CHAT_TEXT_Y, message, MessageType.CHAT_MESSAGE, MessageState.APPEAR, 1.5, 0.7, 0.3,25, 100, 600, 17, "black");
                        this.previousMessage = text
                    } else{
                        if (this.previousMessage != undefined) {
                            if (this.previousMessage.state === MessageState.OFF) {
                                this.previousMessage = undefined
                            }
                        }
                    }
                    break;

                case CardId.SELECTED:
                    this.state = !mouse.rightClick && mouse.previousStateRight && isCollidingWithMouse ? CardId.SCALED : this.state
                    if (this.previousMessage != undefined) {
                        if (this.previousMessage.state === MessageState.OFF) {
                            this.previousMessage = undefined
                        }
                    }
                    break;
            }
        } else if (this.state === CardId.SCALED) {
            this.state = !mouse.rightClick && mouse.previousStateRight ? CardId.NOT_SELECTED : this.state
        }
    }
    update(mouse, decks){
    
        const isAnyCardScaled   = this.deck.isAnyCard(decks, CardId.SCALED)
        const isAnyCardSelected = this.deck.isAnyCard(decks, CardId.SELECTED)

        if (!isAnyCardScaled[0]) {
            const isCollidingWithMouse = mouse.isCollidingWithCard(this)
    
            switch (this.state) {
                case CardId.NOT_SELECTED:
                    
                    this.state = isCollidingWithMouse ? this.state = CardId.HOVER : CardId.NOT_SELECTED
                    
                    break;
    
                    case CardId.HOVER:
                        this.state = isCollidingWithMouse   ? this.state = CardId.HOVER : CardId.NOT_SELECTED
                        if (this.action === CardActions.ON_USE) {
                            this.state =
                                !mouse.leftClick    && !isAnyCardSelected[0] && mouse.previousStateLeft      ? CardId.SELECTED            : this.state                           
                        }
                        break;
    
                    case CardId.SELECTED:
                        this.state = 
                            !mouse.leftClick      && mouse.previousStateLeft  && isCollidingWithMouse    ? CardId.NOT_SELECTED        :  this.state
                        // console.log("selected");
                        break;

                    case CardId.SCALED:
        
                        break;
                
                    case CardId.ATTACK:

                        
                        break;
                
                default:
                    break;
            }
        } 
            this.previousState = this.state
        this.josephLogic(mouse)
    }
    josephLogic(mouse){
        switch (this.action) {
            case CardActions.READY:
                this.xPos = 1750
                this.yPos = 44
                this.size = CardId.SMALL_SIZE
                this.eventContainer.createJosephEvents(this.deckObjetives, this, mouse)
                this.action = CardActions.ON_USE
                break;

            case CardActions.ON_USE:
                if (this.durability === 0) {
                    this.action = CardActions.WORN_OUT
                }
                break;

            case CardActions.WORN_OUT:
                this.xPos = -400
                this.yPos = 1200;
                this.size = CardId.BIG_SIZE
                this.graveyardDeck.cards.push(this)
                this.deck.cards.pop()
                this.deck = this.graveyardDeck
                break;
                
            default:
                break;
        }
    }
    setObjetive(decks){
        this.deckObjetives = decks
    }
    setDeck(deck){
        this.deck = deck
    }

    checkDurability(){
        if (this.durability <= 0) {
            this.action = CardActions.WORN_OUT
        }
    }

    removeIfWornOut(activeEventDeck, graveyardDeck){

        this.checkDurability()
        if (this.action === CardActions.WORN_OUT) {
            for (let i = 0; i < activeEventDeck.cards.length; i++) {
                const card = activeEventDeck.cards[i];
                if (card.action === CardActions.WORN_OUT) {
                    activeEventDeck.cards.splice(i, 1)
                    graveyardDeck.cards.push(card)
                    this.setDeck(graveyardDeck)
                    return true
                }
            }  
        }
        return false
    }
    deselect(){

        this.state = CardId.NOT_SELECTED;
    }

    restoreValues(){

        this.xPos = 2200;
        this.yPos = 1200;
        this.durability = this.previousDurability;
        this.action = this.previousAction;
        this.state = this.previousState;
        this.size = this.previousSize;
    }

    render(ctx, language){

        ctx.fillStyle = "black"
        let xPos = this.xPos
        let yPos = this.yPos
            ctx.font = "25px LongaIberica-DEMO";
            let cardVFX
            if (this.deck.deckId === DecksId.PLAYER_1_HAND_DECK || this.deck.deckId === DecksId.PLAYER_2_HAND_DECK) {
                ctx.setTransform(0.8, 0, 0, 0.8, 0, 0);
                for (let i = 0; i < this.deck.cards.length; i++) {
                    const card = this.deck.cards[i];
                    if (this === card) {
                        xPos = this.xPos * 1.25
                        yPos = this.yPos * 1.25
                    }
                }
            }
            if (this.state != CardId.BLOCKED) {

            //CARD IMAGE
            let size = this.size
            if (this.state === CardId.SCALED ) {
                ctx.setTransform(1.6, 0, 0, 1.6, 0, 0);
                xPos = 475
                yPos = 140
                size = CardId.BIG_SIZE
                
            }else if(this.state === CardId.SELECTED){
                if (this.deck.deckId=== DecksId.PLAYER_1_HAND_DECK || this.deck.deckId === DecksId.PLAYER_2_HAND_DECK) {
                    yPos-=100 
                }
                cardVFX = this.imageVFX[VFXId.SELECTED][size]
                ctx.drawImage(
                    cardVFX,                 //Img File
                    IconsPos.VFX_X[size] + xPos,IconsPos.VFX_Y[size] + yPos                    //X & Y Position Source
                    )
            }else if(this.state === CardId.HOVER){
                if (this.deck.deckId=== DecksId.PLAYER_1_HAND_DECK || this.deck.deckId === DecksId.PLAYER_2_HAND_DECK) {
                    yPos-=100 
                }
                cardVFX = this.imageVFX[VFXId.HOVER][size]
                ctx.drawImage(
                    cardVFX,                 //Img File
                    IconsPos.VFX_X[size] + xPos,IconsPos.VFX_Y[size] + yPos                    //X & Y Position Source
                    )
            }
            ctx.drawImage(
                this.image[size],                 //Img File
                xPos + IconsPos.IMAGE_X[size],yPos + IconsPos.IMAGE_Y[size]                 //X & Y Position Source
            )
                
                
                // BORDER
                ctx.drawImage(
                    this.imageBorders[size],
                    xPos, yPos)

                    if (size === BorderId.NORMAL_SIZE) {
                        this.texts.render(ctx, xPos, yPos, language);
                        
                        //CATEGORY ICON
                        ctx.drawImage(
                            this.imageCategory,
                            IconsPos.CATEGORY_X + xPos, IconsPos.CATEGORY_Y + yPos)
                    }
            //RARITY ICON
            ctx.drawImage(
                
                this.imageRarity[size],
                IconsPos.RARITY_X[size] + xPos, IconsPos.RARITY_Y[size] + yPos)
            } else {
                ctx.drawImage(
                    this.imageReverse,
                    xPos, yPos)
            }
            if (this.action === CardActions.READY ||this.action === CardActions.ON_USE && this.state !== CardId.SCALED) {
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.ellipse(this.xPos + IconsPos.JOSEPH_X, this.yPos + IconsPos.JOSEPH_Y, 62, 75, 0, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.fillStyle = "black"
                ctx.fill();
                ctx.globalAlpha = 1;

                ctx.font = "bold 40px LongaIberica-DEMO";
                ctx.fillStyle = "white"
                ctx.fillText(Math.ceil(this.durability),   xPos + IconsPos.JOSEPH_X , yPos + IconsPos.JOSEPH_Y);
                ctx.strokeText(Math.ceil(this.durability), xPos + IconsPos.JOSEPH_X , yPos + IconsPos.JOSEPH_Y);
                ctx.font = "25px LongaIberica-DEMO";
                ctx.fillStyle = "black"
            }
            if (this.previousMessage != undefined) {
                if(yPos < 500){
                    xPos = IconsPos.CHAT_BUBBLE_X[0]
                    yPos = IconsPos.CHAT_BUBBLE_Y[0]
                }else {
                    xPos = IconsPos.CHAT_BUBBLE_X[1]
                    yPos = IconsPos.CHAT_BUBBLE_Y[1]
                }
                ctx.setTransform(0.7, 0, 0, 0.7, 0, 0);
                ctx.rotate((180 * Math.PI) / 180);
                ctx.drawImage(
                    this.chatBubble,               
                    -2570, -500
                )
            }
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            if (this.state === CardId.HOVER) {
                return true
            } else {
                return false
            }

    }
    // renderToolTip(xPos, yPos, language, ctx){
    //     ctx.fillStyle = '#d59d00'
    //     ctx.fillRect(xPos, yPos, 178, 103 ) 

    //     ctx.fillStyle = '#362315'
    //     ctx.fillRect(xPos + 3, yPos + 3, 172, 97 ) 
    //     ctx.fillStyle = 'white'
    //     this.texts.texts[1].render(ctx, xPos, yPos-200, language) 
    // }

    
    checkTooltip(){
        if(this.state === CardId.HOVER){
            
            return true;
        }else{
            this.toolTip.timer.restart();
            return false;
        }
    }

    static create(id, texts, image, rarity, category, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, effect, attributes, chatBubble, messages, toolTip){
        const cooldown = attributes[0].attribute_value
        const joseph = new Joseph(id, texts, image, rarity, category, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, effect, cooldown, chatBubble, messages, toolTip);

        return joseph;
    }
}
