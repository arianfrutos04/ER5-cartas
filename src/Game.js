import Card from "./Cards/Card.js";
import { BoardId, BorderId, CardId, CardImageId, DecksId, ButtonImageId, GameState, GridId, IconsId, IconsPos, ImageTypes, LanguageId, RarityId, TypeId, TurnStates, SlotsState, TurnId, ButtonState, TimerId, PhaseStates, BaseURL, BaseURLValue, MessageState, MessageType, ButttonsId, Sound, renderState } from "./constants.js";
import Board from "./Board.js";
import Asset from "./Asset.js";
import globals from "./globals.js";
import CardFactory from "./Cards/CardFactory.js";
import DeckContainer from "./Cards/DeckContainer.js";
import TurnContainer from "./Turns/TurnContainer.js";
import Mouse from "./Mouse.js";
import Button from "./Button/Button.js";
import ButtonContainer from "./Button/ButtonContainer.js";
import MessagesContainer from "./MessagesContainer.js";
import EventContainer from "./Events/EventContainer.js";
import TimerContainer from "./TimerContainer.js";
import Messages from "./Messages.js";
import ParticlesContainer from "./ParticlesContainer.js";
import SoundManager from "./SoundManager.js";
import Menu from "./Menu.js";
import QuickHelp from "./QuickHelp.js";
import GameOverScreen from "./GameOverScreen.js";

// Al cambiar de turno el cartel entra primero y, con el velo ya oscuro, el tablero cambia de lado: los esbirros y
// personajes pasan a su nuevo sitio y las manos y los eventos preparados cruzan el tablero hacia el suyo
const TURN_SWAP_DELAY       = 0.3;
const CARD_FLIGHT_DURATION  = 0.7;
const CARD_FLIGHT_DELAY     = 0.05;
const CARD_FLIGHT_STAGGER   = 0.06;
const PIECE_OPEN_DURATION   = 0.35;
const PIECE_OPEN_STAGGER    = 0.05;

export default class Game {

    constructor(turnArray, images, language, deckContainer, gridsArray, eventContainer, rarity,canvas, ctx, mouse, firstTurn, messagesContainer, timerContainer, particlesContainer, soundManager, menu) {

        this.turnContainer = turnArray;
        this.images = images;
        this.language = language;
        this.deckContainer = deckContainer;
        this.gridsArray = gridsArray;
        this.eventContainer = eventContainer;
        this.turnCounter = 0;
        this.flyingDecks = [];
        this.turnSwapTime = 0;                          // Tiempo que falta para que el tablero cambie de lado
        this.swapPieces = [];                           // Esbirros y personajes que se dan la vuelta al cambiar de lado
        this.swapTime = 0;
        this.rarity = rarity;
        this.gameState = GameState.LOAD_GAME;
        this.canvas = canvas;
        this.ctx = ctx;
        this.mouse = mouse;
        this.currentTurn = firstTurn;
        this.messagesContainer = messagesContainer;
        this.timerContainer = timerContainer;
        this.finished = false;
        this.particlesContainer = particlesContainer;
        this.soundManager = soundManager;
        this.menu = menu;
        this.game = 0;
        this.tutorial = 0;
    }

    static init(data, canvas, ctx, language) {

        const board = Board.initBoard(canvas);
        const assets = Asset.create();
        assets.loadImages(data);
        const cardImgs = assets.images
        const deckContainer = new DeckContainer();
        const eventContainer = new EventContainer()
        deckContainer.createDecks(data, cardImgs, language);

        const buttonContainer = ButtonContainer.create(ctx, assets.images[ImageTypes.BUTTON].slice(ButtonImageId.NORMAL, ButtonImageId.MENU_PANEL), assets.images[ImageTypes.BUTTON_ICONS]);
        const soundManager = SoundManager.create()
        soundManager.loadSounds()
        const turns = new TurnContainer(board, deckContainer, buttonContainer, eventContainer);
        const mouse = new Mouse(canvas);
        mouse.assignAddEventListeners();
        const messages = new MessagesContainer();
        messages.createHelpMessages();

        const firstTurn = Math.floor(Math.random()*2);
        turns.CreateTurns(mouse, eventContainer, soundManager);

        console.log(turns.turnContainer);

        const timerContainer = new TimerContainer();
        timerContainer.create();

        const particlesContainer = new ParticlesContainer();
        
        const menuXSize = 400;
        const menuYSize = 200;
        const menuXPos  = canvas.width / 2 - menuXSize / 2;
        const menuYpos  = canvas.height / 2 - menuYSize / 2;
        
        const menu = new Menu(menuXPos, menuYpos, menuXSize, menuYSize, assets.images[ImageTypes.BUTTON][ButtonImageId.MENU_PANEL]);

        return new Game(turns, assets, language, deckContainer, board, eventContainer, null, canvas, ctx, mouse, firstTurn, messages, timerContainer, particlesContainer, soundManager, menu);
    }

