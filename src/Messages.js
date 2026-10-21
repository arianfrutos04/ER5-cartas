import globals from "./globals.js";
import { MessageState, MessageType } from "./constants.js";

export default class Messages{

    constructor(xPos, yPos, message, type, state, timeInFade, timeInAppear, timeInOn, size = 80, color = "red"){

        this.xPos           = xPos;
        this.yPos           = yPos;
        this.message        = message;
        this.type           = type;
        this.state          = state;
        this.timeInFade     = timeInFade;
        this.timeInAppear   = timeInAppear;
        this.timeInOn       = timeInOn;
        this.alpha          = 0.0;
        this.fadeCounter    = 0;
        this.appearCounter  = 0;
        this.onCounter      = 0;
        this.size           = size;
        this.color          = color;
    }

    update(messages){
        switch (this.state){

            case MessageState.APPEAR:
                this.appearCounter += globals.deltaTime;
                this.alpha += 0.1;
                
                if (this.appearCounter > this.timeInAppear && this.alpha >= 1){
                    
                    this.appearCounter = 0;
                    this.state = MessageState.ON;
                }
                break;

            case MessageState.ON:
                this.onCounter += globals.deltaTime;
                if (this.type === MessageType.DAMAGE_MESSAGE) {
                    this.yPos -=1
                }
                if (this.onCounter > this.timeInOn && this.timeInOn != null){
                    
                    this.onCounter = 0;
                    this.state = MessageState.FADE;
                }
                break;
    
            case MessageState.FADE:
                this.fadeCounter += globals.deltaTime;
                if (this.type != MessageType.CHAT_MESSAGE) {
                    this.alpha -= 0.1;
                    
                }
                if (this.type === MessageType.DAMAGE_MESSAGE) {
                    this.yPos -=7
                }
                if (this.fadeCounter > this.timeInFade){
                    
                    this.fadeCounter = 0;
                    this.state = MessageState.OFF;
                }
                break;
            
            case MessageState.OFF:
                this.alpha = 0.0;

                if (this.type != MessageType.HELP_MESSAGE){

                    messages.splice(this, 1);
                }

                else{

                    this.state = MessageState.APPEAR;
                }
                break;
        }
    }

    render(ctx, language){

        switch (this.type){

            case MessageType.DAMAGE_MESSAGE:
                this.renderDamageMessage(ctx, language);
                break

            case MessageType.CHANGE_TURN_MESSAGE:
                this.renderChangeTurnMessage(ctx, language);
                break;

            case MessageType.HELP_MESSAGE:
                ctx.font = this.message.size + "px LongaIberica-DEMO";
                
                let lines = this.message.initText(language);

                // El bloque de lineas se centra en la posicion del mensaje
                const linesCenter = lines.length > 0 ? (lines[0].yPos + lines[lines.length - 1].yPos) / 2 : 0;

                for (let i = 0; i < lines.length; i++){

                    const line = lines[i];

                    this.renderHelpMessage(ctx, line, line.yPos - linesCenter);
                }
                break;
                
            case MessageType.CHAT_MESSAGE:
                ctx.font = this.message.texts[0].size + "px LongaIberica-DEMO";
                
                const textLines = this.message.texts[0].initText(language);

                for (let i = 0; i < textLines.length; i++){
                    const line = textLines[i];
                    this.renderChatMessage(ctx, line);
                }
                break;

            default:
                break;
        }
    }

    // Los mensajes que se traducen son una pareja [ingles, euskera]; los numeros de daño no
    getText(language){

        return Array.isArray(this.message) ? this.message[language] : this.message;
    }

    renderDamageMessage(ctx, language){

        ctx.font = this.size + "px LongaIberica-DEMO";
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fillText(this.getText(language), this.xPos, this.yPos);
        ctx.globalAlpha = 1.0;
    }

    renderHelpMessage(ctx, text, yOffset){

        ctx.save();
        ctx.fillStyle = "#3b2414";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = this.alpha;
        ctx.fillText(text.text, this.xPos, this.yPos + yOffset);
        ctx.restore();
    }
    renderChatMessage(ctx, text){
        
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fillText(text.text, this.xPos, this.yPos + text.yPos);
        ctx.globalAlpha = 1.0;
    }
    renderChangeTurnMessage(ctx, language){
        
        ctx.fillStyle = 'rgb(0, 0, 0, 0.5)'
        ctx.fillRect(0, 0, 1920, 1080)
        
        ctx.fillStyle = "rgb(242, 211, 6)";
        ctx.font = this.size+"px LongaIberica-DEMO"
        ctx.globalAlpha = this.alpha;
        ctx.fillText(this.getText(language), this.xPos, this.yPos);
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = "white";
    }
}