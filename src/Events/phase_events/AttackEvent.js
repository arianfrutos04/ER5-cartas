import Event from "../Event.js";
import Messages from "../../Messages.js";
import { AttackImpact, CombatText, MessageState, MessageType, Sound } from "../../constants.js";
import BlockEvent from "./BlockEvent.js";

export class AttackEvent extends Event{

    constructor(attackerMinion, objectiveMinion){
        super();

        this.attackerMinion     = attackerMinion;       // Minion atacante
        this.objectiveMinion    = objectiveMinion;      // Minion objetivo
        this.critic             = 1.75;
        this.fail               = 0;
        this.damageDone         = 0;
        this.impact             = AttackImpact.NORMAL;  // Resultado del golpe para elegir el efecto
    }

    execute(messagesContainer, soundManager) {
        const dice = this.throwDice();
        const critic = this.calculateCritic(dice);
        const fail   = this.calculateFail(dice);
     
        let damage;
        let damageRender = ["", ""]
        let attackerWeapon
        let objectiveWeapon
        let objectiveArmor
        let size = 80
        let color = "red"
        let sound
        if (this.attackerMinion.weapon != undefined) {
            // Ataque con los atributos del minion y del arma
            damage = this.attackWithWeapon(messagesContainer, soundManager);
            sound = Sound.ATTACK_SWORD
        } else {
            // Ataque con los atributos del minion
            damage = this.attack(messagesContainer);
            sound = Sound.ATTACK_PUNCH
        }

        if(critic){
            damage = Math.floor(damage * this.critic);
            this.objectiveMinion.health -= damage
            size = 100
            color= "orange"
            damageRender = CombatText.CRITICAL
            this.impact = AttackImpact.CRITICAL
            sound = this.attackerMinion.weapon ? sound = Sound.ATTACK_CRIT : Sound.ATTACK_PUNCH_CRIT
        }else if(fail){
            damage = 0
            this.objectiveMinion.health -= damage;
            size = 100
            color= "white"
            damageRender = CombatText.BLUNT
            this.impact = AttackImpact.BLUNT
            sound = Sound.ATTACK_MISS
        }else{
            this.objectiveMinion.health -= damage;
        }

        soundManager.currentSound = sound
        this.damageDone += damage;
        damageRender = damageRender.map((text) => -damage + text)
        if(this.objectiveMinion.health <= 0){
            damageRender = CombatText.DEAD
        }
        
        if (this.attackerMinion.weapon != undefined && this.attackerMinion.weapon.durability <= 0){
            
            attackerWeapon = new Messages(this.attackerMinion.xPos, this.attackerMinion.yPos + 155, CombatText.WEAPON_BROKEN, MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3, 50, "red");
        }
        if (this.objectiveMinion.weapon != undefined && this.objectiveMinion.weapon.durability <= 0){

            objectiveWeapon = new Messages(this.objectiveMinion.xPos, this.objectiveMinion.yPos + 155, CombatText.WEAPON_BROKEN, MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3, 50, "red");
        }
        if (this.objectiveMinion.armor != undefined && this.objectiveMinion.armor.durability <= 0){

            objectiveArmor = new Messages(this.objectiveMinion.xPos, this.objectiveMinion.yPos + 155, CombatText.ARMOR_BROKEN, MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3, 50, "red");
        }

        const doneDamage = new Messages(this.objectiveMinion.xPos, this.objectiveMinion.yPos, damageRender, MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3, size, color);

        const messages = [doneDamage, attackerWeapon, objectiveWeapon, objectiveArmor];

        for (let i = 0; i < messages.length; i++){

            const message = messages[i];

            if (message != undefined){
            
                messagesContainer.addMessage(message);
            }
        }
    }

    attack(messagesContainer){
        const enemyArmor = this.objectiveMinion.armor
        let defense = this.objectiveMinion.defense
        if (enemyArmor != undefined) {
            defense += enemyArmor.defense
            enemyArmor.durability--
            
            if(messagesContainer !== undefined){
                const message = new Messages(enemyArmor.xPos, enemyArmor.yPos, "-1", MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3, 50, "red");
                messagesContainer.addMessage(message);
            }
            
        }

        let damage = this.attackerMinion.attack - defense;
        if (damage <0) {
            damage = 0
        }
        
        return damage;
    }
    
