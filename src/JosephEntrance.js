import { CardActions, CardId, IconsPos, MessageState, MessageType, Sound } from "./constants.js";

// Entrada de Joseph: solo es visual. Cuando la carta se activa, su efecto ya ha destruido esbirros y eventos;
// esta escena lo cuenta a la luz de una vela: la taberna se queda a oscuras, las cartas del tablero arden como
// papel desde el centro hacia fuera y, entre las brasas, la carta de Joseph sube boca abajo, se gira con un
// destello dorado y vuela a su sitio

const DURATION          = 3.6;
const VEIL_IN_TIME      = 0.4;
const LIGHT_START       = 0.15;
const LIGHT_IN_TIME     = 0.5;
const BURN_START        = 0.35;
const BURN_SPREAD       = 0.35;
const BURN_TIME         = 0.8;
const RISE_START        = 1.2;
const RISE_TIME         = 0.45;
const FLIP_START        = 1.75;
const FLIP_TIME         = 0.4;
const REVEAL_TIME       = FLIP_START + FLIP_TIME / 2;
const FLY_START         = 2.85;
const FLY_END           = 3.5;
const LAND_TIME         = FLY_START + (FLY_END - FLY_START) * 0.75;
const SHAKE_TIME        = 0.3;
const SHAKE_SIZE        = 8;

// El fuego avanza por cada carta como una franja de brasas; por delante el papel se tuesta y por detras ya es ceniza
const EMBER_BAND        = 0.08;
const SCORCH_BAND       = 0.14;
const EMBERS_PER_SECOND = 40;
const RISING_EMBERS     = 20;

// Centro del tablero, donde prende la vela y aparece Joseph
const CENTER_X          = 979;
const CENTER_Y          = 442;
const MAX_DISTANCE      = 1100;

const CARD_WIDTH        = 247;
const CARD_HEIGHT       = 379;
const CARD_MARGIN       = 24;
const CARD_SCALE        = 1.4;
const SLOT_X            = 1750;
const SLOT_Y            = 44;
const SLOT_WIDTH        = 133;
const SLOT_HEIGHT       = 155;

const CANDLE            = [255, 200, 110];
const FLAME             = [255, 140, 50];
const GOLD_LIGHT        = [255, 225, 150];

export default class JosephEntrance{

    // victims son los huecos que ocupaban los esbirros y eventos destruidos; se copian del ultimo fotograma pintado
    constructor(card, victims, canvas, particlesContainer, soundManager, messagesContainer){

        this.card               = card;
        this.canvas             = canvas;
        this.particlesContainer = particlesContainer;
        this.soundManager       = soundManager;
        this.messagesContainer  = messagesContainer;
        this.time               = 0;
        this.hasIgnited         = false;
        this.hasRevealed        = false;
        this.hasLanded          = false;
        this.cardImage          = undefined;            // La carta grande ya pintada, para no repintarla en cada fotograma
        this.cardGlow           = undefined;
        this.backImage          = this.createBackImage();
        this.backGlow           = this.createGlow(this.backImage, GOLD_LIGHT);
        this.victims            = victims.map((victim) => this.copyVictim(victim));

        this.card.isEntering = true;
    }

