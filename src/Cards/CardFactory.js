import Armor from "./cards_category/Armor.js";
import Buff from "./cards_category/Buff.js";
import Curse from "./cards_category/Curse.js";
import Joseph from "./cards_category/Joseph.js";
import MainCharacter from "./cards_category/MainCharacter.js";
import Minion from "./cards_category/Minion.js";
import Spell from "./cards_category/Spell.js";
import Weapon from "./cards_category/Weapon.js";
import TextContainer from "../TextContainer.js";
import { BorderId, CardId, CardImageId, ChatMessages, IconsId, ImageTypes, StatsId, TypeId } from "../constants.js";
import Tooltip from "../Tooltip.js";
import Timer from "../Timer.js";



export default class CardFactory {

    constructor(cardData, images) {
        this.cardData = cardData;
        this.images   = images
        this.cards    = []
    }


    createCards(language) {
        let card

        for (let i = 0; i < this.cardData.length; i++) {
            const id = this.cardData[i].card_id;
            const texts  = TextContainer.createCardText(this.cardData[i]);

            const rarity = this.setRarity(this.cardData[i].rarity)
            const category = this.cardData[i].category
            const type = this.cardData[i].type;
            const image = [this.images[ImageTypes.CARD_IMAGE][CardId.BIG_SIZE][id-1], this.images[ImageTypes.CARD_IMAGE][CardId.SMALL_SIZE][id-1] ]
            const imageRarity = [this.images[ImageTypes.CARD_RARITY][rarity], this.images[ImageTypes.CARD_RARITY][rarity + this.images[ImageTypes.CARD_RARITY].length / 2]]
            const imageBorders = [this.images[ImageTypes.CARD_BORDER][CardId.BIG_SIZE], this.images[ImageTypes.CARD_BORDER][CardId.SMALL_SIZE]]
            const imageReverse = this.images[ImageTypes.CARD_BORDER][BorderId.REVERSE]
            const chatBubbleImage = this.images[ImageTypes.CHAT_BUBBLE][0]
            let messages
            const vfx = [[this.images[ImageTypes.CARD_BORDER][BorderId.SELECTED], this.images[ImageTypes.CARD_BORDER][BorderId.MINI_SELECTED], this.images[ImageTypes.CARD_BORDER][BorderId.EVENT_SELECTED]], 
                        [this.images[ImageTypes.CARD_BORDER][BorderId.HOVER]   , this.images[ImageTypes.CARD_BORDER][BorderId.MINI_HOVER]   , this.images[ImageTypes.CARD_BORDER][BorderId.EVENT_HOVER]]]
            
            const images = this.images[ImageTypes.EQUIP_RARITY]
            let normalSize = []
            let smallSize = []
            for (let i = 0; i < 5; i++) {
                normalSize.push(images[i]);
                smallSize.push(images[i+5])
                
            }
            const weaponRarityImage = [normalSize, smallSize]

            const armorRarityImage = [normalSize, smallSize]
            let imageCategory 
            let imageAttributes
            let imageTeam

            // HAY QUE AÑADIR EL TYPE AL CONSTRUCTOR DE  LAS CARTAS
            const quantity = this.cardData[i].quantity
            const xPos = 2200;
            const yPos = 1200;
            const attributes = this.cardData[i].attributes;
            const effects = this.cardData[i].common_effect;
            switch (category) {
                case "Armor_card":
                    imageAttributes = [this.images[ImageTypes.CARD_ICONS][IconsId.COOLDOWN], this.images[ImageTypes.CARD_ICONS][IconsId.DURABILITY], this.images[ImageTypes.CARD_ICONS][IconsId.DEFENSE], this.images[ImageTypes.CARD_ICONS][IconsId.DAMAGE]]
                    imageCategory = this.images[ImageTypes.CARD_TYPE][TypeId.ARMOR]

                    for (let i = 0; i < quantity; i++) {
                        let toolTipTImer = Timer.createTooltip();
                        let toolTip = new Tooltip(TypeId.ARMOR, texts, toolTipTImer);
                        card = this.createArmor(id, texts, image, rarity, TypeId.ARMOR, xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, toolTip);
                        this.cards.push(card)

                    }
                    break;

                case "Empowerment_card":
                    imageAttributes = [this.images[ImageTypes.CARD_ICONS][IconsId.COOLDOWN], this.images[ImageTypes.CARD_ICONS][IconsId.DURABILITY], this.images[ImageTypes.CARD_ICONS][IconsId.DEFENSE], this.images[ImageTypes.CARD_ICONS][IconsId.DAMAGE]]
                    imageCategory = this.images[ImageTypes.CARD_TYPE][TypeId.BUFF];

                    for (let i = 0; i < quantity; i++) {
                        let toolTipTImer = Timer.createTooltip();
                        let toolTip = new Tooltip(TypeId.BUFF, texts, toolTipTImer);

                        // card = this.createBuff(id, texts, image, rarity, TypeId.BUFF, xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse);
                        card = Buff.create(id, texts, image, rarity, TypeId.BUFF, xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, effects, toolTip);
                        this.cards.push(card)
                    }
                    break;

                case "Curse_card":
                    imageAttributes = [this.images[ImageTypes.CARD_ICONS][IconsId.COOLDOWN], this.images[ImageTypes.CARD_ICONS][IconsId.DURABILITY], this.images[ImageTypes.CARD_ICONS][IconsId.DEFENSE], this.images[ImageTypes.CARD_ICONS][IconsId.DAMAGE]]
                    imageCategory = this.images[ImageTypes.CARD_TYPE][TypeId.CURSE]
                    

                    for (let i = 0; i < quantity; i++) {
                        let toolTipTImer = Timer.createTooltip();
                        let toolTip = new Tooltip(TypeId.CURSE, texts, toolTipTImer);

                        // card = this.createCurse(id, texts, image, rarity, TypeId.CURSE, xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse);
                        card = Curse.create(id, texts, image, rarity, TypeId.CURSE, xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, effects, toolTip);
                        this.cards.push(card)
                    }
                    break;

                case "Joseph_card":
                    imageCategory = this.images[ImageTypes.CARD_TYPE][TypeId.JOSEPH];
                    messages = this.selectMessages(id);

                    for (let i = 0; i < quantity; i++) {
                        let toolTipTImer = Timer.createTooltip();
                        let toolTip = new Tooltip(TypeId.JOSEPH, texts, toolTipTImer);

                        // card = this.createJoseph(id, texts, image, rarity, TypeId.JOSEPH, type, xPos, yPos, effects, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse);
                        card = Joseph.create(id, texts, image, rarity, TypeId.JOSEPH, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, effects, attributes, chatBubbleImage, messages, toolTip);
                        this.cards.push(card)

                    }
                    break;

                case "Hero_card":
                    messages = this.selectMessages(id);
                    imageCategory = this.images[ImageTypes.CARD_TYPE][TypeId.HERO];
                    imageTeam = this.images[ImageTypes.TEAM];

                    for (let i = 0; i < quantity; i++) {
                        let toolTipTImer = Timer.createTooltip();
                        let toolTip = new Tooltip(TypeId.HERO, texts, toolTipTImer);

                        // card = this.createMainCharacter(id, texts, image, rarity, TypeId.HERO, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, effects)
                        card = MainCharacter.create(id, texts, image, rarity, TypeId.HERO, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, effects, attributes, imageTeam, chatBubbleImage,messages, toolTip);
                        card.size = CardId.SMALL_SIZE
                        this.cards.push(card)
                    }
                    break;

                case "Minion_card":
                    messages = this.selectMessages(id)
                    imageAttributes = [this.images[ImageTypes.CARD_ICONS][IconsId.DEFENSE], this.images[ImageTypes.CARD_ICONS][IconsId.SPEED], this.images[ImageTypes.CARD_ICONS][IconsId.LIFE], this.images[ImageTypes.CARD_ICONS][IconsId.DAMAGE], this.images[ImageTypes.CARD_ICONS][IconsId.WEAPON], this.images[ImageTypes.CARD_ICONS][IconsId.ARMOR]];
                    imageCategory = this.images[ImageTypes.CARD_TYPE][TypeId.MINION];
                    imageTeam = this.images[ImageTypes.TEAM];

                    for (let i = 0; i < quantity; i++) {
                        let toolTipTImer = Timer.createTooltip();
                        let toolTip = new Tooltip(TypeId.MINION, texts, toolTipTImer);

                        card = this.createMinion(id, texts, image, rarity, TypeId.MINION,"Melee", xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, weaponRarityImage, armorRarityImage, imageTeam, chatBubbleImage, messages, toolTip);
                        this.cards.push(card)
                    }
                    break;

                case "Spell_card":
                    imageAttributes = [this.images[ImageTypes.CARD_ICONS][IconsId.COOLDOWN], this.images[ImageTypes.CARD_ICONS][IconsId.DURABILITY], this.images[ImageTypes.CARD_ICONS][IconsId.DEFENSE], this.images[ImageTypes.CARD_ICONS][IconsId.DAMAGE]]
                    imageCategory = this.images[ImageTypes.CARD_TYPE][TypeId.SPELL];

                    for (let i = 0; i < quantity; i++) {
                        let toolTipTImer = Timer.createTooltip();
                        let toolTip = new Tooltip(TypeId.SPELL, texts, toolTipTImer);

                        // card = this.createSpell(id, texts, image, rarity, TypeId.SPELL, type, xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse);
                        card = Spell.create(id, texts, image, rarity, TypeId.SPELL, type, xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, effects, toolTip);
                        this.cards.push(card)
                    }
                    break;

                case "Weapon_card":
                    imageAttributes = [this.images[ImageTypes.CARD_ICONS][IconsId.COOLDOWN], this.images[ImageTypes.CARD_ICONS][IconsId.DURABILITY], this.images[ImageTypes.CARD_ICONS][IconsId.DEFENSE], this.images[ImageTypes.CARD_ICONS][IconsId.DAMAGE]]
                    imageCategory = this.images[ImageTypes.CARD_TYPE][TypeId.WEAPON];

                    for (let i = 0; i < quantity; i++) {
                        let toolTipTImer = Timer.createTooltip();
                        let toolTip = new Tooltip(TypeId.WEAPON, texts, toolTipTImer);

                        card = this.createWeapon(id, texts, image, rarity, TypeId.WEAPON, type, xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, toolTip);
                        this.cards.push(card)
                    }
                    break;

                default:
                    break;
            }



        }


    }
    selectMessages(id){
        switch (id) {
            case CardImageId.LUCRETIA:
                return ChatMessages.LUCRETIA

            case CardImageId.XG:
                return ChatMessages.XG

            case CardImageId.ANGELO:
                return ChatMessages.ANGELO

            case CardImageId.THRONE:
                return ChatMessages.THRONE

            case CardImageId.JOSEPH:
                return ChatMessages.JOSEPH

            default:
                return ChatMessages.MINION
        }
    }
    setRarity(rarity) {
        switch (rarity) {
            case 'Common':
                return 0
                break;
            case 'Rare':
                return 1
                break;
            case 'Epic':
                return 2
                break;
            case 'Legendary':
                return 3
                break;

            default:
                return -1
                break;
        }
    }

