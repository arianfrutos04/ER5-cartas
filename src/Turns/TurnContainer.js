import Turn from "./Turn.js";
import { CardId, CardImageId, DecksId, IconsPos, TurnId } from "../constants.js";
import { requestMinionEffectTooltip } from "../Cards/minionEffects.js";

export default class TurnContainer {

    constructor(gridArray, deckContainer, buttonContainer, eventContainer){

        this.turnContainer      = [];
        this.gridArray          = gridArray;
        this.deckContainer      = deckContainer;
        this.buttonContainer    = buttonContainer;
        this.eventContainer    = eventContainer;
        this.actionsTurn        = undefined;                // El turno cuyo contador de acciones se ve
    }

    selectRandomHero(heroDeck)
    {

        const deckLength = heroDeck.length;

        const randomIndex = Math.floor(Math.random() * deckLength);

        const randomCard = heroDeck[randomIndex];

        return randomCard;
    
    }


    CreateTurns(mouse, eventContainer, soundManager)
    {
        let hero1 = {};
        let hero2 = {};
        
        do {
            hero1 = this.selectRandomHero(this.deckContainer.decks[DecksId.MAIN_CHARACTER_DECK].cards);
            hero2 = this.selectRandomHero(this.deckContainer.decks[DecksId.MAIN_CHARACTER_DECK].cards);
        } while (hero1 === hero2);

        const player1HandDeck           = this.deckContainer.decks[DecksId.PLAYER_1_HAND_DECK];
        const player2HandDeck           = this.deckContainer.decks[DecksId.PLAYER_2_HAND_DECK];
        const player1MinionDeck         = this.deckContainer.decks[DecksId.PLAYER_1_MINION_DECK];
        const player2MinionDeck         = this.deckContainer.decks[DecksId.PLAYER_2_MINION_DECK];
        const graveYardDeck             = this.deckContainer.decks[DecksId.GRAVEYARD_DECK];
        const eventDeck                 = this.deckContainer.decks[DecksId.EVENT_DECK];
        const josephDeck                = this.deckContainer.decks[DecksId.JOSEPH_DECK]
        const player1PreparingEventDeck = this.deckContainer.decks[DecksId.PLAYER_1_PREPARING_EVENT_DECK];
        const player2PreparingEventDeck = this.deckContainer.decks[DecksId.PLAYER_2_PREPARING_EVENT_DECK];
        const player1ActiveMinionDeck   = this.deckContainer.decks[DecksId.PLAYER_1_ACTIVE_MINION_DECK];
        const player2ActiveMinionDeck   = this.deckContainer.decks[DecksId.PLAYER_2_ACTIVE_MINION_DECK];
        const buttonContainer           = this.buttonContainer;
        const player1ActiveEvents       = this.eventContainer.events[TurnId.PLAYER_1];
        const player1Name               = localStorage.getItem("username");
        const player2Name               = document.getElementById("player_list").value;

        let turnCounter = 0
        const turn1 = new Turn(this.gridArray, hero1, hero2, player1HandDeck, player2HandDeck, player1MinionDeck, player2MinionDeck, graveYardDeck, eventDeck, player1PreparingEventDeck, player2PreparingEventDeck, player1ActiveMinionDeck, player2ActiveMinionDeck, buttonContainer, eventContainer, TurnId.PLAYER_1, player1Name, josephDeck, soundManager);
        turn1.createPhases(mouse, this.gridArray.grids, this.deckContainer.decks, turnCounter++);
        const turn2 = new Turn(this.gridArray, hero2, hero1, player2HandDeck, player1HandDeck, player2MinionDeck, player1MinionDeck, graveYardDeck, eventDeck, player2PreparingEventDeck, player1PreparingEventDeck, player2ActiveMinionDeck, player1ActiveMinionDeck, buttonContainer, eventContainer, TurnId.PLAYER_2, player2Name, josephDeck, soundManager);
        turn2.createPhases(mouse, this.gridArray.grids, this.deckContainer.decks, turnCounter);

        this.turnContainer = [turn1, turn2]; //player 1 pos 0, player 2 pos 1;
    }  

    render(ctx, language, mouse, currentTurn){
        const xPos = IconsPos.PLAYER_NAME_X[0]
        const yPos = IconsPos.PLAYER_NAME_Y[0]
        const enemyXpos = IconsPos.PLAYER_NAME_X[1]
        const enemyYpos = IconsPos.PLAYER_NAME_Y[1]
        
        const turn = this.turnContainer[currentTurn]
        const pos = (currentTurn+1)%2
        const enemyTurn = this.turnContainer[pos]

        // El contador de acciones es el del turno activo. Entre un turno y el siguiente no hay ninguno activo: se queda el
        // del que acaba de terminar hasta que empieza el nuevo, como el reloj, y al principio de la partida el del primero
        const activeTurn = this.turnContainer.find((other) => other.active);

        if (activeTurn !== undefined){

            this.actionsTurn = activeTurn;
        }

        const actionsTurn = this.actionsTurn ?? turn;
        turn.isShowingActions = actionsTurn === turn;
        enemyTurn.isShowingActions = actionsTurn === enemyTurn;

        turn.render(ctx, language, currentTurn, xPos, yPos, mouse, currentTurn)
        enemyTurn.render(ctx, language, pos, enemyXpos, enemyYpos, mouse, currentTurn)

        // El tooltip de los medallones de los esbirros, salvo con una carta ampliada
        const minionDecks = [turn.activeMinionDeck, enemyTurn.activeMinionDeck];
        const decks = [...minionDecks, turn.handDeck, enemyTurn.handDeck, turn.preparingEventDeck, enemyTurn.preparingEventDeck];

        if (!turn.activeMinionDeck.isAnyCard(decks, CardId.SCALED)[0]){

            requestMinionEffectTooltip(this.eventContainer, minionDecks, mouse);
        }
    }

    
}