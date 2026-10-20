import Messages from "../../Messages.js";
import { BorderId, CardActions, CardId, CurseId, DecksId, DurabilityColors, IconsPos, MessageState, MessageType, ScreenSize, TurnStates, TypeNames, VFXId } from "../../constants.js";
import Card from "../Card.js";
import { drawEventSlotImage, eventFade, eventReadyGlow, eventSelectGlow } from "../eventSlotStyle.js";

export default class Curse extends Card{

    constructor(id, texts, image, rarity, category, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, imageVFX, effect, durability=0, cooldown=0, toolTip){

        super(id, texts, image, rarity, category, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, imageVFX, toolTip);

        // Card attributes 	   	
        this.durability = durability;
        this.previousDurability = durability
        this.cooldown   = cooldown; 	
        this.previousCooldown = cooldown 	
        this.effect     = effect;		
        this.turn       = null;
    }
    updateScale(mouse, decks, turnState){
        const isAnyCardScaled = this.deck.isAnyCard(decks, CardId.SCALED)
        if (!isAnyCardScaled[0] && turnState != TurnStates.INITIALIZE) {
            const isCollidingWithMouse = mouse.isCollidingWithCard(this)

            switch (this.state) {
                case CardId.NOT_SELECTED:

                    this.state = isCollidingWithMouse ? this.state = CardId.HOVER : CardId.NOT_SELECTED

                    break;

                case CardId.HOVER:
                    this.state = isCollidingWithMouse ? this.state = CardId.HOVER : CardId.NOT_SELECTED
                    this.state = !mouse.rightClick && mouse.previousStateRight ? CardId.SCALED : this.state
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
    
    update(mouse, decks, messagesContainer){
    
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

        if (messagesContainer != undefined){

            if (this.cooldown < this.previousCooldown && this.action === CardActions.COOLDOWN && this.cooldown === Math.floor(this.cooldown)){

                const message = new Messages(this.xPos, this.yPos, "-1", MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3, 50, "red");
                messagesContainer.addMessage(message);
            }
    
            if (this.durability < this.previousDurability && this.durability != null && this.durability === Math.floor(this.durability)){
    
                const message = new Messages(this.xPos, this.yPos, "-1", MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3, 50, "red");
                messagesContainer.addMessage(message);
            }
        }

        this.previousState = this.state
        this.curseLogic()
    }
    curseLogic(){
        switch (this.action) {
            case CardActions.COOLDOWN:
                this.action = this.cooldown <= 0 ? CardActions.READY : this.action
                break;
            
            case CardActions.READY:
                this.updateReady();
                break;

            case CardActions.ON_USE:
                if(this.durability <= 0 &&this.durability != null){
                    this.action = CardActions.WORN_OUT;
                }
                break;
            default:
                break;
        }
    }

    updateReady(){
        const id = this.id;

        switch(id){
            case CurseId.MOLOTOV_COCKTAIL:
                const turn = this.turn;
                const eventContainer = turn.eventContainer;
                const enemyHandDeck  = turn.enemyHandDeck;
                const card           = this;
                eventContainer.createHandDeckSpecialEventAndPush(card, enemyHandDeck);
                this.action = CardActions.ON_USE;
                break;
        }

    }

    setTurn(turn){
        this.turn = turn;
    }

    setDeck(deck){
        this.deck = deck
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
                }
            }  
        }
    }
    checkDurability(){
        if (this.durability <= 0 && this.durability != null) {
            this.action = CardActions.WORN_OUT
        }
    }
    deselect(){

        this.state = CardId.NOT_SELECTED;
    }