    update() {
        switch (this.gameState) {

            case GameState.LOAD_GAME:
                for (let i = 0; i < 2; i++) {
                    this.assignCardsToHand(this.deckContainer.decks[DecksId.EVENT_DECK], this.deckContainer.decks[DecksId.PLAYER_1_HAND_DECK+i]);
                    this.turnContainer.turnContainer[i].mainCharacter.xPos = IconsPos.PLAYER_X[i]
                    this.turnContainer.turnContainer[i].mainCharacter.yPos = IconsPos.PLAYER_Y[i]
                }

                // Funcion que Spawnea los Minions en el tablero
                this.assignMinionsToBoardGrid(this.deckContainer.decks[DecksId.PLAYER_1_ACTIVE_MINION_DECK], this.deckContainer.decks[DecksId.PLAYER_2_ACTIVE_MINION_DECK], this.gridsArray.grids[GridId.BOARD_GRID]);

                this.turnContainer.turnContainer[this.currentTurn].handDeck.cards
                for (let i = 0; i < this.turnContainer.turnContainer[(this.currentTurn +1) %2].handDeck.cards.length; i++) {
                    const card = this.turnContainer.turnContainer[(this.currentTurn+1) %2].handDeck.cards[i];
                    card.state = CardId.BLOCKED
                }
                const turn = this.turnContainer.turnContainer[this.currentTurn];
                const enemyTurn = this.turnContainer.turnContainer[(this.currentTurn+1)%2];

                this.assignCardsToGrids(turn.handDeck, this.gridsArray.grids[GridId.PLAYER_1_HAND_GRID])
                this.assignCardsToGrids(turn.preparingEventDeck, this.gridsArray.grids[GridId.PLAYER_1_EVENT_GRID])
                turn.phasesArray[PhaseStates.PREPARE_EVENT].setEventGrid(this.gridsArray.grids[GridId.PLAYER_1_EVENT_GRID])
                turn.phasesArray[PhaseStates.USE_EVENT_CARD].setEventGrid(this.gridsArray.grids[GridId.PLAYER_1_EVENT_GRID])

                this.assignCardsToGrids(enemyTurn.handDeck, this.gridsArray.grids[GridId.PLAYER_2_HAND_GRID])
                this.assignCardsToGrids(enemyTurn.preparingEventDeck, this.gridsArray.grids[GridId.PLAYER_2_EVENT_GRID])
                enemyTurn.phasesArray[PhaseStates.PREPARE_EVENT].setEventGrid(this.gridsArray.grids[GridId.PLAYER_2_EVENT_GRID])
                enemyTurn.phasesArray[PhaseStates.USE_EVENT_CARD].setEventGrid(this.gridsArray.grids[GridId.PLAYER_2_EVENT_GRID])

                if (this.currentTurn === 1) {
                    this.rotateBoardMinions()
                    this.rotateMainCharacters()
                }

                if (this.images.isLoaded && this.soundManager.isLoaded) {

                    this.gameState = GameState.PLAYING
                    this.soundManager.sounds[Sound.GAME_MUSIC].play()
                    this.soundManager.sounds[Sound.GAME_MUSIC].volume = 0.4
                }
                
                break;

            case GameState.PLAYING:
                const state = this.menu.update(this.turnContainer.buttonContainer, this.gameState);
                
                this.turnContainer.buttonContainer.state = state[0];
                this.gameState = state[1];
                this.updateGame();
                this.soundManager.gameState = this.gameState
                this.soundManager.playSound()

                // Mientras el turno espera para cerrarse no se amplian cartas ni vuelven los tooltips
                if (!this.turnContainer.turnContainer[this.currentTurn].isWaitingToEnd()){

                    this.deckContainer.updateScale(this.mouse, this.turnContainer.turnContainer[this.currentTurn].state, this.messagesContainer, this.language);
                }

                this.turnContainer.buttonContainer.updateButtons(this.mouse, this.turnContainer.turnContainer[this.currentTurn], this.timerContainer.timer[TimerId.TURN_TIMER]);

                // Mientras entra el cartel ningun turno avanza
                if (this.turnSwapTime <= 0){

                    this.turnContainer.turnContainer[this.currentTurn].update(this.mouse, this.turnContainer.turnContainer[(this.currentTurn+1)%2].activeMinionDeck, this.messagesContainer, this.timerContainer, this.particlesContainer);
                }

                this.mouse.update();
                this.particlesContainer.update();
                
                if(this.turnContainer.turnContainer[this.currentTurn].activeMinionDeck.cards.length +
                   this.turnContainer.turnContainer[this.currentTurn].minionDeck.cards.length === 0 ||
                   this.turnContainer.turnContainer[this.currentTurn].hasWon()){
                    this.gameState = GameState.SEND_DATA;
                }else{
                    if(this.turnContainer.turnContainer[this.currentTurn].finished){
                        this.turnContainer.turnContainer[this.currentTurn].finished = false
                        this.turnContainer.turnContainer[this.currentTurn].state = TurnStates.INITIALIZE;


                        const name = this.turnContainer.turnContainer[(this.currentTurn + 1) % 2].name.toUpperCase()
                        const message = new Messages(1000, 490, [name + "'S TURN", this.getBasqueTurnText(name)], MessageType.CHANGE_TURN_MESSAGE, MessageState.APPEAR, 0.3, 0.2, 1.3, 100);
                        this.messagesContainer.changeTurnMessage.push(message)
                        this.turnSwapTime = TURN_SWAP_DELAY;
                        this.startPieceSwap();
                    }

                    // El tablero cambia de lado cuando el velo del cartel ya ha entrado
                    if (this.turnSwapTime > 0){

                        this.turnSwapTime -= globals.deltaTime;

                        if (this.turnSwapTime <= 0){

                            this.currentTurn = (this.currentTurn + 1) % 2;
                            this.setTurnDecksPositions()
                            this.turnCounter++;
                        }
                    }
                    this.messagesContainer.update();
                }

                break;

            case GameState.GAMEOVER:
                if (this.finished && this.mouse.leftClick){
                    document.location.reload();
                }
                break;

            case GameState.SEND_DATA:
                this.sendStatsData();
                this.gameState = GameState.GAMEOVER;
                break;

            case GameState.MENU:
                
                this.turnContainer.buttonContainer.updateButtons(this.mouse, this.turnContainer.turnContainer[this.currentTurn], this.timerContainer.timer[TimerId.TURN_TIMER]);
                this.soundManager.gameState = this.gameState
                this.soundManager.playSound()
                this.mouse.update();

                const states = this.menu.update(this.turnContainer.buttonContainer, this.gameState);
                    
                this.turnContainer.buttonContainer.state = states[0];
                this.gameState = states[1];
                break;

            case GameState.QUICK_HELP:
                this.soundManager.gameState = this.gameState
                this.soundManager.playSound()
                this.turnContainer.buttonContainer.updateButtons(this.mouse, this.turnContainer.turnContainer[this.currentTurn], this.timerContainer.timer[TimerId.TURN_TIMER]);
                this.mouse.update();
                this.changeHelpImage();
                
                this.returnToGameIfBtnSelected();
                break;

            default:

                break;
        }
    }


