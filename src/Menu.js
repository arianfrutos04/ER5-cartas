import { ButtonState, ButttonsId, GameState, ReturnToMenuText, ScreenSize, renderState } from "./constants.js";

// El pergamino de menu_panel sobresale de la ventana para dejar sitio al marco y la sombra
const PANEL_OFFSET_X = 59;
const PANEL_OFFSET_Y = 69;

export default class Menu{
    
    constructor (xPos, yPos, xSize, ySize, image){

        this.xPos   = xPos;
        this.yPos   = yPos;
        this.xSize  = xSize;
        this.ySize  = ySize;
        this.image  = image;
        this.previousState = GameState.MENU;
        this.previousButtonState

    }

    update(buttonContainer, gameState){

        const menuButton = buttonContainer.container[ButttonsId.BTN_RETURN_TO_MENU];
        const returnToGameButton = buttonContainer.container[ButttonsId.BTN_RETURN_TO_GAME];
        const returnToLobbyButton = buttonContainer.container[ButttonsId.BTN_RETURN_TO_LOBBY];

        const result = [];

        result[0] = buttonContainer.state;
        result[1] = gameState;

        if (menuButton.state === ButtonState.SELECTED){
            this.previousState = buttonContainer.state
            this.previousButtonState = gameState

            result[0] = renderState.MENU;
            result[1] = GameState.MENU;
            menuButton.state = ButtonState.NOT_SELECTED

            
        }else{
            if (returnToGameButton.state === ButtonState.SELECTED){
                result[0] = this.previousState;
                result[1] = this.previousButtonState;
                menuButton.state = ButtonState.NOT_SELECTED;
                returnToGameButton.state = ButtonState.NOT_SELECTED;
            }
            else if (returnToLobbyButton.state === ButtonState.SELECTED){
    
                menuButton.state = ButtonState.NOT_SELECTED;
                result[1] = GameState.SEND_DATA;
            }
        }

        return result;
    }

    render(ctx, button, gameState, language){

        if (button.state === ButtonState.SELECTED || gameState === GameState.MENU){
            
            ctx.drawImage(this.image, this.xPos - PANEL_OFFSET_X, this.yPos - PANEL_OFFSET_Y);

            ctx.save();
            ctx.font = "30px 'EB Garamond'";
            ctx.fillStyle = "#3b2414";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.fillText(ReturnToMenuText.FIRST_LINE[language], this.xPos + this.xSize / 2, this.yPos + 28);
            ctx.fillText(ReturnToMenuText.SECOND_LINE[language], this.xPos + this.xSize / 2, this.yPos + 62);
            ctx.restore();
        }
    }
}