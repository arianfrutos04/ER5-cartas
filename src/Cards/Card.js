
import Mouse from "../Mouse.js";
import { BoardCardSizes, CardActions, CardId, DecksId, TypeId } from "../constants.js";

// Las cartas de la mano se giran al taparse o destaparse, una un poco despues que la anterior
const FLIP_DURATION = 0.35;
const FLIP_STAGGER  = 0.06;

// Los esbirros nuevos vuelan desde el mazo hasta su Slot y al llegar dejan un resplandor
const SPAWN_DURATION    = 0.75;
const SPAWN_GLOW        = 0.5;
const SPAWN_ARC_HEIGHT  = 140;

export default class Card{

    constructor(id, texts, image, rarity, category, type = "Melee", xPos, yPos, imageRarity, imageAttributes, imageBorders, imageCategory, imageReverse,imageVFX, toolTip){

        this.id             = id;
        // this.name           = name;
        // this.description    = description;
        this.texts          = texts;
        this.image          = image;
        this.imageRarity    = imageRarity
        this.imageAttributes = imageAttributes
        this.imageBorders   = imageBorders
        this.imageCategory  = imageCategory
        this.imageReverse   = imageReverse
        this.imageVFX       = imageVFX
        this.rarity         = rarity;
        this.category       = category;
        this.type           = type; 
        this.xPos           = xPos;
        this.yPos           = yPos;
        this.toolTip        = toolTip;
        this.size           = CardId.BIG_SIZE;
        this.previousSize   = CardId.BIG_SIZE;
        this.state          = CardId.NOT_SELECTED;
        this.previousState  = CardId.NOT_SELECTED;
        this.action         = CardActions.DEFAULT;
        this.previousAction = CardActions.DEFAULT;
        this.deck
        // this.objective      = objective;
    }
    startSpawn(xFrom, yFrom, delay){

        this.spawn = { xFrom: xFrom, yFrom: yFrom, start: performance.now() / 1000 + delay };
    }

    // Mientras vuela la carta sigue en su Slot para el juego; solo se dibuja desplazada, mas pequena y girada
    setSpawnTransform(ctx){

        const time = (performance.now() / 1000 - this.spawn.start) / SPAWN_DURATION;

        if (time >= 1 + SPAWN_GLOW / SPAWN_DURATION){

            this.spawn = undefined;
            return;
        }

        const progress = Math.min(1, Math.max(0, time));
        const eased = progress < 0.5 ? 4 * Math.pow(progress, 3) : 1 - Math.pow(2 - 2 * progress, 3) / 2;
        const xTarget = this.xPos + BoardCardSizes.X_SIZE / 2;
        const yTarget = this.yPos + BoardCardSizes.Y_SIZE / 2;

        if (time > 0.85){

            this.renderSpawnGlow(ctx, xTarget, yTarget, (time - 0.85) * SPAWN_DURATION / (SPAWN_GLOW + 0.15 * SPAWN_DURATION));
        }

        const xCenter = this.spawn.xFrom + (xTarget - this.spawn.xFrom) * eased;
        const yCenter = this.spawn.yFrom + (yTarget - this.spawn.yFrom) * eased - Math.sin(progress * Math.PI) * SPAWN_ARC_HEIGHT;
        const yScale = 0.55 + 0.45 * eased;
        const xScale = yScale * Math.sin(progress * Math.PI / 2);

        ctx.setTransform(xScale, 0, 0, yScale, xCenter - xScale * xTarget, yCenter - yScale * yTarget);
    }

    renderSpawnGlow(ctx, xCenter, yCenter, progress){

        const alpha = Math.sin(Math.min(1, progress) * Math.PI) * 0.75;
        const radius = 70 + 50 * progress;
        const gradient = ctx.createRadialGradient(xCenter, yCenter, 0, xCenter, yCenter, radius);

        gradient.addColorStop(0, `rgba(255, 226, 140, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 180, 60, ${alpha * 0.45})`);
        gradient.addColorStop(1, "rgba(255, 160, 40, 0)");

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(xCenter, yCenter, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Al cambiar de turno los esbirros y los personajes se estrechan alrededor de su centro para darse la vuelta
    setSwapTransform(ctx){

        if (this.spawn !== undefined){

            this.setSpawnTransform(ctx);
            return;
        }

        if (this.swapScale !== undefined){

            const xCenter = this.xPos + BoardCardSizes.X_SIZE / 2;

            ctx.setTransform(this.swapScale, 0, 0, 1, xCenter * (1 - this.swapScale), 0);
        }
    }

    // Transformacion de las cartas de la mano (al 80 %); mientras se giran se estrechan alrededor de su centro
    setHandTransform(ctx){

        this.updateFlip();

        const scale = this.getFlipScale();
        const xCenter = this.xPos + this.imageReverse.width * 0.4;

        ctx.setTransform(0.8 * scale, 0, 0, 0.8, xCenter * (1 - scale), 0);
    }

    // El giro empieza cuando la carta pasa a estar tapada o destapada
    updateFlip(){

        const isBlocked = this.state === CardId.BLOCKED;

        if (this.wasBlocked !== undefined && this.wasBlocked !== isBlocked){

            this.flipStart = performance.now() / 1000 + this.deck.cards.indexOf(this) * FLIP_STAGGER;
        }

        this.wasBlocked = isBlocked;
    }

    getFlipProgress(){

        if (this.flipStart === undefined){

            return 1;
        }

        return Math.min(1, Math.max(0, (performance.now() / 1000 - this.flipStart) / FLIP_DURATION));
    }

    getFlipScale(){

        return Math.max(0.02, Math.abs(Math.cos(this.getFlipProgress() * Math.PI)));
    }

    // Hasta la mitad del giro se sigue viendo la cara de antes
    isShowingBack(){

        const isBlocked = this.state === CardId.BLOCKED;

        return this.getFlipProgress() < 0.5 ? !isBlocked : isBlocked;
    }

    isInEventSlot(size){

        return size === CardId.EVENT_SIZE && this.deck.deckId !== DecksId.PLAYER_1_HAND_DECK && this.deck.deckId !== DecksId.PLAYER_2_HAND_DECK;
    }

    updateScale(mouse, decks){
        
    }
    update(mouse, decks){

    }
    render(){
        
    }
}