    render() {

        switch (this.gameState) {
            case GameState.LOAD_GAME:
                //draw load spinner
                break;

            case GameState.MENU:
            case GameState.PLAYING:
                this.renderGame();
                break;
            
            case GameState.QUICK_HELP:
                this.renderHelp();
                break;

            case GameState.GAMEOVER:

                this.renderGameOver();
                break;
            default:
                
                break;

        }
    }

    renderGame() {

        const images = this.images.images
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Funcion para renderizar Board
        this.gridsArray.render(images, this.ctx, this.canvas, this.deckContainer, this.currentTurn);
        this.timerContainer.render(this.ctx, this.turnContainer.turnContainer[this.currentTurn].phaseState);
        this.messagesContainer.renderHelp(this.ctx, this.language);
        this.particlesContainer.renderBelowCards(this.ctx);
        this.menu.render(this.ctx, this.turnContainer.buttonContainer.container[ButttonsId.BTN_RETURN_TO_MENU], this.gameState, this.language);
        this.turnContainer.buttonContainer.renderButtons(this.language, this.gameState === GameState.MENU ? this.menu.previousState : undefined);
        this.turnContainer.render(this.ctx, this.language, this.mouse, this.currentTurn);
        this.particlesContainer.renderAboveCards(this.ctx);
        // Mientras se ve el cartel de turno, las cartas que cambian de sitio pasan por delante del velo y por detras de la banda
        this.messagesContainer.renderDamageAndChangeTurn(this.ctx, this.language, () => this.renderFlyingCards());

        if (this.gameState === GameState.MENU){

            this.menu.render(this.ctx, this.turnContainer.buttonContainer.container[ButttonsId.BTN_RETURN_TO_MENU], undefined, this.language);
            this.turnContainer.buttonContainer.renderButtons(this.language);
        }
    }

