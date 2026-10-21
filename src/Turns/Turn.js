import { BoardId, CardId, DecksId, GridId, MovePhaseStates, PhaseStates, TimerId, TurnStates, MessageType , IconsPos, ScreenSize, ButtonState, TurnId, Team, BuffId, CurseId, renderState, AttackState, Sound, ButttonsId} from "../constants.js";
import globals from "../globals.js";
import DiscardPhase from "./turn_phases/DiscardPhase.js";
import DrawCardPhase from "./turn_phases/DrawCardPhase.js";
import DefaultPhase from "./turn_phases/DefaultPhase.js";
import MinionAttackPhase from "./turn_phases/MinionAttackPhase.js";
import MinionMovementPhase from "./turn_phases/MinionMovementPhase.js";
import Phase from "./turn_phases/Phase.js"; 
import PrepareEventPhase from "./turn_phases/PrepareEventPhase.js";
import UseEventPhase from "./turn_phases/UseEventPhase.js";

export default class Turn {

    constructor(gridArray, mainCharacter, otherMainCharacter, handDeck, enemyHandDeck, minionDeck,enemyMinionDeck, graveyardDeck, eventDeck, preparingEventDeck, enemyPreparingEventDeck, activeMinionDeck, enemyActiveMinionDeck,  buttonContainer, eventContainer, turnId, name, josephDeck, soundManager){

        //this.playerName     = playerName;       // Nombre del player
        //this.playerImage    = playerImage;      // Imgaen del player
        this.handDeck           = handDeck;                 // Mano del player
        this.enemyHandDeck      = enemyHandDeck
        this.minionDeck         = minionDeck;               // Mazo de minions
        this.enemyMinionDeck    = enemyMinionDeck
        this.graveyardDeck      = graveyardDeck;            // Mazo cementerio
        this.mainCharacter      = mainCharacter;            // Carta de Character asignada  predefinida desde turnContainer
        this.otherMainCharacter = otherMainCharacter        // Carta del Character rival
        this.gridArray          = gridArray;                // Array de rejillas
        this.eventContainer     = eventContainer            // Contenedor de eventos
        this.eventDeck          = eventDeck;                // Mazo de eventos
        this.preparingEventDeck = preparingEventDeck;       // mazo de eventos en preparacion
        this.enemyPreparingEventDeck = enemyPreparingEventDeck
        this.activeMinionDeck   = activeMinionDeck;         // Mazo de minions activos
        this.enemyActiveMinionDeck = enemyActiveMinionDeck
        this.buttonContainer    = buttonContainer;          // Contenedor de buttons
        this.active             = false;                    // Variable para saber si el turno esta activo
        this.state              = TurnStates.INITIALIZE;     // Estado del turno
        this.phaseState         = PhaseStates.DEFAULT;      // Estado de la fase
        this.phasesArray        = [];                       // Array de fases
        this.actionsCounter     = 0;                        // Contador de acciones maximo 5
        this.maxActions         = 3;                        // maximo de acciones
        this.finished           = false
        this.turnId             = turnId
        this.name               = name;
        this.josephDeck         = josephDeck;
        this.player             = null;
        this.damageDone         = 0;
        this.meleHits           = 0;
        this.rangeHits          = 0;
        this.hp                 = 0;
        this.soundManager       = soundManager
    }

