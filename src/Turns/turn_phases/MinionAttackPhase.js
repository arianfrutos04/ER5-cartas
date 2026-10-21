import Phase from "./Phase.js";
import { AttackEvent } from "../../Events/phase_events/AttackEvent.js";
import { CardId, PhaseStates, messageAttackPhase1, messageAttackPhase2, AttackState, renderState, CardActions, Sound, BoardCardSizes } from "../../constants.js";

export default class MinionAttackPhase extends Phase {

    constructor(activeMinionDeck, enemyActiveMinionDeck, activeEventDeck, enemyActiveEventDeck, graveyardDeck, boardGrid, mouse, buttonContainer) {
        super();
        this.activeMinionDeck = activeMinionDeck;               // Deck de minions activos
        this.enemyActiveMinionDeck = enemyActiveMinionDeck;     // Deck de minions activos del rival
        this.activeEventDeck = activeEventDeck;
        this.enemyActiveEventDeck = enemyActiveEventDeck;
        this.graveyardDeck = graveyardDeck;
        this.boardGrid = boardGrid;
        this.state = AttackState.DEFAULT;
        this.mouse = mouse;                                     // Objeto Mouse
        this.buttonContainer = buttonContainer;
        this.attacker       = null;
        this.enemy          = null;
        this.distance       = null;
        this.enemyPosition  = null;
        this.damageDone     = 0;
        this.meleHits       = 0;
        this.rangeHits      = 0;

    }


    // funcion para realizar el ataque
    attack(messagesContainer, isAttackWithParry, soundManager, particlesContainer) {

        const attacker      = this.attacker;
        const enemy         = this.enemy;
        const distance      = this.distance;
        const enemyPosition = this.enemyPosition;
        
        if(distance === 1){
            this.meleHits += 1;
        }else{
            this.rangeHits += 1;
        }
        if(attacker !== null && enemy !== null && distance !== null && enemyPosition !== null){

            let range = 1;

            if (attacker.weapon != undefined){

                range = attacker.weapon.range;
            }
            
            if (distance <= range) {

                let impact;

                if(isAttackWithParry){

                    const blockEvent = new AttackEvent(attacker, enemy);
                    blockEvent.attackWithParry(messagesContainer, soundManager);
                    this.damageDone += blockEvent.damageDone;
                    impact = blockEvent.impact;
                }else{

                    const attackEvent = new AttackEvent(attacker, enemy);
                    attackEvent.execute(messagesContainer, soundManager);
                    this.damageDone += attackEvent.damageDone;
                    impact = attackEvent.impact;

    
                }
            
    
                attacker.state = CardId.NOT_SELECTED;
                enemy.state = CardId.NOT_SELECTED;
    
                this.removeEnemyIfDead(enemy, enemyPosition, soundManager);
                

                    const enemyXPos = this.enemy.xPos;
                    const enemyYPos = this.enemy.yPos;
                    const enemyXSize = BoardCardSizes.X_SIZE;
                    const enemyYSize = BoardCardSizes.Y_SIZE;
        
                    particlesContainer.createAttack(enemyXPos, enemyYPos, enemyXSize, enemyYSize, impact);

                    if (enemy.health <= 0){

                        particlesContainer.createDeath(enemyXPos, enemyYPos, enemyXSize, enemyYSize);
                    }
                
                return true;
    
            } else {
                // console.log("no puedes atacar");                

                attacker.state = CardId.NOT_SELECTED;
                enemy.state = CardId.NOT_SELECTED;
                this.resetEnemyAttackerDistance();
                this.state = AttackState.DEFAULT;
                return false;
            }

        }

        
    }

    removeEnemyIfDead(enemy, enemyPosition, soundManager) {
        if (enemy.health <= 0) {
            this.enemyActiveMinionDeck.cards.splice(enemyPosition, 1)
            enemy.state = CardId.DEAD
            soundManager.currentSound = Sound.DEAD
            if (enemy.weapon) {
                enemy.weapon.action = CardActions.READY
            }
            if (enemy.armor) {
                enemy.armor.action = CardActions.READY
            }
        }
    }


    calculateDistance(attacker, enemy) {
        const boardSlotXSize = 133;     // Ancho del slot en X
        const boardSlotYSize = 155;     // Alto del slot en Y

        const xPosAttacker = attacker.xPos;    // Posicion en x del Atacante
        const xPosEnemy = enemy.xPos;       // Posicion en x Del rival
        const yPosAttacker = attacker.yPos;    // Posicion en y Atacante
        const yPosEnemy = enemy.yPos;       // Posicion en y del rival

        // Calcular la diferencia en píxeles en slots
        const xDifference = Math.abs(xPosAttacker - xPosEnemy);
        const yDifference = Math.abs(yPosAttacker - yPosEnemy);

        // Calcular la distancia en  slots
        const distanceXSlots = Math.floor(xDifference / boardSlotXSize);
        const distanceYSlots = Math.floor(yDifference / boardSlotYSize);

        return distanceXSlots + distanceYSlots;
    }



