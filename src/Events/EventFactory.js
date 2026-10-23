import { BuffId, CardActions, CurseId, DecksId, EventsId, IconsPos, MainCharacterId, MessageState, MessageType, StatsId, TypeId } from "../constants.js";
import { CooldownEvent } from "./temp_events/CooldownEvent.js";
import { DurabilityEvent } from "./temp_events/DurabilityEvent.js";
import { ModifyAttributeEvent } from "./temp_events/ModifyAttributesEvent.js";
import { EquipEvent } from "./temp_events/EquipEvent.js";
import { DestroyAllMinionsEvent } from "./phase_events/DestroyAllMinionsEvent.js";
import { ModifyAttributeToAllMinions } from "./temp_events/ModifyAttributeToAllMinions.js";
import { DestroyAllEvents } from "./phase_events/DestroyAllEvents.js";
import LucretiaEvent from "./temp_events/LucretiaEvent.js";
import XGScholarEvent from "./temp_events/XGScholarEvent.js";
import HeroEvents from "./temp_events/HeroEvents.js";
import DecrepitTrhoneEvent from "./temp_events/DecrepitThroneEvent.js";
import AngeloDiMortisEvent from "./temp_events/AngeloDiMortisEvent.js";
import IncreaseActionEvent from "./temp_events/IncreaseActionEvent.js";
import MolotovCokctailEvent from "./temp_events/MolotovCocktailEvent.js";
import DeceptionEvent from "./temp_events/DeceptionEvent.js";
import Messages from "../Messages.js";

export default class EventFactory {

    constructor() {

    }

    static createCooldownEvent(card){
        
        switch (card.category) {
            case TypeId.BUFF:
            case TypeId.CURSE:
            case TypeId.SPELL:
            case TypeId.ARMOR:
            case TypeId.WEAPON:
                return new CooldownEvent (EventsId.COOLDOWN, card, card.cooldown)
        
            default:
                break;
        }
    }

    static createDurabilityEvent(card){

        if (card.action != CardActions.ON_USE){

            switch (card.category) {
                case TypeId.BUFF:
                case TypeId.CURSE:
                case TypeId.SPELL:
                case TypeId.JOSEPH:
                    return new DurabilityEvent (card);
            
                default:
                    break;
            }
        }
    }

    static createCommonEvent(card, objectiveMinion, messagesContainer){

        if (card.action === CardActions.READY && card.action != CardActions.ON_USE){

            const result = [];
            let length;

            if (card.effect === undefined){
                
                length = 1;
            }

            else{

                length = card.effect.length;
            }
            
            for (let i = 0; i < length; i++){
                
                switch (card.category){
                    case TypeId.BUFF:
                        const buff = new ModifyAttributeEvent(objectiveMinion, card.effect[i].common_effect_attribute, card.effect[i].common_effect_value, card.effect[i].modifier, card);
                        buff.execute();
                        result.push(buff);
                        break;
                    case TypeId.CURSE:
                        const curse = new ModifyAttributeEvent(objectiveMinion, card.effect[i].common_effect_attribute, card.effect[i].common_effect_value, card.effect[i].modifier, card);
                        curse.execute();
                        result.push(curse);
                        break;
                    case TypeId.SPELL:
                        const spell = new ModifyAttributeEvent(objectiveMinion, card.effect[i].common_effect_attribute, card.effect[i].common_effect_value, card.effect[i].modifier, card);
                        spell.execute();
                        break;
                    case TypeId.ARMOR:
                        const armor = new EquipEvent(card, objectiveMinion);
                        armor.execute();
                        break;
                    case TypeId.WEAPON:
                        const weapon = new EquipEvent(card, objectiveMinion);
                        weapon.execute();
                        break;
                    default:
                        break;
                }
            }
            return result;
        }
    }

    static createDestroyAllMinionsEvent(decks, card){
        return new DestroyAllMinionsEvent(decks, card)
    }
    static createDestroyAllEvents(decks, card){
        return new DestroyAllEvents(decks, card)
    }
    static createModifyAttributeToAllMinions(decks, card){
        return new ModifyAttributeToAllMinions(decks, card)
    }

    static createIncreaseActionEvent(turn, card, value){
        const action = new IncreaseActionEvent(turn, card, value)
        return action
    }
    static createModifyAttributeEvent(card, objectiveMinion){
        const length = card.effect != undefined ? card.effect.length : 1;
        for (let i = 0; i < length; i++) {

            const joseph = new ModifyAttributeEvent(objectiveMinion, card.effect[i].common_effect_attribute, card.effect[i].common_effect_value, card.effect[i].modifier, card);
            joseph.execute()
        }
    }

    static createHeroEventAndExecute(hero, objectiveMinion, enemyActiveMinionDeck, activeMinionDeck, turn, minion){
        switch(hero.id){
            case MainCharacterId.LUCRETIA:
                for(let i = 0; i < hero.effect.length; i++){

                    const heroEvent = new LucretiaEvent(objectiveMinion, hero.effect[i].common_effect_attribute, hero.effect[i].common_effect_value);
                    heroEvent.execute();
                }
                break;
                
            case MainCharacterId.X_G_SCHOLAR:
                for(let i = 0; i < hero.effect.length; i++){
                    const heroEvent = new XGScholarEvent(objectiveMinion, hero.effect[i].common_effect_attribute, hero.effect[i].common_effect_value);
                    heroEvent.execute();
                }
                break;

            case MainCharacterId.DECREPIT_TRHONE:

                const decrepitEvent = new DecrepitTrhoneEvent(minion, enemyActiveMinionDeck, activeMinionDeck);
                decrepitEvent.execute();
                break;
            
            case MainCharacterId.ANGELO:
            
                const angeloEvent = new AngeloDiMortisEvent(turn);
                angeloEvent.execute();
                break;
        }
    }

    static createHeroEventsToUseInEventContainer(activeMinionDeck, enemyActiveMinionDeck, hero, card, turn){
        return new HeroEvents(activeMinionDeck, enemyActiveMinionDeck, hero, card, turn);
    }

    static createHandDeckSpecialEvents(card, enemyHandeck, handDeck){
        const id = card.id;

        switch(id){

            case CurseId.MOLOTOV_COCKTAIL:
                return new MolotovCokctailEvent(card, enemyHandeck);
                break;

            case BuffId.DECEPTION:
                return new DeceptionEvent(card, handDeck, enemyHandeck);
                break;
        }
    }
}