    createPhases(mouse, grids, decks, turnCounter){
            
            const handDeck                  = turnCounter === 0 ? decks[DecksId.PLAYER_1_HAND_DECK]             : decks[DecksId.PLAYER_2_HAND_DECK]
            const enemyHandDeck             = turnCounter === 0 ? decks[DecksId.PLAYER_2_HAND_DECK]             : decks[DecksId.PLAYER_1_HAND_DECK]
            const activeMinionDeck          = turnCounter === 0 ? decks[DecksId.PLAYER_1_ACTIVE_MINION_DECK]    : decks[DecksId.PLAYER_2_ACTIVE_MINION_DECK]
            const enemyActiveMinionDeck     = turnCounter === 0 ? decks[DecksId.PLAYER_2_ACTIVE_MINION_DECK]    : decks[DecksId.PLAYER_1_ACTIVE_MINION_DECK]
            const minionDeck                = turnCounter === 0 ? decks[DecksId.PLAYER_1_MINION_DECK]           : decks[DecksId.PLAYER_2_MINION_DECK]
            const enemyMinionDeck           = turnCounter === 0 ? decks[DecksId.PLAYER_2_MINION_DECK]           : decks[DecksId.PLAYER_1_MINION_DECK]
            const eventDeck                 = decks[DecksId.EVENT_DECK]
            const graveYardDeck             = decks[DecksId.GRAVEYARD_DECK]
            const josephDeck                = decks[DecksId.JOSEPH_DECK]

            const boardGrid                 = grids[GridId.BOARD_GRID]
            const activeEventDeck           = turnCounter === 0 ? decks[DecksId.PLAYER_1_PREPARING_EVENT_DECK]  : decks[DecksId.PLAYER_2_PREPARING_EVENT_DECK]
            const enemyActiveEventDeck      = turnCounter === 0 ? decks[DecksId.PLAYER_2_PREPARING_EVENT_DECK]  : decks[DecksId.PLAYER_1_PREPARING_EVENT_DECK]
            const activeEventGrid           = turnCounter === 0 ? grids[GridId.PLAYER_1_EVENT_GRID]             : grids[GridId.PLAYER_2_EVENT_GRID]
            const handGrid                  = turnCounter === 0 ? grids[GridId.PLAYER_1_HAND_GRID]              : grids[GridId.PLAYER_2_HAND_GRID]
            const enemyHandGrid             = turnCounter === 0 ? grids[GridId.PLAYER_2_HAND_GRID]              : grids[GridId.PLAYER_1_HAND_GRID]
        
            const buttons                   = this.buttonContainer;
            const eventContainer            = this.eventContainer;
      
            const defaultPhase          = new DefaultPhase(buttons, activeEventDeck, enemyActiveEventDeck , graveYardDeck, eventContainer);
            const discardPhase          = new DiscardPhase(handDeck, graveYardDeck, mouse)
            const drawCardPhase         = new DrawCardPhase(handDeck, handGrid, eventDeck, graveYardDeck, josephDeck)
            const minionAttackPhase     = new MinionAttackPhase(activeMinionDeck, enemyActiveMinionDeck, activeEventDeck, enemyActiveEventDeck, graveYardDeck, boardGrid, mouse, buttons);
            const minionMovementPhase   = new MinionMovementPhase(activeMinionDeck, enemyActiveMinionDeck, boardGrid, mouse);
            const prepareEventPhase     = new PrepareEventPhase(handDeck, activeEventDeck, handGrid, activeEventGrid, mouse);
            const useEventPhase         = new UseEventPhase(activeEventGrid, activeEventDeck,boardGrid, activeMinionDeck, enemyActiveMinionDeck, mouse, this)
    
            const phasesArray = [defaultPhase, discardPhase, drawCardPhase, minionMovementPhase, minionAttackPhase, prepareEventPhase, useEventPhase];
    
            this.phasesArray = phasesArray
    }

    update(mouse, enemyActiveMinionDeck, messagesContainer, timerContainer, particlesContainer){
    
        this.updateStatsToSendDatabase();
        switch(this.state){
            
            case TurnStates.INITIALIZE:
                const isInitOver = this.init(timerContainer, mouse, messagesContainer);

                if (isInitOver){

                    this.state = TurnStates.EXECUTION
                    this.mainCharacter.turnMessage = true
                    this.finished = false   
                }
                break;
            
            case TurnStates.EXECUTION:
                const isPhasesOver = this.execute(mouse, messagesContainer, timerContainer, particlesContainer);
                
                if (enemyActiveMinionDeck.cards.length + this.enemyMinionDeck.cards.length === 0) {
                    this.finished = true
                }else{
                    if (isPhasesOver) {
                       this.state = TurnStates.END
                    }
                    this.finished = false

                }
                break;

            case TurnStates.END:
         
                const isEndTurn = this.end(messagesContainer, mouse, timerContainer);
                if (isEndTurn) {

                    this.mainCharacter.previousMessage = undefined
                    messagesContainer.damageMessage = []
                    this.finished = true
                }
                this.assignTurnToBuffCard();
                break;
        }

    }

