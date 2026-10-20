import { IconsPos, TimerId } from "./constants.js";
import globals from "./globals.js";

export default class Timer{

    constructor (value, timerChangeValue, timerId){

        this.value               = value;               // Valor del temporizador
        this.previousValue       = value                // Valor inicial del Temporizador
        this.timerChangeCounter  = 0;                   // Temporizador para cambiar valor
        this.timerChangeValue    = timerChangeValue;    // Tiempo para cambiar valor (seconds)
        this.timerId             = timerId              // Id del temporizador
    }

    update(){

        if (this.value <= 0){
            
            // Reseteamos el Timer
            this.value = this.previousValue;
        }

        // Incrementamos el contador de cambio de valor
        this.timerChangeCounter += globals.deltaTime;

        // Si ha pasado el tiempo necesario, cambiamos el valor del timer
        if (this.timerChangeCounter > this.timerChangeValue){

            this.value--;

            // Reseteamos timeChangeCounter
            this.timerChangeCounter = 0;
        }
    }

    restart(){
        // Reseteamos el Timer
        this.value = this.previousValue;
    }
    render(ctx){
        const valueRender = this.value <= 0 ? 0 : this.value
        ctx.save()
        ctx.font = "24px LongaIberica-DEMO"
        ctx.lineWidth = 3
        ctx.lineJoin = "round"
        ctx.strokeStyle = "rgba(0, 0, 0, 0.85)"
        ctx.strokeText(valueRender, IconsPos.TURN_TIMER_X, IconsPos.TURN_TIMER_Y)
        ctx.fillStyle = "white"
        ctx.fillText(valueRender, IconsPos.TURN_TIMER_X, IconsPos.TURN_TIMER_Y)
        ctx.restore()
        ctx.fillStyle = "black"
    }

    static createTooltip(){

        const timer = new Timer(0, 1, TimerId.TOOLTIP_TIMER);

        return timer;
    }

    updatePlus(){
        if (this.value <= 0){
            
            // Reseteamos el Timer
            this.value = this.previousValue;
        }

        // Incrementamos el contador de cambio de valor
        this.timerChangeCounter += globals.deltaTime;

        // Si ha pasado el tiempo necesario, cambiamos el valor del timer
        if (this.timerChangeCounter > this.timerChangeValue){

            this.value++;

            // Reseteamos timeChangeCounter
            this.timerChangeCounter = 0;
        }
    }
}