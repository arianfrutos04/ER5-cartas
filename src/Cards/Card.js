
import Mouse from "../Mouse.js";
import { CardActions, CardId, DecksId, TypeId } from "../constants.js";
export default class Card{

    constructor(id, texts, image, rarity, category, type = "Melee", xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse,imageVFX, toolTip){

        this.id             = id;
        // this.name           = name;
        // this.description    = description;
        this.texts          = texts;
        this.image          = image;
        this.imageRarity    = imageRarity
        this.imageAttributes = imageAttributes
        this.imageBorders   = imageBorders
        this.imageCategory  = imageCategory
        this.imageReverse   = imageReverse
        this.imageVFX       = imageVFX
        this.rarity         = rarity;
        this.category       = category;
        this.type           = type; 
        this.xPos           = xPos;
        this.yPos           = yPos;
        this.toolTip        = toolTip;
        this.size           = CardId.BIG_SIZE;
        this.previousSize   = CardId.BIG_SIZE;
        this.state          = CardId.NOT_SELECTED;
        this.previousState  = CardId.NOT_SELECTED;
        this.action         = CardActions.DEFAULT;
        this.previousAction = CardActions.DEFAULT;
        this.deck
        // this.objective      = objective;
    }
    isInEventSlot(size){

        return size === CardId.EVENT_SIZE && this.deck.deckId !== DecksId.PLAYER_1_HAND_DECK && this.deck.deckId !== DecksId.PLAYER_2_HAND_DECK;
    }

    updateScale(mouse, decks){
        
    }
    update(mouse, decks){

    }
    render(){
        
    }
}