    init(timerContainer, mouse, messagesContainer){

        this.phaseState = PhaseStates.DEFAULT;

        // Restablecer el Timer
        timerContainer.restartTimerValue(TimerId.TURN_TIMER);

        // indicar turno activo
        this.active = true;

        this.actionsCounter = 0;

        if (messagesContainer.changeTurnMessage.length === 0){      

            this.gridArray.grids[GridId.BOARD_GRID].update(mouse, [this.activeMinionDeck, this.enemyActiveMinionDeck])

            this.restoreCardStatesFromActiveDecks()
            // Spawnear nuevo Minion
            if (this.minionDeck.cards.length>0) {
            for (; this.activeMinionDeck.cards.length < 3;) {
                    const newMinion = this.minionDeck.spawnNewMinions(this.activeMinionDeck);
                    
                    // Posicionar nuevo Minion en el Grid
                    if (newMinion != undefined){
                        
                        newMinion.assignMinionToBoardGrid(this.gridArray.grids[GridId.BOARD_GRID], this.turnId);
                    } 
                    if (this.minionDeck.cards.length === 0) {
                        break;
                    }
                }
            }
           
            this.eventContainer.executeEvents(messagesContainer, [this.activeMinionDeck, this.enemyActiveMinionDeck])
            this.preparingEventDeck.update(mouse, this.preparingEventDeck, messagesContainer)  
            this.phasesArray[PhaseStates.DRAW_CARD].execute(this.eventContainer, this.soundManager);

            this.deselect();

            return true;
        }

        return false;
    }

    assignTurnToBuffCard(){ 
        for(let i = 0; i < this.preparingEventDeck.cards.length; i++){
            
            const card = this.preparingEventDeck.cards[i];

            if(card.id === BuffId.HERO_EMPOWERMENT || card.id === BuffId.TOAST ){
              
                card.setTurn(this);
            }

            switch(card.id){
                case CurseId.MOLOTOV_COCKTAIL:
                case BuffId.DECEPTION:
                    card.setTurn(this);
                    break;
            }
        }
    }

