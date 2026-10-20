import { BoardId, DecksId, GridId, ImageTypes, RarityId, TurnId } from "./constants.js";
import globals from "./globals.js";
import Grid from "./Grid.js";

export default class Board{

    constructor(grids){
       
        this.grids              = grids;
        this.boardMinions       = [];
    }
    
    // Funcion inicializa Board del juego
    static initBoard(canvas){

        const modifyer = 40;

        // Atributos del Grid de Board
        const boardRows = 7;
        const boardColumns = 5;
        const boardSlotXSize = 133;
        const boardSlotYSize = 155;
        const boardXPos = canvas.width / 2 - boardRows * boardSlotXSize / 2;
        const boardYPos = canvas.height / 2.3 - boardColumns * boardSlotYSize / 2 - modifyer;

        // Atributos de los Grids de Eventos
        const eventRows = 3;
        const eventColumns = 3;
        const eventSlotXSize = 92.667;
        const eventSlotYSize = 92.833;
        const eventSlotsGap = 4;
        const eventBoardXPos = 1617;
        const eventBoardAtackerYPos = 530.5;
        const eventBoardDefenderYPos = 240;

        // Atributos de los Grids de Hand
        const handRows = 5;
        const handColumns = 1;
        const handSlotXSize = 197.6;
        const handSlotYSize = 303.2;
        const handXPos = canvas.width / 2 - handRows * handSlotXSize / 2;
        const handAtackerYpos = canvas.height - handColumns * handSlotYSize / 1.7 - modifyer;
        const handDefenderYpos = -handSlotYSize / 1.3 - modifyer;

        // Crear Grid de Board
        const board = Grid.initGrids(boardXPos, boardYPos, boardRows, boardColumns, GridId.BOARD_GRID, boardSlotXSize, boardSlotYSize);

        // Crear Grid de Eventos Atacante
        const eventBoardAtacker = Grid.initGrids(eventBoardXPos, eventBoardAtackerYPos, eventRows, eventColumns, GridId.PLAYER_1_EVENT_GRID, eventSlotXSize, eventSlotYSize, eventSlotsGap, eventSlotsGap);
        
        // Crear Grid de Board Defensor
        const eventBoardDefender = Grid.initGrids(eventBoardXPos, eventBoardDefenderYPos, eventRows, eventColumns, GridId.PLAYER_2_EVENT_GRID, eventSlotXSize, eventSlotYSize, eventSlotsGap, eventSlotsGap);

        // Crear Grid de Hand Atacante
        const handAtacker = Grid.initGrids(handXPos, handAtackerYpos, handRows, handColumns, GridId.PLAYER_1_HAND_GRID, handSlotXSize, handSlotYSize);

        // Crear Grid de Hand Defensor
        const handDefender = Grid.initGrids(handXPos, handDefenderYpos, handRows, handColumns, GridId.PLAYER_2_HAND_GRID, handSlotXSize, handSlotYSize);

        // Crear Arrays de Grids
        const grids = [board, eventBoardAtacker, eventBoardDefender, handAtacker, handDefender];

        return new Board(grids);
    }

    deselect(){

        for (let i = 0; i < this.grids.length; i++){

            const grid = this.grids[i];
            grid.deselect();
        }
    }