    createMinion(id, texts, image, rarity, category, type, xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, weaponRarityImage, armorRarityImage, imageMinionTeam, chatBubble, messages, toolTip) {


        attributes = this.setAttributeValues(attributes);

        const minion = Minion.create(id, texts, image, rarity, category, type, xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, weaponRarityImage, armorRarityImage, attributes, imageMinionTeam, chatBubble, messages, toolTip);

        return minion

    }


    createArmor(id, texts, image, rarity, type, xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, toolTip) {

        attributes = this.setAttributeValues(attributes)
        
        const armor = Armor.create(id, texts, image, rarity, type, xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, toolTip);

        return armor

    }

 

    createWeapon(id, texts, image, rarity, category, type, xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, toolTip) {

        attributes = this.setAttributeValues(attributes)

        const weapon = Weapon.create(id, texts, image, rarity, category, type, xPos, yPos, attributes, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse, vfx, toolTip);
        
        return weapon;
    }

    setAttributeValues(attributesArray) {
        let attributesResult = []
        for (let i = 0; i < attributesArray.length; i++) {
            let attribute = attributesArray[i];
            
            if (!attribute) {
                
                
            }
            switch (attribute.attribute_id - 1) {
                case StatsId.DEFENSE:
                
                    attributesResult[StatsId.DEFENSE] = attribute.attribute_value
                    break;

                case StatsId.DAMAGE:
                    attributesResult[StatsId.DAMAGE] = attribute.attribute_value
                    break;

                case StatsId.LIFE:
                    attributesResult[StatsId.LIFE] = attribute.attribute_value
                    break;

                case StatsId.SPEED:
                    attributesResult[StatsId.SPEED] = attribute.attribute_value
                    break;
                case StatsId.RANGE:
                    attributesResult[StatsId.RANGE] = attribute.attribute_value
                    break;
                case StatsId.DURABILITY:
                    attributesResult[StatsId.DURABILITY] = attribute.attribute_value
                    break;
                case StatsId.COOLDOWN:
                    attributesResult[StatsId.COOLDOWN] = attribute.attribute_value
                    break;

                default:

                    break;
            }
        }
        return attributesResult
    }


}