    execute(mouse, messagesContainer, timerContainer, particlesContainer){

        // Esto es el turnLoop
        switch (this.phaseState) {
            case PhaseStates.PREPARE_EVENT:
                const isPreparationFinished  = this.phasesArray[PhaseStates.PREPARE_EVENT].execute(this.eventContainer, mouse, messagesContainer);
                const isPreparationCancelled = this.phasesArray[PhaseStates.PREPARE_EVENT].isPhaseCancelled(this.buttonContainer, messagesContainer);
                if (isPreparationFinished) {
                    this.deselect();
                    this.buttonContainer.resetStatesButtons();
                    this.phaseState = PhaseStates.DEFAULT;
                    this.actionsCounter++;
                }else if(isPreparationCancelled){
                    this.deselect();
                    this.phaseState = PhaseStates.DEFAULT;

                }
                break;

            case PhaseStates.USE_EVENT_CARD:
                const isUsageFinished = this.phasesArray[PhaseStates.USE_EVENT_CARD].execute(this.eventContainer, mouse, messagesContainer, this.soundManager);
                const isUseEventCancelled   = this.phasesArray[PhaseStates.USE_EVENT_CARD].isEventCancelled(this.buttonContainer, messagesContainer);

                if (isUsageFinished) {
                    this.deselect();
                    this.buttonContainer.resetStatesButtons();
                     this.phaseState = PhaseStates.DEFAULT;
                     this.actionsCounter++;
                }else if(isUseEventCancelled){
                    this.deselect();
                    this.phaseState = PhaseStates.DEFAULT;

                }
                
                break;
            
            case PhaseStates.MOVEMENT:
                const isMovementFinished = this.phasesArray[PhaseStates.MOVEMENT].execute(messagesContainer, particlesContainer,this.soundManager);
                const isMovementCancelled   = this.phasesArray[PhaseStates.MOVEMENT].isPhaseCancelled(this.buttonContainer, messagesContainer);
                if(isMovementFinished){
                    this.deselect();
                    this.buttonContainer.resetStatesButtons();
                    this.phaseState = PhaseStates.DEFAULT;
                    this.actionsCounter++;
                }else if(isMovementCancelled){
                    this.deselect();
                    this.phaseState = PhaseStates.DEFAULT;

                }
                break;
                
            case PhaseStates.ATTACK:
                const isAttackFinished  = this.phasesArray[PhaseStates.ATTACK].execute(messagesContainer, particlesContainer, this.soundManager);
                const isAttackCancelled = this.phasesArray[PhaseStates.ATTACK].isPhaseCancelled(this.buttonContainer, messagesContainer);

                if(isAttackFinished){
                    this.deselect();
                    this.buttonContainer.resetStatesButtons();
                    this.phaseState = PhaseStates.DEFAULT;
                    this.actionsCounter++;
                }else if(isAttackCancelled && !isAttackFinished){
                    this.deselect();
                    this.phaseState = PhaseStates.DEFAULT;
                    
                }
                break; 
                
            case PhaseStates.DISCARD_CARD:
                const value = timerContainer.update(TimerId.DISCARD_TIMER);
                const isDiscardFinished = this.phasesArray[PhaseStates.DISCARD_CARD].execute(messagesContainer, value);
                const isDiscardCancelled = this.phasesArray[PhaseStates.DISCARD_CARD].isPhaseCancelled(this.buttonContainer, messagesContainer);
                if(isDiscardCancelled){
                    this.deselect();
                    this.phaseState = PhaseStates.DEFAULT;
                    
                }

                if(isDiscardFinished){
                    timerContainer.restartTimerValue(TimerId.DISCARD_TIMER)
                    this.deselect();
                    this.buttonContainer.resetStatesButtons();
                    this.phaseState = PhaseStates.DEFAULT;
                    return true
                }else{
                    return false
                }

                break;
            
            case PhaseStates.DEFAULT:
                // console.log("entro en default");
                this.phaseState = this.phasesArray[PhaseStates.DEFAULT].execute(messagesContainer);
                const isChangePhase = this.phasesArray[PhaseStates.DEFAULT].isPhaseCancelled(this.buttonContainer, messagesContainer);

                if(isChangePhase != false){
                    
                    this.phaseState = isChangePhase;
                }
                break;
            default:

                break;
        }

        this.josephDeck.update(mouse)
        this.activeMinionDeck.removeEquipIfdurability0();
        this.enemyActiveMinionDeck.removeEquipIfdurability0();
        this.preparingEventDeck.removeIfWornOut(this.graveyardDeck,);
        this.enemyPreparingEventDeck.removeIfWornOut(this.graveyardDeck);

        const value = timerContainer.update(TimerId.TURN_TIMER);
        
        if (value <= 0 || this.actionsCounter === this.maxActions){
            
            this.state = TurnStates.END;
        }
    }

    end(messagesContainer, mouse, timerContainer){
        this.phasesArray[PhaseStates.ATTACK].restoreValues();
        this.buttonContainer.setState(renderState.GAME);
        this.phaseState = PhaseStates.DISCARD_CARD
        this.gridArray.grids[GridId.BOARD_GRID].update(mouse, [this.activeMinionDeck, this.enemyActiveMinionDeck])
        const value = timerContainer.update(TimerId.DISCARD_TIMER);
        const isCardDiscarded = this.phasesArray[PhaseStates.DISCARD_CARD].execute(messagesContainer, value);
        messagesContainer.damageMessage;

        if (isCardDiscarded) {
            timerContainer.restartTimerValue(TimerId.DISCARD_TIMER)
            // Deseleccionar elementos
            this.deselect();
            
            this.blockCardStatesFromHandDeck();
            this.activeMinionDeck.restoreDeckMinionsStats(messagesContainer);
            this.enemyActiveMinionDeck.restoreDeckMinionsStats(messagesContainer);
            this.TurnStates = TurnStates.INITIALIZE
            // cambio de turno
            this.active = false;
            return true
        }else{
            return false
        }
    }

    deselect(){

        this.buttonContainer.deselect();
        this.gridArray.deselect();
        this.activeMinionDeck.deselect();
        this.enemyActiveMinionDeck.deselect();
        this.preparingEventDeck.deselect();
        this.enemyPreparingEventDeck.deselect();
        this.handDeck.deselect();
    }

    restoreCardStatesFromActiveDecks(){
        const decks = [this.handDeck, this.activeMinionDeck, this.preparingEventDeck]
        for (let i = 0; i < decks.length; i++) {
            const deck = decks[i];
            for (let j = 0; j < deck.cards.length; j++) {
                const card = deck.cards[j];
                card.state = CardId.NOT_SELECTED
                
            }
        }
    }

