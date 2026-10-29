
import { MainCharacterId } from "../../constants.js";
import Event from "../Event.js";
import EventFactory from "../EventFactory.js";
import AngeloDiMortisEvent from "./AngeloDiMortisEvent.js";
import DecrepitThroneEvent from "./DecrepitThroneEvent.js";

export default class HeroEvents extends Event{

    constructor(activeMinionDeck, enemyActiveMinionDeck, hero, card, turn){
        
        super();
        this.activeMinionDeck       = activeMinionDeck;
        this.enemyActiveMinionDeck  = enemyActiveMinionDeck;
        this.card                   = card;
        this.hero                   = hero;
        this.turn                   = turn;
        this.aux                    = true;
        this.minion                 = null;
    }

    execute(){
        this.card.durability -= 0.5;

        if (this.card.durability === 0) {

            switch(this.hero.id){
                case MainCharacterId.ANGELO:
                    AngeloDiMortisEvent.remove(this.turn);
                    break;
                
                case MainCharacterId.DECREPIT_TRHONE:
                    DecrepitThroneEvent.remove(this.minion, this.activeMinionDeck, this.enemyActiveMinionDeck);
                    break;
            }

            return true

        } else{
            switch(this.hero.id){
                case MainCharacterId.LUCRETIA:
                    for (let i = 0; i < this.enemyActiveMinionDeck.cards.length; i++) {
                    
                        const card = this.enemyActiveMinionDeck.cards[i];
                        EventFactory.createHeroEventAndExecute(this.hero, card, this.enemyActiveMinionDeck, this.activeMinionDeck, this.turn, this.minion);
                    }
                    break;
                    
                case MainCharacterId.X_G_SCHOLAR:
                    for(let i = 0; i < this.activeMinionDeck.cards.length; i++){
                        
                        const card = this.activeMinionDeck.cards[i];
                        EventFactory.createHeroEventAndExecute(this.hero, card, this.enemyActiveMinionDeck, this.activeMinionDeck, this.turn, this.minion);
                    }
                    break;

                case MainCharacterId.ANGELO:
                    if(this.aux){
                        EventFactory.createHeroEventAndExecute(this.hero, null, this.enemyActiveMinionDeck, this.activeMinionDeck, this.turn, this.minion);
                        this.aux = false;
                    }
                    break;  

                case MainCharacterId.DECREPIT_TRHONE:
                    if(this.aux){
                        const randomMinion = Math.floor(Math.random() * 3);
                        this.minion        = this.enemyActiveMinionDeck.cards[randomMinion];
                        EventFactory.createHeroEventAndExecute(this.hero, null, this.enemyActiveMinionDeck, this.activeMinionDeck, this.turn, this.minion);
                        this.aux = false;
                    }else{
                        this.minion.changeStat("attack", 3);
                        this.minion.changeStat("speed", 1);
                    }
                
                    break;
            }

            return false
        }
    }



}