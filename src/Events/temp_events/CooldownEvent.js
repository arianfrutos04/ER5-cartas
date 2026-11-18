import Event from "../Event.js";

export class CooldownEvent extends Event{

    constructor(id, card, cooldown){
        super()
        this.id         = id
        this.card       = card;
        this.cooldown   = cooldown;
    }
    execute(){
        this.card.cooldown-= 0.5
        if (this.card.cooldown === 0) {
            return true
        } else{
            return false
        }
    }
}