    blockCardStatesFromHandDeck(){
        const deck = this.handDeck
            for (let j = 0; j < deck.cards.length; j++) {
                const card = deck.cards[j];
                card.state = CardId.BLOCKED
                
            }
    }

    reduceEventCardsCooldown(){
        for (let i = 0; i < this.preparingEventDeck.cards.length; i++) {
            const card = this.preparingEventDeck.cards[i];
            if (card.cooldown > 0) 
                card.cooldown--
        }
    }
    
    render(ctx,language, currentTurn, xPos, yPos, mouse, team){

        const decks = [this.activeMinionDeck, this.enemyActiveMinionDeck, this.handDeck, this.enemyHandDeck, this.preparingEventDeck, this.enemyPreparingEventDeck, this.mainCharacter, this.otherMainCharacter, this.josephDeck];
        const card = this.activeMinionDeck.isAnyCard(decks, CardId.SCALED);
        
        if (card[0] === false && this.buttonContainer.state != renderState.QUICK_HELP && this.buttonContainer.container[ButttonsId.BTN_RETURN_TO_MENU].state != ButtonState.SELECTED){
            
            ctx.globalAlpha = 1;
            ctx.filter = "blur(0px)";
        }

        const teamColor = team === this.turnId ? Team.ATTACKER : Team.DEFENDER

        this.activeMinionDeck.renderCards(ctx, language, mouse, teamColor);
        this.preparingEventDeck.renderCards(ctx, language, mouse);
        this.handDeck.renderCards(ctx, language, mouse);
        this.mainCharacter.render(ctx, language, teamColor);
        this.mainCharacter.renderChatBubble(ctx);

        if (this.josephDeck.cards[0]) {
            this.josephDeck.cards[0].render(ctx, language, currentTurn)
            this.josephDeck.cards[0].renderChatBubble(ctx)
        }
        ctx.save()
        ctx.font = "24px LongaIberica-DEMO"
        ctx.lineJoin = "round"
        ctx.lineWidth = 3
        ctx.strokeStyle = "rgba(0, 0, 0, 0.85)"
        ctx.strokeText(this.name, xPos, yPos);
        ctx.fillStyle = "white"
        ctx.fillText(this.name ,xPos, yPos);
        ctx.restore()
        if (this.active) {
            const actionsLeft = this.maxActions-this.actionsCounter
            ctx.save()
            ctx.font = "64px LongaIberica-DEMO"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.lineJoin = "round"
            ctx.lineWidth = 5
            ctx.strokeStyle = "rgba(0, 0, 0, 0.85)"
            ctx.strokeText(actionsLeft, IconsPos.ACTIONS_LEFT_X, IconsPos.ACTIONS_LEFT_Y);
            ctx.fillStyle = "white"
            ctx.fillText(actionsLeft, IconsPos.ACTIONS_LEFT_X, IconsPos.ACTIONS_LEFT_Y)
            ctx.restore()
            
        }
        
        if (card[2] != undefined){
            ctx.fillStyle = "black"
            ctx.globalAlpha = 0.3;
            ctx.filter = "blur(0px)";
            ctx.fillRect(0, 0, ScreenSize.X_SIZE, ScreenSize.Y_SIZE);
            ctx.globalAlpha = 1;
            card[2].render(ctx, language);
            if (card[2].armor) {
                card[2].armor.render(ctx, language, true, IconsPos.SCALED_ARMOR_X, IconsPos.SCALED_ARMOR_Y)
                
            }
            if (card[2].weapon) {
                card[2].weapon.render(ctx, language, true, IconsPos.SCALED_WEAPON_X, IconsPos.SCALED_WEAPON_Y)
                
            }
            ctx.filter = "blur(3px)";
        }
    }

    updateStatsToSendDatabase(){
        
        const damageDone = this.phasesArray[PhaseStates.ATTACK].damageDone + this.phasesArray[PhaseStates.USE_EVENT_CARD].damageDone;
        const meleHits   = this.phasesArray[PhaseStates.ATTACK].meleHits;
        const rangeHits  = this.phasesArray[PhaseStates.ATTACK].rangeHits;

        this.damageDone = damageDone;
        this.meleHits   = meleHits;
        this.rangeHits  = rangeHits;
    }
}