    renderGameOver(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // El fondo cubre el canvas apoyado en su borde inferior
        const background = this.images.images[ImageTypes.BOARD_IMAGE][BoardId.GAME_OVER];
        const backgroundScale = Math.max(this.canvas.width / background.width, this.canvas.height / background.height);
        const backgroundWidth = background.width * backgroundScale;
        const backgroundHeight = background.height * backgroundScale;
        this.ctx.drawImage(background, (this.canvas.width - backgroundWidth) / 2, this.canvas.height - backgroundHeight, backgroundWidth, backgroundHeight);

        GameOverScreen.render(this.ctx, this.images.images[ImageTypes.BOARD_IMAGE][BoardId.GAME_OVER_PANEL], this.game, this.language);
    }
    
    renderHelp(){
        this.ctx.filter = "blur(3px)";
        this.renderGame()
        this.ctx.filter = "blur(0px)";
        const images = this.images.images[ImageTypes.QUICK_HELP]
        this.ctx.drawImage(QuickHelp.getImage(images, this.tutorial, this.language), 0, 0)
        QuickHelp.render(this.ctx, this.tutorial, this.language)
    }

    updateGame() {

        // Funcion para cambio de idioma
        this.changeLanguage();

        //Tutoriales
        this.showHelpIfBtnSelected();

        // Funcion que posiciona las Cards en la posicion de los Slots
        this.updateCardFlights();
        this.updatePieceSwap();
        const turn = this.turnContainer.turnContainer[this.currentTurn];
        const enemyTurn = this.turnContainer.turnContainer[(this.currentTurn+1)%2];

        this.assignCardsToGrids(turn.handDeck, this.gridsArray.grids[GridId.PLAYER_1_HAND_GRID])
        this.assignCardsToGrids(enemyTurn.handDeck, this.gridsArray.grids[GridId.PLAYER_2_HAND_GRID])
        this.assignCardsToGrids(turn.preparingEventDeck, this.gridsArray.grids[GridId.PLAYER_1_EVENT_GRID])
        this.assignCardsToGrids(enemyTurn.preparingEventDeck, this.gridsArray.grids[GridId.PLAYER_2_EVENT_GRID])

        //this.updateTurns(); ---> test de cambio de turnos
    }

    changeLanguage(){

        const button = this.turnContainer.buttonContainer.container[ButttonsId.BTN_CHANGE_LANGUAGE];

        if (button.state === ButtonState.SELECTED){

            this.language = this.language === LanguageId.ENG ? LanguageId.EUS : LanguageId.ENG;
            button.state = ButtonState.NOT_SELECTED;
        }
    }

    showHelpIfBtnSelected(){
        const button = this.turnContainer.buttonContainer.container[ButttonsId.BTN_QUICK_HELP];

        if (button.state === ButtonState.SELECTED){
            this.gameState = GameState.QUICK_HELP;
            this.turnContainer.buttonContainer.previousState = this.turnContainer.buttonContainer.state
            for (let i = 0; i < this.turnContainer.buttonContainer.container.length; i++) {
                const element = this.turnContainer.buttonContainer.container[i];
                element.state = ButtonState.NOT_SELECTED;
                
            }
            this.turnContainer.buttonContainer.state = renderState.QUICK_HELP;
            button.state = ButtonState.NOT_SELECTED;
        }
    }