    render(images, ctx, canvas, deckContainer, currentTurn) {

        ctx.font = "30px LongaIberica-DEMO";
        
        let image = images[ImageTypes.BOARD_IMAGE][BoardId.BOARD];
        let xPos = 0;
        let yPos = 0;

        ctx.drawImage(

            image, xPos, yPos
        )
        let deckLength = deckContainer.decks[DecksId.EVENT_DECK].cards.length
            if ( deckLength > 40) {
                image = images[ImageTypes.BOARD_IMAGE][BoardId.EVENT_DECK_FULL];  
            } else if (deckLength >1) {
                image = images[ImageTypes.BOARD_IMAGE][BoardId.EVENT_DECK_HALF];  

            } else if(deckLength === 1){
                image = images[ImageTypes.BOARD_IMAGE][BoardId.EVENT_DECK_EMPTY];  
            } else {
                image = undefined
            }
            if (image!= undefined) {
                const eventDeckScale = 0.82;
                const eventDeckWidth = image.width * eventDeckScale;
                const eventDeckHeight = image.height * eventDeckScale;
                xPos = 149 - eventDeckWidth / 2;
                yPos = canvas.height / 2 - eventDeckHeight / 2;
                ctx.drawImage(image, xPos, yPos, eventDeckWidth, eventDeckHeight)
            }

         const deck = currentTurn === TurnId.PLAYER_1 ? deckContainer.decks[DecksId.PLAYER_2_MINION_DECK].cards : 
                                                       deckContainer.decks[DecksId.PLAYER_1_MINION_DECK].cards

        const activeDeck = currentTurn === TurnId.PLAYER_1 ? deckContainer.decks[DecksId.PLAYER_2_ACTIVE_MINION_DECK].cards : 
                                                             deckContainer.decks[DecksId.PLAYER_1_ACTIVE_MINION_DECK].cards                                               

        if ( deck.length > 13) {
                image = images[ImageTypes.BOARD_IMAGE][BoardId.MINION_DECK_FULL];  
            } else if (deck.length >1) {
                image = images[ImageTypes.BOARD_IMAGE][BoardId.MINION_DECK_HALF];  

            } else if(deck.length === 1){
                image = images[ImageTypes.BOARD_IMAGE][BoardId.MINION_DECK_EMPTY];  
            } else {
                image = undefined
            }
            if (image!= undefined) {
                this.renderMinionDeck(ctx, image, images[ImageTypes.BOARD_IMAGE][BoardId.DECK_FRAME_TOP], 5, 112)
            }

            const enemyDeck = currentTurn === TurnId.PLAYER_1 ? deckContainer.decks[DecksId.PLAYER_1_MINION_DECK].cards : 
                                                                 deckContainer.decks[DecksId.PLAYER_2_MINION_DECK].cards

            const enemyActiveDeck = currentTurn === TurnId.PLAYER_1 ? deckContainer.decks[DecksId.PLAYER_1_ACTIVE_MINION_DECK].cards : 
                                                                      deckContainer.decks[DecksId.PLAYER_2_ACTIVE_MINION_DECK].cards  

            if ( enemyDeck.length > 13) {
                image = images[ImageTypes.BOARD_IMAGE][BoardId.MINION_DECK_FULL];  
            } else if (enemyDeck.length >1) {
                image = images[ImageTypes.BOARD_IMAGE][BoardId.MINION_DECK_HALF];  

            } else if(enemyDeck.length === 1){
                image = images[ImageTypes.BOARD_IMAGE][BoardId.MINION_DECK_EMPTY];  
            } else {
                image = undefined
            }
            if (image!= undefined) {
                this.renderMinionDeck(ctx, image, images[ImageTypes.BOARD_IMAGE][BoardId.DECK_FRAME_BOTTOM], 845, 953)
            }

        image = images[ImageTypes.BOARD_IMAGE][BoardId.GEM];
        xPos = 265;
        yPos = 40;

        ctx.drawImage(
            image, xPos, yPos
        )

        let hp = 0
        let decks =[deck, activeDeck]
        for (let j = 0; j < decks.length; j++) {
            const deck = decks[j];
            for (let i = 0; i < deck.length; i++) {
                const card = deck[i];
                hp += card.health
            }
        }
        this.renderGemHealth(ctx, hp, image.width / 2 + xPos, image.height / 2 + yPos);
        image = images[ImageTypes.BOARD_IMAGE][BoardId.GEM];
        xPos = 265;
        yPos = 920;

        ctx.drawImage(

            image, xPos, yPos
        )
        hp=0
        let enemyDecks =[enemyDeck, enemyActiveDeck]
        for (let j = 0; j < enemyDecks.length; j++) {
            const deck = enemyDecks[j];
            for (let i = 0; i < deck.length; i++) {
                const card = deck[i];
                hp += card.health
            }
        }
        this.renderGemHealth(ctx, hp, image.width / 2 + xPos, image.height / 2 + yPos);

        image = images[ImageTypes.GAME_RARITY][RarityId.COMMON];
        xPos = 1600;
        yPos = 22;

        ctx.drawImage(

            image, xPos, yPos
        )

            this.renderGrids(ctx)

    }

    // El mazo queda bajo el lado derecho del marco de su hueco y asoma por la izquierda
    renderMinionDeck(ctx, image, frame, frameYPos, centerYPos) {

        const width = 152;
        const height = 172;

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = -4;
        ctx.shadowOffsetY = 5;
        ctx.drawImage(image, 236 - width, centerYPos - height / 2, width, height);
        ctx.restore();

        ctx.drawImage(frame, 55, frameYPos);
    }

    renderGemHealth(ctx, hp, xPos, yPos) {

        ctx.save();
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
        ctx.strokeText(hp, xPos, yPos);
        ctx.fillStyle = "white";
        ctx.fillText(hp, xPos, yPos);
        ctx.restore();
    }

    renderGrids(ctx) {

        // Cantidad de Grids que se van a renderizar
        const gridsLength = this.grids.length;

        for (let i = 0; i < gridsLength; i++) {
            if (this.grids[i].id != GridId.PLAYER_1_HAND_GRID &&this.grids[i].id != GridId.PLAYER_2_HAND_GRID) {
                this.grids[i].render(ctx)
                
            }
        }
    }
}