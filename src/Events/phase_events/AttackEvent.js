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
        // El dano va delante del texto ("-2", "-5 CRITICAL"); el fallo no lleva numero y el golpe que no hace dano muestra "0"
        const isBlunt = fail && !critic;
        damageRender = damageRender.map((text) => isBlunt ? text : ((damage > 0 ? "-" + damage : "0") + " " + text).trim())
        if (damage === 0 && !critic){
            color = "white"
        }
        
        if (this.attackerMinion.weapon != undefined && this.attackerMinion.weapon.durability <= 0){
            
            attackerWeapon = Messages.createAfterHitMessage(this.attackerMinion, CombatText.WEAPON_BROKEN);
        }
        // Si el golpe mata al esbirro solo sale DEAD; su equipo roto ya no importa
        const isObjectiveAlive = this.objectiveMinion.health > 0;

        if (isObjectiveAlive && this.objectiveMinion.weapon != undefined && this.objectiveMinion.weapon.durability <= 0){

            objectiveWeapon = Messages.createAfterHitMessage(this.objectiveMinion, CombatText.WEAPON_BROKEN);
        }
        if (isObjectiveAlive && this.objectiveMinion.armor != undefined && this.objectiveMinion.armor.durability <= 0){

            objectiveArmor = Messages.createAfterHitMessage(this.objectiveMinion, CombatText.ARMOR_BROKEN);
        }

        const doneDamage = new Messages(this.objectiveMinion.xPos, this.objectiveMinion.yPos, damageRender, MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.2, 0.2, 0.3, size, color);

        const deathMessage = isObjectiveAlive ? undefined : Messages.createAfterHitMessage(this.objectiveMinion, CombatText.DEAD);

        const messages = [doneDamage, deathMessage, attackerWeapon, objectiveWeapon, objectiveArmor];

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
        }

        let damage = this.attackerMinion.attack + this.attackerMinion.weapon.attack - defense;
        if (damage <0) {
            damage = 0
        }
        attackerWeapon.durability--
      
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