    changeHelpImage(){
        const left = this.turnContainer.buttonContainer.container[ButttonsId.BTN_LEFT];
        const right = this.turnContainer.buttonContainer.container[ButttonsId.BTN_RIGHT];

        if (left.state === ButtonState.SELECTED){
            this.tutorial--;
            if (this.tutorial < 0) {
                this.tutorial = 0;
            }
            left.state = ButtonState.NOT_SELECTED;
        }

        if (right.state === ButtonState.SELECTED){
            this.tutorial++;
            if (this.tutorial > 4) {
                this.tutorial = 4;
            }
            right.state = ButtonState.NOT_SELECTED;
        }
    }

    returnToGameIfBtnSelected(){
        const button = this.turnContainer.buttonContainer.container[ButttonsId.BTN_LEAVE_QUICK_HELP];

        if (button.state === ButtonState.SELECTED){
            this.gameState = GameState.PLAYING;
            this.turnContainer.buttonContainer.state = this.turnContainer.buttonContainer.previousState;
            this.turnContainer.buttonContainer.previousState = this.turnContainer.buttonContainer.state
            this.tutorial--;
            if (this.tutorial < 0) {
                this.tutorial = 0;
            }
            button.state = ButtonState.NOT_SELECTED;
        }
    }
    // Funcion que roba las Cards del EventDeck y las asigna al HandDeck
    assignCardsToHand(eventDeck, handDeck) {
        for (let i = handDeck.cards.length; i < 5; i++) {
            const card = eventDeck.cards[eventDeck.cards.length - 1 ]
            if (card.id === CardImageId.JOSEPH) {
                i--
                eventDeck.shuffle()
            }else{
                handDeck.cards.push(card);
                card.deck = handDeck
                eventDeck.cards.pop();
            }

        }
    }

    assignMinionsToActiveMinionsDeck(minionDeck, activeMinionDeck) {

        for (let i = activeMinionDeck.length; i < 3; i++) {

            for (let j = 0; j < minionDeck.cards.length; j++){

                if (minionDeck.cards[j].name[LanguageId.ENG] === "Villager"){

                    activeMinionDeck.push(minionDeck.cards[j]);
                    minionDeck.cards.splice(minionDeck.cards[j], 1);
                    break;
                }
            }
        }
    }

    assignMinionsToBoardGrid(player1ActiveMinionDeck, player2ActiveMinionDeck, boardGrid) {

        const decks = [player1ActiveMinionDeck, player2ActiveMinionDeck];

        let counter = 0;

        for (let i = 0; i < decks.length; i++) {

            counter = 0;

            const boardPos = i === 0 ? 4 : 0;

            for (let j = 0; j < decks[i].cards.length; j++){

                if (decks[i].cards[j] != undefined) {

                    const card = decks[i].cards[j];

                    card.xPos = boardGrid.slots[boardPos][2 + counter].xPos;
                    card.yPos = boardGrid.slots[boardPos][2 + counter].yPos;
                    card.size = BorderId.SMALL_SIZE;
                    counter++;
                }
            }
        }
    }

    // Las cartas van hacia su Slot poco a poco, o siguen su animacion si estan cambiando de sitio con el turno
    assignCardsToGrids(decks, grids) {

        let k = 0;

        for (let i = 0; i < grids.slots.length; i++){

            for (let j = 0; j < grids.slots[0].length; j++){

                if (decks.cards[k]){

                    if (decks.cards[k].flight !== undefined){

                        this.flyCard(decks.cards[k], grids.slots[i][j]);
                    }

                    else{

                        decks.cards[k].xPos = this.moveTowards(decks.cards[k].xPos, grids.slots[i][j].xPos, 900);
                        decks.cards[k].yPos = this.moveTowards(decks.cards[k].yPos, grids.slots[i][j].yPos, 1000);
                    }

                    grids.slots[i][j].isEmpty = false;
                    k++
                }
            }
        }
    }

    // Cada carta sale desde donde esta y va hacia su Slot un poco despues que la anterior, como al repartir
    startCardFlights(decks){

        this.flyingDecks = decks;

        for (let i = 0; i < decks.length; i++){

            for (let j = 0; j < decks[i].cards.length; j++){

                const card = decks[i].cards[j];
                card.flight = { xStart: card.xPos, yStart: card.yPos, time: -(CARD_FLIGHT_DELAY + j * CARD_FLIGHT_STAGGER) };
            }
        }
    }

