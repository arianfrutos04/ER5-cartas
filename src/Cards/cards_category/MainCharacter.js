import { BorderId, CardId, CardImageId, ChatMessages, IconsPos, VFXId, MessageState, MessageType, TurnStates } from "../../constants.js";
import Card from "../Card.js";
import Messages from "../../Messages.js";
export default class MainCharacter extends Card{
    constructor(id, texts, image, rarity, category, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, imageVFX, effect, imageHeroTeam, chatBubble, messages, durability=0, cooldown=0, toolTip){
            super(id, texts, image, rarity, category, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, imageVFX, toolTip);
    
            // Card attributes     		   	
            this.durability     = durability;
            this.cooldown       = cooldown; 
            this.player         = 0;
            this.effect         = effect;
            this.imageHeroTeam  = imageHeroTeam;
            this.chatBubble     = chatBubble
            this.messages       = messages
            this.previousMessage= undefined
            this.turnMessage    = false
        }
        updateScale(mouse, decks, turnState, messagesContainer, language){
            const isAnyCardScaled = this.deck.isAnyCard(decks, CardId.SCALED)
            if (!isAnyCardScaled[0] && turnState != TurnStates.INITIALIZE) {
                const isCollidingWithMouse = mouse.isCollidingWithCard(this)
    
                switch (this.state) {
                    case CardId.NOT_SELECTED:
                        if (this.previousMessage != undefined) {
                            if (this.previousMessage.state === MessageState.OFF) {
                                this.previousMessage = undefined
                            }
                        }else{
                            if (this.turnMessage) {
                                const random = Math.floor(Math.random()*this.messages.length)
                                const message       = this.messages[random]
                                const text = messagesContainer.createMessage(IconsPos.CHAT_TEXT_X[this.yPos < 500 ? 0 : 1], IconsPos.CHAT_TEXT_Y[this.yPos < 500 ? 0 : 1], message, MessageType.CHAT_MESSAGE, MessageState.APPEAR, 1.1, 0.5, 0.3,25, 100, 600, 17, "black");
                                this.previousMessage = text  
                                this.turnMessage = false
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
                            const text = messagesContainer.createMessage(IconsPos.CHAT_TEXT_X[this.yPos < 500 ? 0 : 1], IconsPos.CHAT_TEXT_Y[this.yPos < 500 ? 0 : 1], message, MessageType.CHAT_MESSAGE, MessageState.APPEAR, 1.5, 0.7, 0.3,25, 100, 600, 17, "black");
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
                        // console.log("selected");
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
                        this.state =
                            !mouse.leftClick    && !isAnyCardSelected[0] && mouse.previousStateLeft      ? CardId.SELECTED            : this.state
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

        }

        logic(){

        }

        setDeck(deck){
            this.deck = deck
        }
        deselect(){

            this.state = CardId.NOT_SELECTED;
        }
        render(ctx, language, heroTeams){
            ctx.fillStyle = "black"
            let xPos = this.xPos
            let yPos = this.yPos
                ctx.font = "25px LongaIberica-DEMO";
            let cardVFX
                //CARD IMAGE
                let size = this.size
                if (this.state === CardId.SCALED ) {
                    ctx.setTransform(1.6, 0, 0, 1.6, 0, 0);
                    xPos = 475
                    yPos = 140
                    size = CardId.BIG_SIZE
                    
                }else if(this.state === CardId.SELECTED){
                    cardVFX = this.imageVFX[VFXId.SELECTED][size]
                    ctx.drawImage(
                        cardVFX,                 //Img File
                        IconsPos.VFX_X[size] + xPos,IconsPos.VFX_Y[size] + yPos                    //X & Y Position Source
                        )
                }else if(this.state === CardId.HOVER){
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

                    if (size === BorderId.SMALL_SIZE){

                        ctx.drawImage(
                            this.imageHeroTeam[heroTeams],               
                            IconsPos.TEAM_X + xPos, IconsPos.TEAM_Y + yPos
                        )
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
                        ctx.drawImage(
                            this.chatBubble,               
                            xPos, yPos
                        )
                    }
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        static create(id, texts, image, rarity, category, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, effect, attributes, imageHeroTeam, chatBubble, messages, toolTip) {
            
            let durability;
            let cooldown;
            if (attributes != null) {
                durability = attributes.durability;
                cooldown = attributes.cooldown;

            }

            const mainCharacter = new MainCharacter(id, texts, image, rarity, category, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, effect, imageHeroTeam, chatBubble, messages, durability, cooldown, toolTip);
    
            return mainCharacter;
    
        }
    }