    // Se recorta con la forma de la carta (ovalada los esbirros, redondeada los eventos) para no llevarse el tablero
    copyVictim(victim){

        const image = this.createCanvas(victim.width, victim.height);
        const context = image.getContext("2d");

        context.beginPath();

        if (victim.isEvent){

            context.roundRect(0, 0, victim.width, victim.height, 13);
        }

        else{

            context.ellipse(victim.width / 2, victim.height / 2, victim.width / 2, victim.height / 2, 0, 0, Math.PI * 2);
        }

        context.clip();
        context.drawImage(this.canvas, victim.xPos, victim.yPos, victim.width, victim.height, 0, 0, victim.width, victim.height);

        const xCenter = victim.xPos + victim.width / 2;
        const yCenter = victim.yPos + victim.height / 2;
        const distance = Math.hypot(xCenter - CENTER_X, yCenter - CENTER_Y);
        const angle = Math.atan2(yCenter - CENTER_Y, xCenter - CENTER_X);

        return {
            ...victim,
            image:          image,
            context:        context,
            pixels:         context.getImageData(0, 0, victim.width, victim.height).data,
            burnt:          context.createImageData(victim.width, victim.height),
            burnMap:        this.createBurnMap(victim.width, victim.height, angle + Math.PI, distance > 1),
            xCenter:        xCenter,
            yCenter:        yCenter,
            seed:           Math.random() * Math.PI * 2,

            // El fuego llega antes a las cartas mas cercanas al centro
            burnStart:      BURN_START + Math.min(1, distance / MAX_DISTANCE) * BURN_SPREAD,
            isBurnt:        false,
        };
    }

    // Cuando arde cada pixel, de 0 a 1: prende por el lado que mira al centro y avanza con un frente irregular
    createBurnMap(width, height, fireAngle, isFacingCenter){

        const angle = isFacingCenter ? fireAngle : Math.random() * Math.PI * 2;
        const xFire = width / 2 + Math.cos(angle) * width / 2;
        const yFire = height / 2 + Math.sin(angle) * height / 2;
        const diagonal = Math.hypot(width, height);
        const bigNoise = this.createNoise(width, height, 18);
        const smallNoise = this.createNoise(width, height, 6);
        const map = new Float32Array(width * height);
        let min = Infinity;
        let max = -Infinity;

        for (let y = 0; y < height; y++){

            for (let x = 0; x < width; x++){

                const noise = 0.65 * this.getNoise(bigNoise, x, y) + 0.35 * this.getNoise(smallNoise, x, y);
                const value = Math.hypot(x - xFire, y - yFire) / diagonal + noise * 0.45;

                map[y * width + x] = value;
                min = Math.min(min, value);
                max = Math.max(max, value);
            }
        }

        for (let i = 0; i < map.length; i++){

            map[i] = (map[i] - min) / (max - min);
        }

        return map;
    }

    // Ruido suave: valores al azar en una rejilla, mezclados con suavidad entre sus puntos
    createNoise(width, height, cellSize){

        const columns = Math.ceil(width / cellSize) + 2;
        const rows = Math.ceil(height / cellSize) + 2;
        const values = new Float32Array(columns * rows);

        for (let i = 0; i < values.length; i++){

            values[i] = Math.random();
        }

        return { values: values, columns: columns, cellSize: cellSize };
    }

    getNoise(noise, x, y){

        const xGrid = x / noise.cellSize;
        const yGrid = y / noise.cellSize;
        const xCell = Math.floor(xGrid);
        const yCell = Math.floor(yGrid);
        const xStep = this.smooth(xGrid - xCell);
        const yStep = this.smooth(yGrid - yCell);
        const values = noise.values;
        const index = yCell * noise.columns + xCell;
        const top = values[index] + (values[index + 1] - values[index]) * xStep;
        const bottom = values[index + noise.columns] + (values[index + noise.columns + 1] - values[index + noise.columns]) * xStep;

        return top + (bottom - top) * yStep;
    }

    // El reverso con el mismo margen que la carta pintada, para dibujar las dos caras igual
    createBackImage(){

        const image = this.createCanvas(CARD_WIDTH + CARD_MARGIN * 2, CARD_HEIGHT + CARD_MARGIN * 2);
        image.getContext("2d").drawImage(this.card.imageReverse, CARD_MARGIN, CARD_MARGIN, CARD_WIDTH, CARD_HEIGHT);

        return image;
    }

    // Silueta de un color con la forma de la imagen; sumada encima hace brillar la imagen
    createGlow(image, color){

        const glow = this.createCanvas(image.width, image.height);
        const context = glow.getContext("2d");

        context.drawImage(image, 0, 0);
        context.globalCompositeOperation = "source-atop";
        context.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        context.fillRect(0, 0, glow.width, glow.height);

        return glow;
    }

