import globals from "./globals.js";
import { BoardCardSizes, CombatText, IconsPos, MessageState, MessageType } from "./constants.js";

// Colores de los textos flotantes: los nombres que usa el juego pasan a tonos mas ricos
const DAMAGE_COLORS = {
    red:        "#ff4b3a",
    orange:     "#ffc23c",
    white:      "#efe6d2",
    "#04ff00":  "#6ee87a",
};
const BLOCKED_COLOR = "#a9d4ff";
const DAMAGE_OUTLINE = "rgba(18, 8, 3, 0.92)";

// Todos los numeros tienen un tamano y todas las palabras otro; solo el critico y DEAD salen mas grandes.
// Las frases que no caben en el ancho maximo se parten en dos lineas
const DAMAGE_NUMBER_SIZE = 44;
const DAMAGE_WORD_SIZE = 26;
const DAMAGE_EMPHASIS_SCALE = 1.3;
const DAMAGE_LABEL_MAX_WIDTH = 230;

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
        this.delay          = 0;                // Segundos que espera antes de empezar a aparecer
    }

    // DEAD, arma rota y armadura rota salen aparte y un momento despues del golpe, sobre el retrato del esbirro
    static createAfterHitMessage(minion, text){

        const message = new Messages(minion.xPos, minion.yPos + 85, text, MessageType.DAMAGE_MESSAGE, MessageState.APPEAR, 0.3, 0.2, 0.6, 80, "red");
        message.delay = 0.4;

        return message;
    }

    update(messages){

        if (this.delay > 0){

            this.delay -= globals.deltaTime;
            return;
        }

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

                    messages.splice(messages.indexOf(this), 1);
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

    // Centrado sobre el esbirro: el numero arriba y la palabra debajo; al aparecer rebota
    renderDamageMessage(ctx, language){

        const text = String(this.getText(language)).trim();
        const alpha = Math.min(1, Math.max(0, this.alpha));
        const color = text === CombatText.BLOCKED[language] ? BLOCKED_COLOR : DAMAGE_COLORS[this.color] ?? this.color;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.textBaseline = "alphabetic";
        ctx.lineJoin = "round";


        const number = text.match(/([-+]\s?)?\d+(\(\d+\))?/);
        const label = number ? text.replace(number[0], "").trim() : text;
        const appear = this.state === MessageState.APPEAR ? alpha : 1;
        const scale = 0.5 + 0.5 * appear + 0.35 * Math.sin(appear * Math.PI);
        const isCritical = this.color === "orange";
        const emphasis = isCritical || text === CombatText.DEAD[language] ? DAMAGE_EMPHASIS_SCALE : 1;

        ctx.textAlign = "center";
        ctx.translate(this.xPos + BoardCardSizes.X_SIZE / 2, this.yPos + 30);
        ctx.scale(scale * emphasis, scale * emphasis);

        // El critico sale algo inclinado
        if (isCritical){

            ctx.rotate(-0.08);
        }

        let wordYPos = 0;

        if (number){

            this.renderDamageText(ctx, number[0].replace(" ", ""), DAMAGE_NUMBER_SIZE, 0, color);
            wordYPos = DAMAGE_NUMBER_SIZE * 0.3 + DAMAGE_WORD_SIZE;
        }

        if (label !== ""){

            const lines = this.splitDamageLabel(ctx, label);

            for (let i = 0; i < lines.length; i++){

                this.renderDamageText(ctx, lines[i], DAMAGE_WORD_SIZE, wordYPos + i * DAMAGE_WORD_SIZE * 1.15, color);
            }
        }

        ctx.restore();
    }

    // Las frases que no caben se parten por el espacio mas cercano al centro
    splitDamageLabel(ctx, label){

        ctx.font = "700 " + DAMAGE_WORD_SIZE + "px Cinzel";
        ctx.letterSpacing = "2px";

        const words = label.split(" ");

        if (words.length < 2 || ctx.measureText(label).width <= DAMAGE_LABEL_MAX_WIDTH){

            return [label];
        }

        let best = 1;

        for (let i = 1; i < words.length; i++){

            const difference = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);

            if (difference < Math.abs(words.slice(0, best).join(" ").length - words.slice(best).join(" ").length)){

                best = i;
            }
        }

        return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
    }

    // Filo dorado por fuera, contorno oscuro y relleno con la parte de arriba mas clara
    renderDamageText(ctx, text, size, yPos, color){

        ctx.font = "700 " + Math.round(size) + "px Cinzel";
        ctx.letterSpacing = "2px";

        // Una palabra suelta que no cabe se encoge hasta caber
        const width = ctx.measureText(text).width;

        if (width > DAMAGE_LABEL_MAX_WIDTH){

            size = size * DAMAGE_LABEL_MAX_WIDTH / width;
            ctx.font = "700 " + Math.round(size) + "px Cinzel";
        }

        const rim = ctx.createLinearGradient(0, yPos - size, 0, yPos);
        rim.addColorStop(0, "#fff0b8");
        rim.addColorStop(0.5, "#d9a23c");
        rim.addColorStop(1, "#7a4a12");

        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.lineWidth = size / 5 + 5;
        ctx.strokeStyle = rim;
        ctx.strokeText(text, 0, yPos);

        ctx.shadowColor = "transparent";
        ctx.lineWidth = size / 5;
        ctx.strokeStyle = DAMAGE_OUTLINE;
        ctx.strokeText(text, 0, yPos);

        const fill = ctx.createLinearGradient(0, yPos - size * 0.75, 0, yPos);
        fill.addColorStop(0, "#fff8e6");
        fill.addColorStop(0.5, color);
        fill.addColorStop(1, color);
        ctx.fillStyle = fill;
        ctx.fillText(text, 0, yPos);

        ctx.letterSpacing = "0px";
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