    // Las cartas en vuelo llevan debajo una sombra del tamano de su Slot, para que se vea que pasan por encima
    renderFlyingCards(){

        const grids = [GridId.PLAYER_2_HAND_GRID, GridId.PLAYER_2_EVENT_GRID, GridId.PLAYER_1_HAND_GRID, GridId.PLAYER_1_EVENT_GRID];

        for (let i = 0; i < this.flyingDecks.length; i++){

            const slot = this.gridsArray.grids[grids[i]].slots[0][0];
            const cards = this.flyingDecks[i].cards;

            this.ctx.save();
            this.ctx.filter = "blur(10px)";
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";

            for (let j = 0; j < cards.length; j++){

                if (cards[j].flight !== undefined && cards[j].flight.time > 0){

                    this.ctx.fillRect(cards[j].xPos + 8, cards[j].yPos + 14, slot.xSize, slot.ySize);
                }
            }

            this.ctx.restore();
            this.flyingDecks[i].renderCards(this.ctx, this.language, this.mouse);
        }
    }

    startPieceSwap(){

        const turns = this.turnContainer.turnContainer;

        this.swapPieces = [...turns[this.currentTurn].activeMinionDeck.cards, ...turns[(this.currentTurn + 1) % 2].activeMinionDeck.cards, turns[0].mainCharacter, turns[1].mainCharacter];
        this.swapTime = 0;
    }

    // Se cierran todos a la vez mientras entra el velo y, ya en su nuevo sitio, se abren uno tras otro
    updatePieceSwap(){

        if (this.swapPieces.length === 0){

            return;
        }

        this.swapTime += globals.deltaTime;

        let isSwapOver = true;

        for (let i = 0; i < this.swapPieces.length; i++){

            const piece = this.swapPieces[i];

            if (this.swapTime < TURN_SWAP_DELAY){

                piece.swapScale = Math.cos(this.swapTime / TURN_SWAP_DELAY * Math.PI / 2);
                isSwapOver = false;
            }

            else{

                const progress = (this.swapTime - TURN_SWAP_DELAY - i * PIECE_OPEN_STAGGER) / PIECE_OPEN_DURATION;

                piece.swapScale = Math.sin(Math.min(1, Math.max(0, progress)) * Math.PI / 2);
                isSwapOver = isSwapOver && progress >= 1;
            }
        }

        if (isSwapOver){

            this.swapPieces.forEach((piece) => piece.swapScale = undefined);
            this.swapPieces = [];
        }
    }

    updateCardFlights(){

        for (let i = 0; i < this.flyingDecks.length; i++){

            for (let j = 0; j < this.flyingDecks[i].cards.length; j++){

                const card = this.flyingDecks[i].cards[j];

                if (card.flight !== undefined){

                    card.flight.time += globals.deltaTime;
                }
            }
        }
    }

    // Recorrido con aceleracion y frenada suaves hasta el Slot
    flyCard(card, slot){

        const progress = Math.min(1, Math.max(0, card.flight.time / CARD_FLIGHT_DURATION));
        const eased = progress < 0.5 ? 4 * Math.pow(progress, 3) : 1 - Math.pow(2 - 2 * progress, 3) / 2;

        card.xPos = card.flight.xStart + (slot.xPos - card.flight.xStart) * eased;
        card.yPos = card.flight.yStart + (slot.yPos - card.flight.yStart) * eased;

        if (progress >= 1){

            card.flight = undefined;
        }
    }

    // Avanza hacia la posicion destino, mas despacio en los ultimos 20 px, y se detiene justo en ella
    moveTowards(position, target, speed) {

        const distance = target - position;
        const step = (Math.abs(distance) <= 20 ? 50 : speed) * globals.deltaTime;

        if (Math.abs(distance) <= step){

            return target;
        }

        return position + Math.sign(distance) * step;
    }

    // Genitivo del nombre en euskera: -REN si acaba en vocal y -EN si acaba en consonante.
    // Si acaba en numero cuenta como se pronuncia su final
    getBasqueTurnText(name) {

        const lastChar = name.charAt(name.length - 1);
        const number = name.match(/[0-9]+$/);

        if (number) {

            return name + "-" + (this.basqueNumberEndsInConsonant(number[0]) ? "EN" : "REN") + " TXANDA";
        }

        if (/[AEIOUÁÉÍÓÚÜ]/.test(lastChar)) {

            return name + "REN TXANDA";
        }

        if (/[A-ZÑÇ]/.test(lastChar)) {

            return name + "EN TXANDA";
        }

        return "TXANDA: " + name;
    }