    restoreValues(){

        this.xPos = 2200;
        this.yPos = 1200;
        this.cooldown = this.previousCooldown;
        this.durability = this.previousDurability;
        this.action = this.previousAction;
        this.state = this.previousState;
        this.size = this.previousSize;
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
    
    render(ctx, language){

        ctx.fillStyle = "black"
        let xPos = this.xPos
        let yPos = this.yPos
        ctx.font = "25px LongaIberica-DEMO";
        let cardVFX
        const durabilityRender = this.state === CardId.SCALED ? this.previousDurability : this.durability
        const cooldownRender = this.state === CardId.SCALED ? this.previousCooldown : this.cooldown

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
                
            }else if(this.state === CardId.SELECTED && !this.isInEventSlot(size)){
                if (this.deck.deckId=== DecksId.PLAYER_1_HAND_DECK || this.deck.deckId === DecksId.PLAYER_2_HAND_DECK) {
                    yPos-=100 
                }
                cardVFX = this.imageVFX[VFXId.SELECTED][size]
                ctx.drawImage(
                    cardVFX,                 //Img File
                    IconsPos.VFX_X[size] + xPos,IconsPos.VFX_Y[size] + yPos                    //X & Y Position Source
                    )
            }else if(this.state === CardId.HOVER && !this.isInEventSlot(size)){
                if (this.deck.deckId=== DecksId.PLAYER_1_HAND_DECK || this.deck.deckId === DecksId.PLAYER_2_HAND_DECK) {
                    yPos-=100 
                }
                cardVFX = this.imageVFX[VFXId.HOVER][size]
                ctx.drawImage(
                    cardVFX,                 //Img File
                    IconsPos.VFX_X[size] + xPos,IconsPos.VFX_Y[size] + yPos                    //X & Y Position Source
                    )
            }
            if (this.deck.deckId === DecksId.PLAYER_1_PREPARING_EVENT_DECK || this.deck.deckId === DecksId.PLAYER_2_PREPARING_EVENT_DECK) {
                if (this.state != CardId.SCALED) {
                    size = CardId.EVENT_SIZE
                    drawEventSlotImage(ctx, this.image[CardId.BIG_SIZE], xPos, yPos)

                    if (this.state === CardId.SELECTED || this.state === CardId.HOVER) {
                        eventSelectGlow(ctx, xPos, yPos, this.state === CardId.SELECTED)
                    }
                }
                else {
                    ctx.drawImage(this.image[CardId.BIG_SIZE], xPos + IconsPos.IMAGE_X[size], yPos + IconsPos.IMAGE_Y[size])
                }
                    
                
            }else{
                
                ctx.drawImage(
                    this.image[size],                 //Img File
                    xPos + IconsPos.IMAGE_X[size],yPos + IconsPos.IMAGE_Y[size]                 //X & Y Position Source
                )
            }    

            if (size != CardId.EVENT_SIZE) {
                // BORDER
                ctx.drawImage(
                    this.imageBorders[size],
                    xPos, yPos)
                    if (this.state === CardId.SCALED) {
                        console.log(size);
                        
                    }
                //RARITY ICON
                ctx.drawImage(
                    this.imageRarity[size],
                    IconsPos.RARITY_X[size] +      xPos, IconsPos.RARITY_Y[size] + yPos)
                
            }
                
                    if (size === BorderId.NORMAL_SIZE) {
                        // ctx.font = "25px LongaIberica-DEMO";
                        // ctx.fillText(this.name[language], IconsPos.NAME_X + xPos, IconsPos.NAME_Y + yPos);
                        // ctx.font = "15px LongaIberica-DEMO";
                        // ctx.fillText(this.description[language], IconsPos.DESCRIPTION_X + xPos, IconsPos.DESCRIPTION_Y + yPos);
                        // ctx.font = "25px LongaIberica-DEMO";
                        this.texts.render(ctx, xPos, yPos, language);
                        //CATEGORY ICON
                        ctx.drawImage(
                            this.imageCategory,
                            IconsPos.CATEGORY_X + xPos, IconsPos.CATEGORY_Y + yPos)

                        let color = "white"
                        ctx.fillStyle = color
                        ctx.font = "bold 24px LongaIberica-DEMO";
    
                        ctx.drawImage(
                            this.imageAttributes[0],
                            IconsPos.FIRST_ICON_X[size] + xPos, IconsPos.FIRST_ICON_Y[size] + yPos)
        
                        ctx.fillText(Math.ceil(cooldownRender), IconsPos.FIRST_ICON_NUMBER_X[size] + xPos, IconsPos.FIRST_ICON_NUMBER_Y[size] + yPos);
                        ctx.strokeText(Math.ceil(cooldownRender), IconsPos.FIRST_ICON_NUMBER_X[size] + xPos, IconsPos.FIRST_ICON_NUMBER_Y[size] + yPos);
                
                        ctx.drawImage(
                            this.imageAttributes[1],
                            
                            IconsPos.FOURTH_ICON_X[size] + xPos, IconsPos.FOURTH_ICON_Y[size] + yPos)

                            if (this.durability != null){

                                ctx.fillText(Math.ceil(durabilityRender), IconsPos.FOURTH_ICON_NUMBER_X[size] + xPos, IconsPos.FOURTH_ICON_NUMBER_Y[size] + yPos);
                                ctx.strokeText(Math.ceil(durabilityRender), IconsPos.FOURTH_ICON_NUMBER_X[size] + xPos, IconsPos.FOURTH_ICON_NUMBER_Y[size] + yPos);
                            }
                            
                            else{

                                ctx.fillText("∞", IconsPos.FOURTH_ICON_NUMBER_X[size] + xPos, IconsPos.FOURTH_ICON_NUMBER_Y[size] + yPos);
                            }
                        }

                    if(size === CardId.EVENT_SIZE){
                    
                        if(this.cooldown >= 0.1){

                            eventFade(ctx, xPos, yPos);
                            

                            let color = "white"
                            ctx.fillStyle = color
                            ctx.font = "bold 24px LongaIberica-DEMO";

                            ctx.fillText(Math.ceil(cooldownRender), xPos + IconsPos.EVENT_CD_X, yPos + IconsPos.EVENT_CD_Y);
                            ctx.strokeText(Math.ceil(cooldownRender), IconsPos.EVENT_CD_X + xPos, IconsPos.EVENT_CD_Y + yPos);
                            ctx.drawImage(
                                this.imageAttributes[0],
                                IconsPos.EVENT_CD_IMAGE_X + xPos, IconsPos.EVENT_CD_IMAGE_Y + yPos);
                        }
                        
                        else{
    
                            eventFade(ctx, xPos, yPos);


                            eventReadyGlow(ctx, xPos, yPos, DurabilityColors.CURSE);
                            
                            let color = "white"
                            ctx.fillStyle = color
                            ctx.font = "bold 24px LongaIberica-DEMO";

                            if (this.durability != null){

                                ctx.fillText(Math.ceil(durabilityRender), xPos + IconsPos.EVENT_CD_X, yPos + IconsPos.EVENT_CD_Y);
                                ctx.strokeText(Math.ceil(durabilityRender), IconsPos.EVENT_CD_X + xPos, IconsPos.EVENT_CD_Y + yPos);
                            }
                            
                            else{

                                ctx.fillText("∞", xPos + IconsPos.EVENT_CD_X, yPos + IconsPos.EVENT_CD_Y);
                            }

                            ctx.drawImage(
                                this.imageAttributes[1],
                                IconsPos.EVENT_CD_IMAGE_X + xPos, IconsPos.EVENT_CD_IMAGE_Y + yPos);
                        }
                        ctx.font = "bold 12px LongaIberica-DEMO";
                        const eventState = this.checkState()
                        ctx.fillText(eventState[language], xPos + IconsPos.EVENT_STATE_X, yPos + IconsPos.EVENT_STATE_Y);
                    }

            } else {
                ctx.drawImage(
                    this.imageReverse,
                    xPos, yPos)
            }
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                if (this.state === CardId.HOVER) {
                    return true
                } else {
                    return false
                }
            
    }
    checkState(){

        switch (this.action){

            case CardActions.COOLDOWN:
                return ["NOT READY","PREST EZ"];
            
            case CardActions.READY:
                return ["READY", "PREST"];

            case CardActions.ON_USE:
                return ["APPLIED", "ERABILITA"];

            default:
                break;
        }
    }
    // renderToolTip(xPos, yPos, language, ctx){
    //     ctx.fillStyle = '#d59d00'
    //     ctx.fillRect(xPos, yPos, 178, 63 ) 

    //     ctx.fillStyle = '#362315'
    //     ctx.fillRect(xPos + 3, yPos + 3, 172, 57 ) 
    //     ctx.fillStyle = 'white'

    //     ctx.font ="15px LongaIberica-DEMO"
    //     ctx.fillText('Name: ', xPos+35, yPos+20)
    //     this.texts.texts[1].render(ctx, xPos-5, yPos-217, language) 

    //     ctx.fillText('Type:', xPos+36, yPos+40)
    //     ctx.fillText(TypeNames[this.category], xPos+115, yPos+40)
        
    // }

    checkTooltip(){
        if(this.state === CardId.HOVER){
            
            return true;
        }else{
            this.toolTip.timer.restart();
            return false;
        }
    }

    checkIconColor(stat, previousStat) {
        if (stat < previousStat) {
            return "red"
        } else if (stat > previousStat) {
            return "green"
        } else {
            return "white"
        }
    }
    static create(id, texts, image, rarity, type, xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, effect, toolTip){
        
        let durability = attributes[0].attribute_value;
        let cooldown = attributes[1].attribute_value;
        
        const curse = new Curse(id, texts, image, rarity, type, "Ranged", xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, effect, durability, cooldown, toolTip);

        return curse

    }
}