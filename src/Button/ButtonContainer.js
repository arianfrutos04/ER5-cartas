import Button from "./Button.js";
import { AttackState, ButtonState, ButttonsId, PhaseStates, renderState } from "../constants.js";

export default class ButtonContainer{
    constructor(container){
        this.container = container;
        this.state     = renderState.GAME;
        this.previousState = renderState.GAME
    }

    static create(ctx, assets, iconAssets){
        // Button(context, x, y, width, height, "texto", estado button, estado fase que devuelve)
        const btnMove           = new Button(ButttonsId.BTN_MOVE, ctx, 292, 260, 119, 75, ["MOVE", "MUGITU"], ButtonState.NOT_SELECTED, PhaseStates.MOVEMENT, renderState.GAME, assets);
        const btnPrepareEvent   = new Button(ButttonsId.BTN_PREPARE_EVENT, ctx, 292, 410, 119, 75, ["PREPARE", "PRESTATU"], ButtonState.NOT_SELECTED, PhaseStates.PREPARE_EVENT, renderState.GAME, assets);
        const btnUseEvent       = new Button(ButttonsId.BTN_USE_EVENT, ctx, 292, 560, 119, 75, ["USE", "ERABILI"], ButtonState.NOT_SELECTED, PhaseStates.USE_EVENT_CARD, renderState.GAME, assets);
        const btnAttack         = new Button(ButttonsId.BTN_ATTACK, ctx, 292, 710, 119, 75, ["ATTACK", "ERASO"], ButtonState.NOT_SELECTED, PhaseStates.ATTACK, renderState.GAME, assets);
        const btnEndTurn        = new Button(ButttonsId.BTN_END_TURN, ctx, 1504, 600, 84, 60, ["END\nTURN", "TXANDA\nAMAITU"], ButtonState.NOT_SELECTED, PhaseStates.DISCARD_CARD, renderState.GAME, assets);
        const btnChangeLanguage = new Button(ButttonsId.BTN_CHANGE_LANGUAGE, ctx, 1597, 1015, 40, 40, ["", ""], ButtonState.NOT_SELECTED, undefined, undefined, iconAssets.slice(0, 3));
        const btnQuickHelp      = new Button(ButttonsId.BTN_QUICK_HELP, ctx, 1692, 1015, 40, 40, ["", ""], ButtonState.NOT_SELECTED, undefined, undefined, iconAssets.slice(3, 6));
        const btnReturnToMenu   = new Button(ButttonsId.BTN_RETURN_TO_MENU, ctx, 1787, 1015, 40, 40, ["", ""], ButtonState.NOT_SELECTED, undefined, undefined, iconAssets.slice(6, 9));
        const btnReturnToGame   = new Button(ButttonsId.BTN_RETURN_TO_GAME, ctx, 790, 520, 119, 75, ["BACK TO\nTHE GAME", "JOLASERA\nITZULI"], ButtonState.NOT_SELECTED, undefined, renderState.MENU, assets);
        const btnReturnToLobby  = new Button(ButttonsId.BTN_RETURN_TO_LOBBY, ctx, 995, 520, 119, 75, ["SURRENDER", "ERRENDITU"], ButtonState.NOT_SELECTED, undefined, renderState.MENU, assets);
        const btnParry          = new Button(ButttonsId.BTN_PARRY, ctx, 292, 360, 119, 75, ["PARRY", "BLOKEATU"], ButtonState.NOT_SELECTED, AttackState.PARRY, renderState.PARRY, assets);
        const btnNoParry        = new Button(ButttonsId.BTN_NO_PARRY, ctx, 292, 660, 119, 75, ["NO\nPARRY", "EZ\nBLOKEATU"], ButtonState.NOT_SELECTED, AttackState.ATTACK, renderState.PARRY, assets);
        const btnLeft           = new Button(ButttonsId.BTN_LEFT, ctx, 0, 0, 960, 1080, ["", ""], ButtonState.NOT_SELECTED, undefined, renderState.QUICK_HELP, assets);
        const btnRight          = new Button(ButttonsId.BTN_RIGHT, ctx, 960, 0, 960, 1080, ["", ""], ButtonState.NOT_SELECTED, undefined, renderState.QUICK_HELP, assets);
        const btnLeaveHelp      = new Button(ButttonsId.BTN_LEAVE_QUICK_HELP, ctx, 1800, 0, 120, 120, ["", ""], ButtonState.NOT_SELECTED, undefined, renderState.QUICK_HELP, assets);


        const container = [btnMove, btnPrepareEvent, btnUseEvent, btnAttack, btnEndTurn, btnChangeLanguage, btnReturnToMenu, btnQuickHelp, btnParry, btnNoParry, btnLeft, btnRight, btnLeaveHelp, btnReturnToGame, btnReturnToLobby];

        return new ButtonContainer(container);
    }


    // backgroundState son los botones que se siguen viendo detras de una ventana, como los de la partida con el menu abierto
    renderButtons(language, backgroundState){
        
        const state = this.state;

        for (let i = 0; i < this.container.length; i++){

            const btn = this.container[i];

            if (btn.renderState === state || btn.renderState === backgroundState || btn.renderState === undefined){

                btn.render(language);
            }
        }
    }

    deselect(){

        for (let i = 0; i < this.container.length; i++){

            const button = this.container[i];
            button.deselect();
        }
    }

    updateButtons(mouse, turn, timer) {
        
        const state = this.state;

        for (let i = 0; i < this.container.length; i++){

            const btn = this.container[i];

            if (btn.renderState === state || btn.renderState === undefined){

                btn.update(mouse, this, turn, timer);
            }
        }
    }
    
    isAnyButtonSelected(){
        for(let i = 0; i < this.container.length; i++){
            const button = this.container[i];

            if(button.state === ButtonState.SELECTED && button.phaseState != undefined){
                
                return  button.phaseState;
            }

        }

        return PhaseStates.DEFAULT;
    }

    resetStatesButtons(){
        // console.log("entro aqui");

        for(let i = 0; i < this.container.length; i++){
            
            const button = this.container[i];

            button.state = ButtonState.NOT_SELECTED;


        }
    }

    setState(state){
        this.state = state;
    }
}