    createCanvas(width, height){

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        return canvas;
    }

    isPlaying(){

        return this.time < DURATION;
    }

    update(deltaTime){

        this.time += deltaTime;

        for (let i = 0; i < this.victims.length; i++){

            const victim = this.victims[i];
            const burn = this.getProgress(this.time - victim.burnStart, BURN_TIME);

            if (burn > 0 && !victim.isBurnt){

                if (!this.hasIgnited){

                    this.hasIgnited = true;
                    this.soundManager.currentSound = Sound.FIREBALL;
                }

                this.burnVictim(victim, burn, deltaTime);
                victim.isBurnt = burn >= 1;
            }
        }

        // Mientras Joseph espera en el centro suben brasas a su alrededor
        if (this.time >= REVEAL_TIME && this.time < FLY_START){

            this.releaseEmbers(RISING_EMBERS * deltaTime, (CARD_WIDTH + 60) * CARD_SCALE, CARD_HEIGHT * CARD_SCALE * 0.6);
        }

        if (!this.hasRevealed && this.time >= REVEAL_TIME){

            this.hasRevealed = true;
            this.soundManager.currentSound = Sound.CURSE;
            this.particlesContainer.createJosephReveal(CENTER_X, CENTER_Y);
        }

        if (!this.hasLanded && this.time >= LAND_TIME){

            this.hasLanded = true;
            this.card.isEntering = false;
            this.particlesContainer.createJosephLanding(SLOT_X + SLOT_WIDTH / 2, SLOT_Y + SLOT_HEIGHT / 2);
            this.speak();
        }

        this.updateShake();

        if (!this.isPlaying()){

            this.canvas.style.transform = "";
        }
    }

    // Repinta la carta con el fuego por donde toca: ceniza por detras, brasas en el frente y papel tostado por delante.
    // Del frente salen chispas
    burnVictim(victim, burn, deltaTime){

        const threshold = -SCORCH_BAND + burn * (1 + EMBER_BAND + SCORCH_BAND);
        const map = victim.burnMap;
        const source = victim.pixels;
        const target = victim.burnt.data;
        const emberCount = Math.floor(EMBERS_PER_SECOND * deltaTime + Math.random());
        const embers = [];
        let frontPixels = 0;

        for (let i = 0; i < map.length; i++){

            const value = map[i];
            const index = i * 4;

            if (value < threshold - EMBER_BAND){

                target[index + 3] = 0;
            }

            else if (value < threshold){

                // Brasa: amarilla en el frente, roja despues y oscura justo antes de deshacerse
                const heat = (threshold - value) / EMBER_BAND;
                let step;

                if (heat < 0.3){

                    step = heat / 0.3;
                    target[index]     = 255;
                    target[index + 1] = 240 - 90 * step;
                    target[index + 2] = 170 - 130 * step;
                }

                else if (heat < 0.7){

                    step = (heat - 0.3) / 0.4;
                    target[index]     = 255 - 65 * step;
                    target[index + 1] = 150 - 100 * step;
                    target[index + 2] = 40 - 30 * step;
                }

                else{

                    step = (heat - 0.7) / 0.3;
                    target[index]     = 190 - 130 * step;
                    target[index + 1] = 50 - 40 * step;
                    target[index + 2] = 10 - 10 * step;
                }

                target[index + 3] = source[index + 3] * (1 - heat * heat);

                // Se eligen al azar unos pocos puntos del frente para soltar chispas
                if (heat < 0.3 && source[index + 3] > 0){

                    frontPixels++;

                    if (embers.length < emberCount){

                        embers.push(i);
                    }

                    else if (Math.random() * frontPixels < emberCount){

                        embers[Math.floor(Math.random() * emberCount)] = i;
                    }
                }
            }

            else{

                // Por delante del fuego el papel se va tostando
                const scorch = value < threshold + SCORCH_BAND ? 0.85 * (1 - (value - threshold) / SCORCH_BAND) : 0;

                target[index]     = source[index]     + (50 - source[index])     * scorch;
                target[index + 1] = source[index + 1] + (25 - source[index + 1]) * scorch;
                target[index + 2] = source[index + 2] + (10 - source[index + 2]) * scorch;
                target[index + 3] = source[index + 3];
            }
        }

        victim.context.putImageData(victim.burnt, 0, 0);

        for (let i = 0; i < embers.length; i++){

            this.particlesContainer.createEmber(victim.xPos + embers[i] % victim.width, victim.yPos + Math.floor(embers[i] / victim.width));
        }
    }

