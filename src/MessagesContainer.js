import { MessageType } from "./constants.js";
import Messages from "./Messages.js";
import TextContainer from "./TextContainer.js";
import { HelpMessagesPos, MessageState } from "./constants.js";

export default class MessagesContainer{

    constructor(){

        this.damageMessage      = [];
        this.helpMessage        = [];
        this.changeTurnMessage  = [];
        this.activeHelpMessage;
        this.previousHelpMessage;
    }

    update(){
        
        for (let i = 0; i < this.damageMessage.length; i++){

            const message = this.damageMessage[i];

            if (message != undefined){
                
                message.update(this.damageMessage);
            }
        }
            
        if (this.activeHelpMessage != undefined){

            this.activeHelpMessage.update(this.helpMessage);
        }

        if (this.changeTurnMessage[0] != undefined) {
            this.changeTurnMessage[0].update(this.changeTurnMessage)
        }
    }

    createHelpMessages(){

        const textsContainer = TextContainer.createMessageText();
        const messages = [];

        for (let i = 0; i < textsContainer.texts.length; i++){

            const text = textsContainer.texts[i];
            const message = new Messages(HelpMessagesPos.X_POS, HelpMessagesPos.Y_POS, text, MessageType.HELP_MESSAGE, MessageState.APPEAR, 0.1, 0.2, null);
            messages.push(message);
        }

        this.helpMessage = messages;
    }
    addMessage(message){
        
        this.damageMessage.push(message);
    }
        
    activeMessage(text){

        const activeMessage = this.getMessage(text);
        
        if (this.previousHelpMessage != undefined && this.previousHelpMessage != this.activeHelpMessage){

            this.previousHelpMessage.state = MessageState.OFF;
        }

        if (activeMessage != undefined){

            this.previousHelpMessage = this.activeHelpMessage;
            this.activeHelpMessage = activeMessage;
            return true;
        }
    }

    getMessage(message){
        
        for (let i = 0; i < this.helpMessage.length; i++){

            const messageText = this.helpMessage[i];
            
            if (message[0] === messageText.message.text[0]){

                return messageText;
            }
        }
    }

    renderDamageAndChangeTurn(ctx, language){
          
        for (let i = 0; i < this.damageMessage.length; i++){

            const message = this.damageMessage[i];

            if (message != undefined){
                
                message.render(ctx, language);
                ctx.fillStyle = "black";
            }
        }

        if (this.changeTurnMessage[0] != undefined){
            
            this.changeTurnMessage[0].render(ctx, language);
            ctx.fillStyle = "black";
        }
    }

    renderHelp(ctx, language){
          
        if (this.activeHelpMessage != undefined){
            
            this.activeHelpMessage.render(ctx, language);
            ctx.fillStyle = "black";
        }
    }

    createMessage(xPos, yPos, text, type, state, timeInFade, timeInAppear, timeInOn,lineSpace, maxHeigth, maxWidth, size = 80, color = "red"){
        text = TextContainer.create(text, type, size, lineSpace, maxHeigth, maxWidth)
        const message = new Messages(xPos, yPos, text, type, state, timeInFade, timeInAppear, timeInOn, size, color);
        this.damageMessage.push(message)
        
        return message
    }

    deleteMessages(){

        
    }
}
