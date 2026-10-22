import { CardActions, CardId, IconsPos, BorderId, TurnId, RarityId, IconsId, VFXId, StatsId, DecksId, TypeNames, TurnStates, MessageState, MessageType } from "../../constants.js";
import Card from "../Card.js";
import Messages from "../../Messages.js";
export default class Minion extends Card {

    constructor(id, texts, image, rarity, category, type, xPos, yPos,imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, imageVFX, weaponRarityImage, armorRarityImage, attack, defense, health, speed, imageMinionTeam, chatBubble, messages, toolTip) {

        super(id, texts, image, rarity, category, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, imageVFX, toolTip);

        // Card attributes   
        this.attack                 = attack;
        this.previousAttack         = attack;
        this.defense                = defense;
        this.previousDefense        = defense;
        this.health                 = health;
        this.previousHealth         = health;
        this.speed                  = speed;
        this.previousSpeed          = speed;
        this.range                  = 1;
        this.criticModifier         = 1;
        this.previousCriticModifier = 1;
        this.failModifier           = 1;
        this.previousFailModifier   = 1;
        this.weapon                 = undefined;
        this.armor                  = undefined;
        this.weaponRarityImage      = weaponRarityImage;
        this.armorRarityImage       = armorRarityImage;
        this.imageMinionTeam        = imageMinionTeam;
        this.chatBubble             = chatBubble
        this.messages               = messages
        this.previousMessage        = undefined
    }
    updateScale(mouse, decks, turnState, messagesContainer, language){
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
    
    update(mouse, decks) {
            
        const isAnyCardScaled   = this.deck.isAnyCard(decks, CardId.SCALED)
        const isAnyCardSelected = this.deck.isAnyCard(decks, CardId.SELECTED)

        if (!isAnyCardScaled[0] && this.action != CardActions.STUNNED) {
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
        this.minionLogic()
    }

    minionLogic() {
        if (this.state === CardId.DEAD) {
            this.xPos = 2200;
            this.yPos = 1200;
            const index = this.deck.cards.indexOf(this)
            this.deck.cards.splice(index, 1)
            this.deck = undefined
            if (this.weapon) {
                this.weapon.action = CardActions.READY
            }
            if (this.armor) {
                this.armor.action = CardActions.READY
            }
        }
    }

    setWeapon(weapon){

        this.weapon = weapon
    }

    setArmor(armor){
        this.armor = armor
    }

    setDeck(deck){
        this.deck = deck
    }

    assignMinionToBoardGrid(boardGrid, turn){

        const boardYPos = 4;
        let aviablePositions = [];
        
        for (let i = 0; i < boardGrid.slots[boardYPos].length; i++){

            const slot = boardGrid.slots[boardYPos][i];

            if (slot.isEmpty){

                aviablePositions.push(i);
            }
        }

        const randomXPos = aviablePositions[Math.floor(Math.random() * aviablePositions.length)];
        console.log(randomXPos, aviablePositions);
        
        this.xPos = boardGrid.slots[boardYPos][randomXPos].xPos;
        this.yPos = boardGrid.slots[boardYPos][randomXPos].yPos;
        this.size = BorderId.SMALL_SIZE;
        boardGrid.slots[boardYPos][randomXPos].isEmpty = false
    }

    restoreMinionsStats(){
        
        this.health = this.previousHealth;
        this.defense = this.previousDefense;
        this.attack = this.previousAttack;
        this.speed = this.previousSpeed;
        this.criticModifier = this.previousCriticModifier;
        this.failModifier = this.previousFailModifier;
    }

    deselect(){

        this.state = CardId.NOT_SELECTED;
    }

    render(ctx, language, minionsTeam){
        ctx.fillStyle = "black"
        let xPos = this.xPos
        let yPos = this.yPos
            ctx.font = "25px LongaIberica-DEMO";
        let cardVFX

        let attackRender
        let defenseRender

        if (this.weapon != undefined){

            attackRender = this.state === CardId.SCALED ? this.previousAttack : this.attack + this.weapon.attack
        }

        else{

            attackRender = this.state === CardId.SCALED ? this.previousAttack : this.attack
        }

        if (this.armor != undefined){

            defenseRender = this.state === CardId.SCALED ? this.previousDefense : this.defense + this.armor.defense
        }

        else{

            defenseRender = this.state === CardId.SCALED ? this.previousDefense : this.defense
        }

        const healthRender = this.state === CardId.SCALED ? this.previousHealth : this.health
        const speedRender = this.state === CardId.SCALED ? this.previousSpeed : this.speed

        this.setSwapTransform(ctx);

            //CARD IMAGE
            let size = this.size
            if (this.state === CardId.SCALED ) {
                ctx.setTransform(1.6, 0, 0, 1.6, 0, 0);
                xPos = 475
                yPos = 140
                size = CardId.BIG_SIZE
                
            }else if(this.state === CardId.SELECTED && this.action != CardActions.STUNNED){
                cardVFX = this.imageVFX[VFXId.SELECTED][size]
                ctx.drawImage(
                    cardVFX,                 //Img File
                    IconsPos.VFX_X[size] + xPos,IconsPos.VFX_Y[size] + yPos                    //X & Y Position Source
                    )
            }else if(this.state === CardId.HOVER && this.action != CardActions.STUNNED){
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
                        // ctx.font = "25px LongaIberica-DEMO";
                        // ctx.fillText(this.name[language], IconsPos.NAME_X + xPos, IconsPos.NAME_Y + yPos);
                        // ctx.font = "15px LongaIberica-DEMO";
                        // ctx.fillText(this.description[language], IconsPos.DESCRIPTION_X + xPos, IconsPos.DESCRIPTION_Y + yPos);
                        // ctx.font = "25px LongaIberica-DEMO";
                        this.texts.render(ctx, xPos, yPos, language);
                        
                        //CATEGORY ICON
                        ctx.drawImage(
                            this.imageCategory,
                            IconsPos.CATEGORY_X + xPos, IconsPos.CATEGORY_Y + yPos);

                            
                        }
                        //ATTRIBUTES ICONS & VALUES
                
                let color = this.checkIconColor(defenseRender, this.previousDefense)
                ctx.fillStyle = color
                ctx.font = "bold 24px LongaIberica-DEMO";
                ctx.drawImage(
                    this.imageAttributes[0],
                    IconsPos.FIRST_ICON_X[size] + xPos, IconsPos.FIRST_ICON_Y[size] + yPos)

                ctx.fillText(defenseRender, IconsPos.FIRST_ICON_NUMBER_X[size] + xPos, IconsPos.FIRST_ICON_NUMBER_Y[size] + yPos);
                ctx.strokeText(defenseRender, IconsPos.FIRST_ICON_NUMBER_X[size] + xPos, IconsPos.FIRST_ICON_NUMBER_Y[size] + yPos);
                
                color = this.checkIconColor(this.speed, this.previousSpeed)
                ctx.fillStyle = color
                ctx.drawImage(
                    this.imageAttributes[1],
                    IconsPos.SECOND_ICON_X[size] + xPos, IconsPos.SECOND_ICON_Y[size] + yPos)
                ctx.fillText(speedRender, IconsPos.SECOND_ICON_NUMBER_X[size] + xPos, IconsPos.SECOND_ICON_NUMBER_Y[size] + yPos);
                ctx.strokeText(speedRender, IconsPos.SECOND_ICON_NUMBER_X[size] + xPos, IconsPos.SECOND_ICON_NUMBER_Y[size] + yPos);
                
                color = this.checkIconColor(this.health, this.previousHealth)
                ctx.fillStyle = color
                ctx.drawImage(
                    this.imageAttributes[2],
                    IconsPos.THIRD_ICON_X[size] + xPos, IconsPos.THIRD_ICON_Y[size] + yPos)
                ctx.fillText(healthRender, IconsPos.THIRD_ICON_NUMBER_X[size] + xPos, IconsPos.THIRD_ICON_NUMBER_Y[size] + yPos);
                ctx.strokeText(healthRender, IconsPos.THIRD_ICON_NUMBER_X[size] + xPos, IconsPos.THIRD_ICON_NUMBER_Y[size] + yPos);
                
                color = this.checkIconColor(attackRender, this.previousAttack)
                ctx.fillStyle = color
                ctx.drawImage(
                    this.imageAttributes[3],
                    IconsPos.FOURTH_ICON_X[size] + xPos, IconsPos.FOURTH_ICON_Y[size] + yPos)
                ctx.fillText(attackRender, IconsPos.FOURTH_ICON_NUMBER_X[size] + xPos, IconsPos.FOURTH_ICON_NUMBER_Y[size] + yPos);
                ctx.strokeText(attackRender, IconsPos.FOURTH_ICON_NUMBER_X[size] + xPos, IconsPos.FOURTH_ICON_NUMBER_Y[size] + yPos);
                ctx.fillStyle = "#black"    
            
            
            
                //RARITY ICON
            ctx.drawImage(
                
                this.imageRarity[size],
                IconsPos.RARITY_X[size] + xPos, IconsPos.RARITY_Y[size] + yPos)
                
        

                //WEAPON RARITY
                let equipRarityImg
                    if (this.weapon != undefined) {
                        equipRarityImg = this.weaponRarityImage[size][this.weapon.rarity]
                    } else {
                        equipRarityImg = this.weaponRarityImage[size][RarityId.NONE]
                    }
                ctx.drawImage(
                    equipRarityImg,
                    IconsPos.WEAPON_X[size] + xPos, IconsPos.WEAPON_Y[size] + yPos)

                //WEAPON RARITY
                    if (this.armor != undefined) {
                        equipRarityImg = this.armorRarityImage[size][this.armor.rarity]
                    } else {
                        equipRarityImg = this.armorRarityImage[size][RarityId.NONE]
                    }
                ctx.drawImage(
                    equipRarityImg,
                    IconsPos.ARMOR_X[size] + xPos, IconsPos.ARMOR_Y[size] + yPos)
                
                if (size === BorderId.SMALL_SIZE){

                    ctx.drawImage(
                        this.imageMinionTeam[minionsTeam],               
                        IconsPos.TEAM_X + xPos, IconsPos.TEAM_Y + yPos
                    )
                }else if (size === BorderId.NORMAL_SIZE) {
                    ctx.drawImage(
                        this.imageAttributes[4],
                        IconsPos.WEAPON_X[size] + xPos, IconsPos.WEAPON_Y[size] + yPos)
                        
                        ctx.drawImage(
                            this.imageAttributes[5],
                            IconsPos.ARMOR_X[size] + xPos, IconsPos.ARMOR_Y[size] + yPos)
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
    if (this.state === CardId.SCALED) {
        return "white"
    }else{
        if (stat < previousStat) {
            return "red"
        } else if (stat > previousStat) {
            return "green"
        } else {
            return "white"
        }
    }
}
    static create(id, texts, image, rarity, category, type, xPos, yPos,imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, weaponRarityImage, armorRarityImage, attributes, imageMinionTeam, chatBubble, messages, toolTip){
    
            let hp      = attributes[StatsId.LIFE]
            let defense = attributes[StatsId.DEFENSE]
            let attack  = attributes[StatsId.DAMAGE]
            let speed   = attributes[StatsId.SPEED]
    
            const minion = new Minion(id, texts, image, rarity, category, type, xPos, yPos,imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, weaponRarityImage, armorRarityImage, attack, defense, hp, speed, imageMinionTeam, chatBubble, messages, toolTip);
    
            return minion
    
    }
}

