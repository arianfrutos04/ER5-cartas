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
        let damage = 0
        let damageRender
        switch(state){

            case BlockStates.COMPLETE_BLOCK:
                // console.log("completo");
                this.damage = 0;
                this.defenderMinion.health -= this.damage;
                
                break;

            case BlockStates.PARCIAL_BLOCK:
                // console.log("parcial");
                this.damage = Math.floor(Math.random() * (this.damage / 2));
                this.defenderMinion.health -= this.damage;
         
                break;

            case BlockStates.FAILED_BLOCK:
                // console.log("fallo");
                this.defenderMinion.health -= this.damage;
          
                break; 
        }

        // Romper el arma del defensor
        enemyWeapon.durability = 0;
        
        if (this.damage === 0) {
            damageRender = CombatText.BLOCKED
        }else if(this.defenderMinion.health <= 0){
            damageRender = CombatText.DEAD

        }else{
            const damageText = "-" + this.damage + "(" + (initialDmg - this.damage) + ")"
            damageRender = [damageText, damageText]
            if (BlockStates.FAILED_BLOCK) {
                damageRender = CombatText.BLOCK_BLUNT.map((text) => text + damageText)
            }
        }
        
        const doneDamage = new Messages(this.defenderMinion.xPos, this.defenderMinion.yPos, damageRender, MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3, size, color);
        messagesContainer.addMessage(doneDamage);

        return this.damage;
    }
    
}