    // bat (1), bost (5), hamar (10, 30, 50, 70, 90) y ehun (100) acaban en consonante; mila (1000) y el resto, en vocal
    basqueNumberEndsInConsonant(number) {

        const value = Number(number);

        if (value % 1000 === 0 && value > 0) {

            return false;
        }

        if (value % 100 === 0 && value > 0) {

            return true;
        }

        if (value % 10 === 0) {

            return Math.floor(value / 10) % 2 === 1;
        }

        return value % 10 === 1 || value % 10 === 5;
    }

    // funcion para realizar el movimiento
    moveCard(card, slot){

        let speedX = 800;
        let speedY = 800;
        
        const xDistance = card.xPos - slot.xPos;
        const yDistance = card.yPos - slot.yPos;
        const distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
        const vX = speedX * (xDistance / distance);
        const vY = speedY * (yDistance / distance);

        if (distance < 10){
            
            card.xPos = slot.xPos;
            card.yPos = slot.yPos;
            slot.isEmpty = false;
        } else {
            card.xPos -= vX * globals.deltaTime;
            card.yPos -= vY * globals.deltaTime;
        }
    }

    setTurnDecksPositions(){

        const turn = this.turnContainer.turnContainer[this.currentTurn];
        const enemyTurn = this.turnContainer.turnContainer[(this.currentTurn+1)%2];
        this.gridsArray.grids[GridId.PLAYER_2_EVENT_GRID].freeSlots()
        enemyTurn.phasesArray[PhaseStates.PREPARE_EVENT].setEventGrid(this.gridsArray.grids[GridId.PLAYER_2_EVENT_GRID])
        enemyTurn.phasesArray[PhaseStates.USE_EVENT_CARD].setEventGrid(this.gridsArray.grids[GridId.PLAYER_2_EVENT_GRID])
        this.startCardFlights([enemyTurn.handDeck, enemyTurn.preparingEventDeck, turn.handDeck, turn.preparingEventDeck])
        this.assignCardsToGrids(enemyTurn.handDeck, this.gridsArray.grids[GridId.PLAYER_2_HAND_GRID])
        this.assignCardsToGrids(enemyTurn.preparingEventDeck, this.gridsArray.grids[GridId.PLAYER_2_EVENT_GRID])

        this.gridsArray.grids[GridId.PLAYER_1_EVENT_GRID].freeSlots()
        turn.phasesArray[PhaseStates.PREPARE_EVENT].setEventGrid(this.gridsArray.grids[GridId.PLAYER_1_EVENT_GRID])
        turn.phasesArray[PhaseStates.USE_EVENT_CARD].setEventGrid(this.gridsArray.grids[GridId.PLAYER_1_EVENT_GRID])
        this.assignCardsToGrids(turn.handDeck, this.gridsArray.grids[GridId.PLAYER_1_HAND_GRID])
        this.assignCardsToGrids(turn.preparingEventDeck, this.gridsArray.grids[GridId.PLAYER_1_EVENT_GRID])

        this.rotateBoardMinions()
        this.rotateMainCharacters()

    }