    // Brasas sueltas que suben alrededor del centro
    releaseEmbers(amount, width, height){

        const count = Math.floor(amount + Math.random());

        for (let i = 0; i < count; i++){

            this.particlesContainer.createEmber(CENTER_X + (Math.random() - 0.5) * width, CENTER_Y + (Math.random() - 0.2) * height);
        }
    }

    // Al llegar a su sitio Joseph dice una de sus frases, como cuando se hace clic en el
    speak(){

        if (this.card.previousMessage !== undefined){

            return;
        }

        const message = this.card.messages[Math.floor(Math.random() * this.card.messages.length)];
        this.card.previousMessage = this.messagesContainer.createMessage(IconsPos.JOSEPH_CHAT_TEXT_X, IconsPos.JOSEPH_CHAT_TEXT_Y, message, MessageType.CHAT_MESSAGE, MessageState.APPEAR, 1.5, 0.7, 0.3, 25, 100, 600, 17, "black");
    }

    // La pantalla tiembla cuando se descubre Joseph; se mueve el canvas entero para no depender de como pinta cada carta
    updateShake(){

        const shakeTime = this.time - REVEAL_TIME;

        if (shakeTime < 0 || shakeTime > SHAKE_TIME){

            this.canvas.style.transform = "";
            return;
        }

        const strength = SHAKE_SIZE * Math.pow(1 - shakeTime / SHAKE_TIME, 2);
        const xShake = (Math.random() - 0.5) * 2 * strength;
        const yShake = (Math.random() - 0.5) * 2 * strength;
        this.canvas.style.transform = `translate(${xShake / 1920 * 100}%, ${yShake / 1080 * 100}%)`;
    }

    // Por debajo de las chispas: la taberna a oscuras, la luz de la vela y las cartas que arden
    renderBack(ctx){

        const veil = this.getVeilAlpha();

        ctx.save();

        const darkness = ctx.createRadialGradient(CENTER_X, CENTER_Y, 100, CENTER_X, CENTER_Y, 1250);
        darkness.addColorStop(0, `rgba(35, 18, 8, ${0.55 * veil})`);
        darkness.addColorStop(1, `rgba(10, 5, 2, ${0.9 * veil})`);
        ctx.fillStyle = darkness;
        ctx.fillRect(0, 0, 1920, 1080);

        this.renderCandleLight(ctx);

        for (let i = 0; i < this.victims.length; i++){

            const victim = this.victims[i];

            if (!victim.isBurnt){

                ctx.drawImage(victim.image, victim.xPos, victim.yPos);
            }
        }

        this.renderFireLight(ctx);

        ctx.restore();
    }

    // Luz calida en el centro que tiembla como una vela; crece cuando sube la carta y se aviva al descubrirse Joseph
    renderCandleLight(ctx){

        const fade = this.getProgress(this.time - LIGHT_START, LIGHT_IN_TIME) * (1 - this.getProgress(this.time - FLY_START, 0.3));

        if (fade <= 0){

            return;
        }

        const rise = this.getProgress(this.time - RISE_START, RISE_TIME);
        const reveal = this.getReveal();
        const strength = fade * (0.55 + 0.3 * rise + 0.8 * reveal) * this.getFlicker(0);
        const radius = 280 + 120 * rise + 150 * reveal;

        this.fillLight(ctx, CENTER_X, CENTER_Y, radius, strength);
    }

