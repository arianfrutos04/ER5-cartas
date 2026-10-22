import globals from "./globals.js";
import { IconsPos, MessageState, MessageType } from "./constants.js";

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

    render(ctx, language, renderUnderBanner){

        switch (this.type){

            case MessageType.DAMAGE_MESSAGE:
                this.renderDamageMessage(ctx, language);
                break

            case MessageType.CHANGE_TURN_MESSAGE:
                this.renderChangeTurnMessage(ctx, language, renderUnderBanner);
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

                const textLines = this.splitInBalancedLines(ctx, this.message.texts[0].text[language], IconsPos.CHAT_TEXT_MAX_WIDTH);
                this.renderChatMessage(ctx, textLines);
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
    // Las lineas se centran en la posicion del mensaje, que es el centro del bocadillo
    renderChatMessage(ctx, lines){

        const lineHeight = this.message.texts[0].size * 1.35;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let i = 0; i < lines.length; i++){

            ctx.fillText(lines[i], this.xPos, this.yPos + (i - (lines.length - 1) / 2) * lineHeight);
        }

        ctx.restore();
    }

    // Usa las mismas lineas que necesita el ancho maximo, pero con el ancho mas estrecho posible,
    // para que queden parecidas y no se quede una palabra sola en la ultima
    splitInBalancedLines(ctx, text, maxWidth){

        let lines = this.splitInLines(ctx, text, maxWidth);
        let width = maxWidth;

        while (width > 60){

            const narrowerLines = this.splitInLines(ctx, text, width - 5);

            if (narrowerLines.length > lines.length){

                break;
            }

            lines = narrowerLines;
            width -= 5;
        }

        return lines;
    }

    // Reparte las palabras en lineas que no superan el ancho maximo con la fuente actual
    splitInLines(ctx, text, maxWidth){

        const words = text.split(" ").filter((word) => word !== "");
        const lines = [];
        let line = "";

        for (let i = 0; i < words.length; i++){

            const testLine = line === "" ? words[i] : line + " " + words[i];

            if (line !== "" && ctx.measureText(testLine).width > maxWidth){

                lines.push(line);
                line = words[i];
            }

            else{

                line = testLine;
            }
        }

        if (line !== ""){

            lines.push(line);
        }

        return lines;
    }
    // Velo oscuro y banda con filos dorados que entran y salen suavemente; el texto va centrado en la pantalla.
    // renderUnderBanner pinta lo que pasa por delante del velo y por detras de la banda, como las cartas que cambian de sitio
    renderChangeTurnMessage(ctx, language, renderUnderBanner){

        const alpha = Math.min(1, Math.max(0, this.alpha));
        const bandTop = 405;
        const bandHeight = 170;

        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.fillStyle = "rgba(10, 6, 3, 0.7)";
        ctx.fillRect(0, 0, 1920, 1080);
        ctx.restore();

        if (renderUnderBanner !== undefined){

            renderUnderBanner();
        }

        ctx.save();
        ctx.globalAlpha = alpha;

        const band = ctx.createLinearGradient(0, 0, 1920, 0);
        band.addColorStop(0, "rgba(20, 10, 4, 0)");
        band.addColorStop(0.25, "rgba(20, 10, 4, 0.92)");
        band.addColorStop(0.75, "rgba(20, 10, 4, 0.92)");
        band.addColorStop(1, "rgba(20, 10, 4, 0)");
        ctx.fillStyle = band;
        ctx.fillRect(0, bandTop, 1920, bandHeight);

        const edge = ctx.createLinearGradient(0, 0, 1920, 0);
        edge.addColorStop(0.1, "rgba(224, 170, 70, 0)");
        edge.addColorStop(0.5, "rgba(255, 214, 120, 1)");
        edge.addColorStop(0.9, "rgba(224, 170, 70, 0)");
        ctx.fillStyle = edge;
        ctx.fillRect(0, bandTop, 1920, 3);
        ctx.fillRect(0, bandTop + bandHeight - 3, 1920, 3);

        ctx.font = "700 " + Math.round(this.size * 0.8) + "px Cinzel";
        ctx.letterSpacing = "6px";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(255, 190, 70, 0.6)";
        ctx.shadowBlur = 24;
        ctx.fillStyle = "#f6d77a";
        ctx.fillText(this.getText(language), 960, bandTop + bandHeight / 2 + 4);

        ctx.restore();
        ctx.fillStyle = "white";
    }
}