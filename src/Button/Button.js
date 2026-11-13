import { ButtonImageId, ButtonState, ButttonsId, LanguageId, PhaseStates, TurnStates, renderState } from "../constants.js";
import ButtonContainer from "./ButtonContainer.js";

// Las placas miden 135 x 93 y sus imagenes tienen 16 px de margen por cada lado para el brillo
const PLAQUE_WIDTH      = 135;
const PLAQUE_HEIGHT     = 93;
const PLAQUE_MARGIN     = 16;
const PLAQUE_TEXT_WIDTH = 108;
const PLAQUE_TEXT_COLOR = ["#f1dca4", "#fff1c4", "#fff6dc", "#8f7f62"];

export default class Button {

    constructor(id, ctx, x, y, width, height,  text, state, phaseState, renderState, img){
        
        this.id             = id;
        this.ctx            = ctx;
        this.x              = x;
        this.y              = y;
        this.width          = width;
        this.height         = height;
        this.text           = text;
        this.state          = state;
        this.phaseState     = phaseState;
        this.renderState    = renderState;
        this.color          = "#582900";
        this.img            = img;
        this.isEnabled      = true;
}

    render(language, textSize){

        if (this.isIconButton()) {
            this.renderIcon();
            return;
        }

        if (this.id === ButttonsId.BTN_END_TURN) {
            this.renderEndTurn(language);
            return;
        }

        if (this.renderState === renderState.MENU){

            this.ctx.filter = "blur(0px)";
        }

        if (this.isPlaque()) {

            this.renderPlaque(language, textSize ?? this.getPlaqueTextSize(language));
        }
    }

    // Si es una placa de madera con texto: las de las acciones, el menu y el bloqueo
    isPlaque(){

        return this.height > 70 && this.height < 100;
    }

    // El tamano de letra mas grande con el que su texto cabe en la placa en ese idioma
    getPlaqueTextSize(language){

        const lines = this.text[language].split("\n");
        let size = 20;

        this.ctx.font = "700 " + size + "px Cinzel";

        while (size > 13 && Math.max(...lines.map((line) => this.ctx.measureText(line).width)) > PLAQUE_TEXT_WIDTH) {

            size -= 1;
            this.ctx.font = "700 " + size + "px Cinzel";
        }

        return size;
    }

    // Placa de madera con marco dorado; las acciones sin usos se ven apagadas. El tamano de la letra lo decide
    // ButtonContainer, para que las placas que salen juntas lo lleven igual
    renderPlaque(language, size){

        const isDisabled = !this.isEnabled && this.renderState === renderState.GAME;
        const imageIndex = isDisabled ? ButtonImageId.DISABLED : this.state === ButtonState.SELECTED ? ButtonImageId.ACTIVE : this.state === ButtonState.HOVER ? ButtonImageId.HOVER : ButtonImageId.NORMAL;

        this.ctx.drawImage(this.img[imageIndex], this.x - PLAQUE_MARGIN, this.y - PLAQUE_MARGIN);

        const lines = this.text[language].split("\n");

        this.ctx.font = "700 " + size + "px Cinzel";

        this.ctx.textAlign      = 'center';
        this.ctx.textBaseline   = 'middle';

        this.ctx.save();
        this.ctx.fillStyle = PLAQUE_TEXT_COLOR[imageIndex];
        this.ctx.shadowColor = imageIndex === ButtonImageId.ACTIVE || imageIndex === ButtonImageId.HOVER ? "rgba(255, 196, 80, 0.9)" : "rgba(0, 0, 0, 0.8)";
        this.ctx.shadowBlur = imageIndex === ButtonImageId.ACTIVE ? 10 : imageIndex === ButtonImageId.HOVER ? 6 : 3;

        const lineHeight = size * 1.2;
        const xPos = this.x + PLAQUE_WIDTH / 2;
        const yPos = this.y + PLAQUE_HEIGHT / 2 + 1;

        for (let i = 0; i < lines.length; i++) {
            this.ctx.fillText(lines[i], xPos, yPos + (i - (lines.length - 1) / 2) * lineHeight);
        }

        this.ctx.restore();
    }

    // Lo que se ve del boton: las placas son mas grandes que la zona que responde al raton, y de ellas cuenta su marco
    // dorado macizo, que va de x + 2 a x + 133, sin la sombra ni el brillo difuso de alrededor
    getArea(){

        // El de terminar turno es el texto sobre el banderin del tablero, que va de x + 9 a x + 88
        if (this.id === ButttonsId.BTN_END_TURN){

            return { xPos: this.x + 9, yPos: this.y, width: 79, height: this.height };
        }

        if (this.isIconButton()){

            return { xPos: this.x, yPos: this.y, width: this.width, height: this.height };
        }

        return { xPos: this.x + 2, yPos: this.y, width: PLAQUE_WIDTH - 4, height: PLAQUE_HEIGHT };
    }