    // Cada carta que arde ilumina el tablero a su alrededor
    renderFireLight(ctx){

        for (let i = 0; i < this.victims.length; i++){

            const victim = this.victims[i];
            const burn = this.getProgress(this.time - victim.burnStart, BURN_TIME);

            if (burn > 0 && burn < 1){

                const radius = Math.max(victim.width, victim.height) * 0.9;

                this.fillLight(ctx, victim.xCenter, victim.yCenter, radius, 0.45 * Math.sin(burn * Math.PI) * this.getFlicker(victim.seed));
            }
        }
    }

    fillLight(ctx, xPos, yPos, radius, strength){

        const light = ctx.createRadialGradient(xPos, yPos, 0, xPos, yPos, radius);
        light.addColorStop(0, `rgba(${CANDLE[0]}, ${CANDLE[1]}, ${CANDLE[2]}, ${0.5 * strength})`);
        light.addColorStop(0.4, `rgba(${FLAME[0]}, ${FLAME[1]}, ${FLAME[2]}, ${0.22 * strength})`);
        light.addColorStop(1, `rgba(${FLAME[0]}, ${FLAME[1]}, ${FLAME[2]}, 0)`);

        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = light;
        ctx.fillRect(xPos - radius, yPos - radius, radius * 2, radius * 2);
        ctx.globalCompositeOperation = "source-over";
    }

    // Por encima de todo: la carta
    renderFront(ctx, language){

        ctx.save();

        this.renderCard(ctx, language);

        ctx.restore();
    }

    // Sube boca abajo desde la luz, se gira para descubrir a Joseph y despues vuela en arco a su sitio
    renderCard(ctx, language){

        const riseTime = this.time - RISE_START;

        if (riseTime < 0 || this.time >= FLY_END){

            return;
        }

        this.prepareCardImage(ctx, language);

        let xPos = CENTER_X;
        let yPos = CENTER_Y;
        let scale = CARD_SCALE;
        let xScale = 1;
        let angle = 0;
        let alpha = 1;
        const isFaceUp = this.time >= REVEAL_TIME;
        let shine = isFaceUp ? 0.8 * this.getReveal() : 0;

        if (riseTime < RISE_TIME){

            const rise = riseTime / RISE_TIME;
            scale = CARD_SCALE * (0.7 + 0.3 * this.easeOutBack(rise));
            yPos = CENTER_Y + 50 * Math.pow(1 - rise, 2);
            alpha = Math.min(1, riseTime / 0.15);
            shine = 0.35 * (1 - rise);
        }

        else if (this.time < FLIP_START + FLIP_TIME){

            // El giro: la carta se estrecha hasta quedar de canto, cambia de cara y se vuelve a abrir, alzandose un poco
            const flip = this.getProgress(this.time - FLIP_START, FLIP_TIME);
            const eased = flip < 0.5 ? 2 * flip * flip : 1 - Math.pow(2 - 2 * flip, 2) / 2;

            xScale = Math.abs(Math.cos(eased * Math.PI));
            scale = CARD_SCALE * (1 + 0.1 * Math.sin(eased * Math.PI));
            shine = isFaceUp ? shine : 0.8 * flip * 2;
        }

        else if (this.time >= FLY_START){

            const fly = (this.time - FLY_START) / (FLY_END - FLY_START);
            const eased = fly < 0.5 ? 4 * Math.pow(fly, 3) : 1 - Math.pow(2 - 2 * fly, 3) / 2;
            const endScale = SLOT_WIDTH / CARD_WIDTH;

            xPos = CENTER_X + (SLOT_X + SLOT_WIDTH / 2 - CENTER_X) * eased;
            yPos = CENTER_Y + (SLOT_Y + SLOT_HEIGHT / 2 - CENTER_Y) * eased - Math.sin(fly * Math.PI) * 120;
            scale = CARD_SCALE + (endScale - CARD_SCALE) * eased;
            angle = Math.sin(fly * Math.PI) * 0.12;
            alpha = fly < 0.75 ? 1 : 1 - (fly - 0.75) / 0.25;
        }

        const image = isFaceUp ? this.cardImage : this.backImage;
        const glow = isFaceUp ? this.cardGlow : this.backGlow;

        this.drawCard(ctx, image, glow, xPos, yPos, scale * xScale, scale, angle, alpha, shine);
    }

