import Messages from "../../Messages.js";
import { BlockStates, CombatText, MessageState, MessageType } from "../../constants.js";
import Event from "../Event.js";

export default class BlockEvent extends Event{
    
    constructor(attackerMinion, defenderMinion, damage){

        super();

        this.attackerMinion = attackerMinion;
        this.defenderMinion = defenderMinion;
        this.damage         = damage;
        this.state          = BlockStates.INVALID;

    }

    // caso 2 durabilidad < al daño
    execute(messagesContainer, size, color){

        this.state  = Math.floor(Math.random() * 3);
        const state = this.state;
        const enemyWeapon = this.defenderMinion.weapon;
        const initialDmg = this.damage
        let damageRender
        switch(state){

            case BlockStates.COMPLETE_BLOCK:
                this.damage = 0;
                this.defenderMinion.health -= this.damage;
                
                break;

            case BlockStates.PARCIAL_BLOCK:
                this.damage = Math.floor(Math.random() * (this.damage / 2));
                this.defenderMinion.health -= this.damage;
         
                break;

            case BlockStates.FAILED_BLOCK:
                this.defenderMinion.health -= this.damage;
          
                break; 
        }

        // Romper el arma del defensor
        enemyWeapon.durability = 0;
        
        if (this.damage === 0) {
            damageRender = CombatText.BLOCKED
        }else{
            // Bloqueo parcial: dano y, entre parentesis, lo bloqueado. Bloqueo fallido: no se bloquea nada
            const damageText = "-" + this.damage + "(" + (initialDmg - this.damage) + ")"
            damageRender = [damageText, damageText]
            if (state === BlockStates.FAILED_BLOCK) {
                damageRender = CombatText.BLOCK_BLUNT.map((text) => text + "-" + this.damage)
            }
        }
        
        const doneDamage = new Messages(this.defenderMinion.xPos, this.defenderMinion.yPos, damageRender, MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3, size, color);
        messagesContainer.addMessage(doneDamage);

        if (this.defenderMinion.health <= 0) {

            messagesContainer.addMessage(Messages.createAfterHitMessage(this.defenderMinion, CombatText.DEAD));
        }

        return this.damage;
    }
    
}