    rotateBoardMinions(){
        const minionCards = this.deckContainer.decks[DecksId.PLAYER_1_ACTIVE_MINION_DECK].cards
        const enemyMinionCards = this.deckContainer.decks[DecksId.PLAYER_2_ACTIVE_MINION_DECK].cards
        let positions = []
        let enemyPositions = []

            for (let i = 0; i < this.gridsArray.grids[GridId.BOARD_GRID].slots.length; i++) {
                const row = this.gridsArray.grids[GridId.BOARD_GRID].slots[i]
                for (let k = 0; k < minionCards.length; k++) {
                    const card = minionCards[k];
                    if (card.yPos === row[0].yPos) {
                        positions[k] = i
                    }

            }
                for (let k = 0; k < enemyMinionCards.length; k++) {
                    const card = enemyMinionCards[k];
                    if (card.yPos === row[0].yPos) {
                        enemyPositions[k] = i
                    }

            }

        }

        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const card = minionCards[i]
            this.setRotationPos(card, position)
        }
        for (let i = 0; i < enemyPositions.length; i++) {
            const enemyPosition = enemyPositions[i]
            const enemyCard = enemyMinionCards[i]
            this.setRotationPos(enemyCard, enemyPosition)
        }
    }

    rotateMainCharacters(){
        const turn = this.turnContainer.turnContainer[this.currentTurn];
        const enemyTurn = this.turnContainer.turnContainer[(this.currentTurn+1)%2];

        const xTemp = turn.mainCharacter.xPos
        const yTemp = turn.mainCharacter.yPos

        turn.mainCharacter.xPos = enemyTurn.mainCharacter.xPos
        turn.mainCharacter.yPos = enemyTurn.mainCharacter.yPos

        enemyTurn.mainCharacter.xPos = xTemp
        enemyTurn.mainCharacter.yPos = yTemp
    }

    setRotationPos(card, position){
        const rows = this.gridsArray.grids[GridId.BOARD_GRID].slots
        switch (position) {
            case 0:
                card.yPos = rows[4][0].yPos
                break;

            case 1:
                card.yPos = rows[3][0].yPos
                break;

            case 3:
                card.yPos = rows[1][0].yPos
                break;

            case 4:
                card.yPos = rows[0][0].yPos
                break;
            default:
                break;
        }
    }

    // mover a turncontainer
    updateTurns(){
        this.turnChange();
    }

    turnChange(){
        console.log(this.turnArray.turnContainer[0].active);

        setTimeout(() => {
            this.turnArray.turnContainer[0].active = true;
        }, 3000)

        if(this.turnArray.turnContainer[0].active){
            console.log("turno player 1");
            // turno player 1

        }else if(this.turnArray.turnContainer[1].active){

            // Turno player 2
            console.log("turno player 2");

        }
    }

    // Enviar datos objeto game
    sendStatsData(){
        const player1 = this.turnContainer.turnContainer[0];
        const player2 = this.turnContainer.turnContainer[1];

        const p1DoneDamage = player1.damageDone;
        const p2DoneDamage = player2.damageDone;
        const p1MeleHits   = player1.meleHits;
        const p1RangeHits  = player1.rangeHits;
        const p2MeleHits   = player2.meleHits;
        const p2RangeHits  = player2.rangeHits;

        const p1MongoId    = localStorage.getItem("mongo_id");
        const enemies      = JSON.parse(localStorage.getItem("opponents"));
        const p2MongoId    = enemies[localStorage.index].mongo_id;

        const player1hp    = player1.minionDeck.cards.length + player1.activeMinionDeck.cards.length;

        let winner = player1hp > 0 ? p1MongoId : p2MongoId;
        let loser  = player1hp === 0 ? p1MongoId : p2MongoId;

        if (this.turnContainer.buttonContainer.container[ButttonsId.BTN_RETURN_TO_LOBBY].state === ButtonState.SELECTED){
            
            winner  = this.currentTurn   === TurnId.PLAYER_1 ? p2MongoId : p1MongoId;
            loser   = this.currentTurn   === TurnId.PLAYER_1 ? p1MongoId : p2MongoId;
        }
    
        const game = {
            players: [
                {
                    player_id: p1MongoId,
                    meleeHits: p1MeleHits,
                    rangedHits: p1RangeHits,
                    damageDone: p1DoneDamage,
                    damageReceived: p2DoneDamage
                },
                {
                    player_id: p2MongoId,
                    meleeHits: p2MeleHits,
                    rangedHits: p2RangeHits,
                    damageDone: p2DoneDamage,
                    damageReceived: p1DoneDamage
                },

            ],
            winner: winner,
            loser: loser
        }

        const winner2 = winner   === p1MongoId ? player1 : player2;
        const loser2  = loser    === p1MongoId ? player1 : player2;
        const winnerName = winner2.name;
        const loserName  = loser2.name;
        const winnerCharacter = winner2.mainCharacter;
        const loserCharacter  = loser2.mainCharacter;
        

        this.game = {
            winner: winnerName,
            loser: loserName,
            winnerCharacter: winnerCharacter,
            loserCharacter:  loserCharacter,
            winnerStats: winner === p1MongoId ? game.players[0] : game.players[1],
            loserStats:  loser  === p1MongoId ? game.players[0] : game.players[1]
        }


        console.log(JSON.stringify(game));

    fetch(`http://localhost:4000/newGame`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(game)

        })
        .then((res) => {
            this.finished = true;
        }) 
    }


}