    // La carta grande se pinta una sola vez con su propio render, sin la cuenta atras, que sale en su sitio
    prepareCardImage(ctx, language){

        if (this.cardImage !== undefined){

            return;
        }

        const card = this.card;
        const saved = [card.xPos, card.yPos, card.size, card.action, card.state];
        const image = this.createCanvas(CARD_WIDTH + CARD_MARGIN * 2, CARD_HEIGHT + CARD_MARGIN * 2);
        const context = image.getContext("2d");

        // Los textos de las cartas usan la alineacion que tenga el lienzo del juego; se copia para que salgan igual
        context.textAlign = ctx.textAlign;
        context.textBaseline = ctx.textBaseline;

        card.xPos = CARD_MARGIN;
        card.yPos = CARD_MARGIN;
        card.size = CardId.BIG_SIZE;
        card.action = CardActions.DEFAULT;
        card.state = CardId.NOT_SELECTED;

        card.render(context, language);

        [card.xPos, card.yPos, card.size, card.action, card.state] = saved;

        this.cardImage = image;
        this.cardGlow = this.createGlow(image, GOLD_LIGHT);
    }

    drawCard(ctx, image, glow, xPos, yPos, xScale, yScale, angle, alpha, shine){

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const xImage = -CARD_WIDTH / 2 - CARD_MARGIN;
        const yImage = -CARD_HEIGHT / 2 - CARD_MARGIN;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.setTransform(cos * xScale, sin * xScale, -sin * yScale, cos * yScale, xPos, yPos);

        // Sombra detras de la carta
        ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
        ctx.shadowBlur = 40;
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(-CARD_WIDTH / 2 + 6, -CARD_HEIGHT / 2 + 12, CARD_WIDTH - 12, CARD_HEIGHT - 18);
        ctx.shadowBlur = 0;

        ctx.drawImage(image, xImage, yImage);

        if (shine > 0){

            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = alpha * shine;
            ctx.drawImage(glow, xImage, yImage);
        }

        ctx.restore();
    }

    // Parpadeo de llama: suma de ondas rapidas, distinto para cada fuego
    getFlicker(seed){

        const time = this.time;

        return 0.85 + 0.15 * (0.5 * Math.sin(time * 13 + seed) + 0.3 * Math.sin(time * 29 + seed * 2) + 0.2 * Math.sin(time * 47 + seed * 3));
    }

    getReveal(){

        const revealTime = this.time - REVEAL_TIME;

        return revealTime < 0 ? 0 : Math.exp(-revealTime * 3);
    }

    getVeilAlpha(){

        const fadeIn = Math.min(1, this.time / VEIL_IN_TIME);
        const fadeOut = 1 - this.getProgress(this.time - FLY_START, DURATION - FLY_START);

        return fadeIn * fadeOut;
    }

    getProgress(time, length){

        return Math.min(1, Math.max(0, time / length));
    }

    smooth(progress){

        return progress * progress * (3 - 2 * progress);
    }

    easeOutBack(progress){

        const overshoot = 1.70158;

        return 1 + (overshoot + 1) * Math.pow(progress - 1, 3) + overshoot * Math.pow(progress - 1, 2);
    }
}