    isIconButton(){

        return this.id === ButttonsId.BTN_CHANGE_LANGUAGE || this.id === ButttonsId.BTN_QUICK_HELP || this.id === ButttonsId.BTN_RETURN_TO_MENU;
    }

    // Las imagenes de los iconos tienen 8 px de margen por cada lado para la sombra y el brillo
    renderIcon(){

        const imageIndex = this.state === ButtonState.SELECTED ? 2 : this.state === ButtonState.HOVER ? 1 : 0;
        this.ctx.drawImage(this.img[imageIndex], this.x - 8, this.y - 8);
    }

    // El texto va sobre la bandera del tablero y se reduce hasta caber en su ancho en cualquier idioma
    renderEndTurn(language){

        const lines = this.text[language].split("\n");
        const maxWidth = 60;
        let size = 20;

        this.ctx.font = size + 'px Trajan Color';

        while (size > 12 && Math.max(...lines.map((line) => this.ctx.measureText(line).width)) > maxWidth) {
            size -= 1;
            this.ctx.font = size + 'px Trajan Color';
        }

        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        if (this.state === ButtonState.NOT_SELECTED) {
            this.ctx.fillStyle = 'rgb(242, 211, 6)';
        }
        else {
            this.ctx.fillStyle = '#fff2b0';
            this.ctx.shadowColor = 'rgba(255, 210, 80, 0.95)';
            this.ctx.shadowBlur = this.state === ButtonState.SELECTED ? 14 : 9;
        }

        const lineHeight = size * 1.25;
        const xPos = this.x + this.width / 2 + 7;
        const yPos = this.y + this.height / 2 + 8;

        for (let i = 0; i < lines.length; i++) {
            this.ctx.fillText(lines[i], xPos, yPos + (i - (lines.length - 1) / 2) * lineHeight);
        }

        this.ctx.restore();
    }

    // Función para dibujar un rectángulo redondeado
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
    }

    update(mouse, buttonContainer, turn, timer){
        
        const state = this.state;
        const isCollidingWithMouse = mouse.isCollidingWithButton(this);
        const isAnyButtonSelected = buttonContainer.isAnyButtonSelected();

        this.isEnabled = turn.actionsCounter < turn.maxActions && turn.state != TurnStates.INITIALIZE && timer.value > 0;

        // Los del menu y la ayuda rapida responden siempre que su ventana esta abierta, aunque haya un boton de la partida
        // pulsado (una accion a medias o terminar turno) o no queden acciones: si no, no habia forma de salir de ellas
        const isWindowButton = this.renderState === renderState.MENU || this.renderState === renderState.QUICK_HELP;

        if (this.isEnabled || isWindowButton || turn.state != TurnStates.INITIALIZE && this.id === ButttonsId.BTN_CHANGE_LANGUAGE || turn.state != TurnStates.INITIALIZE && this.id === ButttonsId.BTN_RETURN_TO_MENU){
            
            // MAQUINA DE ESTADOS
            switch(state){
                case ButtonState.NOT_SELECTED:
                
                    this.state = isCollidingWithMouse ? this.state = ButtonState.HOVER : ButtonState.NOT_SELECTED;
                    this.color = "#582900";
                    break;

                case ButtonState.HOVER:

                    this.state = isCollidingWithMouse ? this.state = ButtonState.HOVER : ButtonState.NOT_SELECTED;

                    if (this.id != ButttonsId.BTN_CHANGE_LANGUAGE && this.id != ButttonsId.BTN_RETURN_TO_MENU && this.id != ButttonsId.BTN_QUICK_HELP && !isWindowButton){

                        this.state = !mouse.leftClick && !isAnyButtonSelected && mouse.previousStateLeft ? ButtonState.SELECTED : this.state;
                    }

                    else{

                        this.state = !mouse.leftClick && mouse.previousStateLeft ? ButtonState.SELECTED : this.state;
                    }
                    
                    break;

                case ButtonState.SELECTED:
                    
                    this.state = !mouse.leftClick && mouse.previousStateLeft && isCollidingWithMouse ? ButtonState.NOT_SELECTED : this.state;
                    this.color = "red";
                    break;
            }
        }
    }

    deselect(){

        this.state = ButtonState.NOT_SELECTED;
    }
}