    attackWithWeapon(messagesContainer){
        const enemyArmor = this.objectiveMinion.armor
        const attackerWeapon = this.attackerMinion.weapon;
        let defense = this.objectiveMinion.defense
        
        if (enemyArmor != undefined) {
            defense += enemyArmor.defense
            enemyArmor.durability--

            const message = new Messages(enemyArmor.xPos, enemyArmor.yPos, "-1", MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3, 50, "red");
            messagesContainer.addMessage(message);
        }

        let damage = this.attackerMinion.attack + this.attackerMinion.weapon.attack - defense;
        if (damage <0) {
            damage = 0
        }
        attackerWeapon.durability--
        const message = new Messages(attackerWeapon.xPos, attackerWeapon.yPos, "-1", MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3, 50, "red");
        messagesContainer.addMessage(message);
      
        return damage;
    }

    attackWithParry(messagesContainer, soundManager){
        const enemyWeapon = this.objectiveMinion.weapon;
        let damage = 0;
        let size = 0
        let color= "red"
        const dice = this.throwDice();
        const critic = this.calculateCritic(dice);
        const fail   = this.calculateFail(dice);
        let sound

        this.impact = fail ? AttackImpact.BLUNT : AttackImpact.BLOCKED;

        if (this.attackerMinion.weapon != undefined) {
            // Ataque con los atributos del minion y del arma
            damage = this.attackWithWeapon(messagesContainer, soundManager);
            sound = Sound.ATTACK_SWORD
            if(critic){
                damage = Math.floor(damage * this.critic);
                size = 100
                color= "orange"
                sound = Sound.ATTACK_CRIT
            }else if(fail){
                damage = 0;
                size = 100
                color= "white"
                sound = Sound.ATTACK_MISS
            }

            if(enemyWeapon.durability > damage * 0.75){

                let defense = Math.floor(damage);

                if (defense < 1){

                    defense = 1;
                }

                enemyWeapon.durability -= defense;
                const message = new Messages(enemyWeapon.xPos, enemyWeapon.yPos, defense, MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3, 50, "red");
                messagesContainer.addMessage(message);

                const damageRender = CombatText.BLOCKED
                const doneDamage = new Messages(this.objectiveMinion.xPos, this.objectiveMinion.yPos, damageRender, MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3);
                messagesContainer.addMessage(doneDamage);
                this.damageDone += damage;

            }else{
                const block = new BlockEvent(this.attackerMinion, this.objectiveMinion, damage);

                let damage = block.execute(messagesContainer, size, color);
                this.damageDone += damage;
            }
            soundManager.currentSound = sound
        } else {
            // Ataque con los atributos del minion
            damage = this.attack();
            sound = Sound.ATTACK_PUNCH
            console.log(sound);
            if(critic){
                damage = Math.floor(damage * this.critic);
                size = 100
                color= "orange"
                sound = Sound.ATTACK_PUNCH_CRIT
            }else if(fail){
                damage = 0;
                size = 100
                color= "white"
                sound = Sound.ATTACK_MISS
            }

            if(enemyWeapon.durability > damage * 0.75){

                let defense = Math.floor(damage);

                if (defense < 1){

                    defense = 1;
                }

                enemyWeapon.durability -= defense;
                const damageRender = CombatText.BLOCKED
                const doneDamage = new Messages(this.objectiveMinion.xPos, this.objectiveMinion.yPos, damageRender, MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3);
                messagesContainer.addMessage(doneDamage);
                this.damageDone += damage;
                
            }else{
                
                const block = new BlockEvent(this.attackerMinion, this.objectiveMinion, damage);

                damage = block.execute(messagesContainer,size, color);
                this.damageDone += damage;
            }
            soundManager.currentSound = sound
        }
        
    }

    throwDice(){

        return Math.floor(Math.random() * 20 + 1);
    }

    calculateCritic(critic){

        if(critic * this.attackerMinion.criticModifier >= 20){

            return true;

        }else {

            return false;
        }
    }

    calculateFail(fail){

        if(fail * this.attackerMinion.failModifier <= 1){

            return true;
        }else {

            return false;
        }
    }
}