    execute(messagesContainer, particlesContainer, soundManager) {

        let aux;

        this.boardGrid.cancelAviableSlots();

        this.boardGrid.update(this.mouse, [this.activeMinionDeck, this.enemyActiveMinionDeck]);

        // Update de los decks
        this.updateDecks(); 

        // Comprobar si hay alguna carta seleccionada del mazo de minions activos
        let isAnyCardSelected = this.activeMinionDeck.isAnyCard(this.activeMinionDeck, CardId.SELECTED);

        const minionSelected = isAnyCardSelected[2];
             
        if (isAnyCardSelected[0] === false){

            messagesContainer.activeMessage(messageAttackPhase1);
        }

        if (isAnyCardSelected[0]){
            
            this.boardGrid.aviableAttackSlots(minionSelected, this.activeMinionDeck);
            messagesContainer.activeMessage(messageAttackPhase2);
        }

        // Assign enemy, distance, enemyPosition, attacker
        const messages   = messagesContainer.messages;
        this.checkEnemySelected(messages);

        const state = this.state;

        switch (state) {
            case AttackState.ATTACK:
                aux = this.attack(messagesContainer, false, soundManager, particlesContainer);
         
                if(aux){
                    this.buttonContainer.deselect();
                    this.state = AttackState.DEFAULT;
                    this.resetEnemyAttackerDistance();
                    this.buttonContainer.setState(renderState.GAME);
                    return aux;
                }
                break;

            case AttackState.SELECT_PARRY_ATTACK:
              
                this.buttonContainer.setState(renderState.PARRY);
                const state = this.buttonContainer.isAnyButtonSelected();

                if(state != PhaseStates.DEFAULT){
                    this.state = state;
                }
                break;

            case AttackState.PREPARE_SELECT:
                this.buttonContainer.deselect();
                this.state = AttackState.SELECT_PARRY_ATTACK;
                break;

            case AttackState.PARRY:
                aux = this.attack(messagesContainer, true, soundManager, particlesContainer);
           
                if(aux){
                    this.buttonContainer.deselect();
                    this.state = AttackState.DEFAULT;
                    this.resetEnemyAttackerDistance();
                    this.buttonContainer.setState(renderState.GAME);
                    return aux;
                }
                break;

            case AttackState.DEFAULT:
                this.checkIfEnemyHasWeapon();
                break;
        }
    }

    // comprobar si la fase se cancela
    isPhaseCancelled(buttonContainer){
        
        const buttonState = buttonContainer.isAnyButtonSelected();

        if (this.state === AttackState.DEFAULT && buttonState === PhaseStates.DEFAULT) {

            return true;
        } else {

            return false;
        }
    }

    // Update de los decks
    updateDecks(){
    
        const decks = [this.activeMinionDeck, this.enemyActiveMinionDeck]
        for (let i = 0; i < decks.length; i++) {
            const deck = decks[i];
            deck.update(this.mouse, decks)
        }
    }

    checkEnemySelected(messages){

        // Comprobar si hay alguna carta seleccionada del mazo de minions activos
        let isAnyCardSelected = this.activeMinionDeck.isAnyCard(this.activeMinionDeck, CardId.SELECTED);

        // Comprobar si hay alguna carta en hover del mazo de minions activos del rival
        let isEnemyCardHovered = this.enemyActiveMinionDeck.isAnyCard(this.enemyActiveMinionDeck, CardId.HOVER);

        // Comprobar si hay enemigo seleccionado
        if (isEnemyCardHovered[0] && !this.mouse.leftClick && this.mouse.previousStateLeft) {

            // messages[MessageType.HELP_MESSAGE].timeInOn = 0;

            // Escoger las posiciones de las cartas en los decks
            const attackerPosition = isAnyCardSelected[1];

            this.enemyPosition = isEnemyCardHovered[1];

            // Minion atacante
            this.attacker = this.activeMinionDeck.cards[attackerPosition];

            // Minion rival
            this.enemy = this.enemyActiveMinionDeck.cards[this.enemyPosition];

            // Calcular distancia en slots [0] -> distancia en slots x [1] -> distancia en slots y
            this.distance = this.calculateDistance(this.attacker, this.enemy);
        }

    }

    restoreValues(){

        this.enemyPosition = null;
        this.attacker = null;
        this.enemy = null;
        this.distance = null;
        this.state = AttackState.DEFAULT;
    }

    checkIfEnemyHasWeapon(){
        if(this.enemy !== null){
            // console.log("enemigo seleccionado");
            this.state = AttackState.ATTACK;

            if(this.enemy.weapon != undefined){

                this.state = AttackState.PREPARE_SELECT;
            }
        }
    }

    resetEnemyAttackerDistance(){
        this.enemy      = null;
        this.attacker   = null;
        this.distance   = null;
        this.enemyPosition = null;
    }
    
}