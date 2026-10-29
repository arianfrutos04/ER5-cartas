import { CardActions, CardId } from "../../constants.js";
import Event from "../Event.js";

export class ModifyAttributeEvent extends Event{

    constructor(objetive, attribute, value, modifier, card){
        super()
        this.objetive   = objetive;
        this.attribute  = attribute;
        this.value      = value;
        this.modifier   = modifier;
        this.card       = card;
    }

    execute(){

        if(this.card != undefined && this.objetive.state != CardId.DEAD){

            this.card.action = CardActions.ON_USE;

            if (this.card.durability <= 0 && this.card.durability != null){

                this.objetive.action = CardActions.DEFAULT;
                return true;
            }

            switch (this.attribute){
                case "Attack":
                    this.modifyMinionStat("attack");
                    break;
                case "Defense":
                    this.modifyMinionStat("defense");
                    break;
                case "Health":
                    this.modifyMinionStat("health");
                    break;
                case "Speed":
                    this.modifyMinionStat("speed");
                    break;
                case "Critic_modifier":
                    this.objetive.criticModifier = this.modifyTheStat(this.objetive.criticModifier, this.value);
                    break;
                case "Fail_modifier":
                    this.objetive.failModifier = this.modifyTheStat(this.objetive.failModifier, this.value);
                    break;
                case "Card_state":
                    this.objetive.action = this.value;
                default:
                    break;
            }

            return false;
        }

        else{

            this.card.action = CardActions.WORN_OUT;
            return true;
        }
    }

    // Con valor 0 la estadistica se queda a 0; si no, se le aplica la operacion. El minimo lo pone el esbirro
    modifyMinionStat(stat){

        const value = this.value === 0 ? 0 : Math.ceil(this.modifyTheStat(this.objetive.getRawStat(stat), this.value));

        this.objetive.setRawStat(stat, value);
    }

    modifyTheStat(stat, value){
        
        let result = value;

        switch (this.modifier){

            case "+":
                result = stat + value;
                return result;
            case "-":
                result = stat - value;
                return result;
            case "*":
                result = stat * value;
                return result;
            case "/":
                result = stat / value;
                return result;
            default:
                break;
        }
    }

    executeAllCardsFromDeck(deck){
        for (let i = 0; i < deck.cards.length; i++) {
            const card = deck.cards[i];
            
        }
    }
}