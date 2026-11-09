import { IconsPos } from "./constants.js";
import Slot from "./Slot.js";

// Cuando una carta sale del grid de preparacion (se acaba su efecto, se gasta un hechizo o se rompe el arma o la
// armadura que lleva un esbirro) se oscurece en su hueco y se deshace en humo, como un esbirro al morir. Si salen
// varias a la vez se deshacen una detras de otra, y las demas cartas de ese grid esperan a que se hayan ido todas para
// recolocarse. Las que destruye Joseph no pasan por aqui: arden en su entrada
const STAGGER_TIME  = 0.12;         // Entre una carta y la siguiente cuando salen a la vez
const DARKEN_TIME   = 0.15;         // Se oscurece antes de echar humo
const FADE_TIME     = 0.45;         // Se apaga dentro del humo
const DARKNESS      = 0.75;         // Lo oscura que acaba
const SHRINK        = 0.15;
const RISE          = 8;            // Lo que sube mientras se apaga
const SLOT_RADIUS   = 13;

export default class CardBreaks{

    constructor(canvas, particlesContainer){

        this.canvas             = canvas;
        this.particlesContainer = particlesContainer;
        this.width              = Math.ceil(IconsPos.EVENT_FADE_WIDTH);
        this.height             = Math.ceil(IconsPos.EVENT_FADE_HEIGTH);
        this.slots              = [];       // Cartas de los grids de preparacion en el ultimo fotograma, con su hueco
        this.breaks             = [];
    }

    // Se llama despues de actualizar el turno: el lienzo aun tiene el ultimo fotograma, con las cartas que acaban de
    // salir en su hueco
    update(preparingDecks, graveyardDeck, isJosephEntering, deltaTime){

        const cards = preparingDecks.flatMap((deck) => deck.cards);

        if (!isJosephEntering){

            const brokenSlots = this.slots.filter((slot) => !cards.includes(slot.card) && graveyardDeck.cards.includes(slot.card));

            // De arriba abajo y de izquierda a derecha
            brokenSlots.sort((first, second) => first.yPos - second.yPos || first.xPos - second.xPos);

            for (let i = 0; i < brokenSlots.length; i++){

                this.breaks.push({ xPos: brokenSlots[i].xPos, yPos: brokenSlots[i].yPos, image: this.copySlot(brokenSlots[i]), time: -i * STAGGER_TIME, hasSmoked: false });
            }
        }

        this.slots = cards.map((card) => ({ card: card, xPos: Math.round(card.xPos), yPos: Math.round(card.yPos) }));

        for (let i = this.breaks.length - 1; i >= 0; i--){

            const cardBreak = this.breaks[i];

            // Si otra carta ocupa ya su hueco no se queda esperando encima de ella
            if (cardBreak.time < 0 && this.slots.some((slot) => slot.xPos === cardBreak.xPos && slot.yPos === cardBreak.yPos)){

                cardBreak.time = 0;
            }

            cardBreak.time += deltaTime;

            if (!cardBreak.hasSmoked && cardBreak.time >= DARKEN_TIME){

                cardBreak.hasSmoked = true;
                this.particlesContainer.createCardSmoke(cardBreak.xPos, cardBreak.yPos, this.width, this.height);
            }

            if (cardBreak.time >= DARKEN_TIME + FADE_TIME){

                this.breaks.splice(i, 1);
            }
        }
    }

    // Si a alguna carta de ese grid aun le falta irse
    isBreakingIn(grid){

        if (this.breaks.length === 0){

            return false;
        }

        const slots = grid.slots.flat();

        return this.breaks.some((cardBreak) => slots.some((slot) => Math.abs(slot.xPos - cardBreak.xPos) < this.width && Math.abs(slot.yPos - cardBreak.yPos) < this.height));
    }

    // La carta como se vio en el ultimo fotograma, recortada con la forma redondeada del hueco
    copySlot(slot){

        const image = document.createElement("canvas");
        image.width = this.width;
        image.height = this.height;

        const context = image.getContext("2d");
        Slot.roundedPath(context, 0, 0, this.width, this.height, SLOT_RADIUS);
        context.clip();
        context.drawImage(this.canvas, slot.xPos, slot.yPos, this.width, this.height, 0, 0, this.width, this.height);

        return image;
    }

    render(ctx){

        for (let i = 0; i < this.breaks.length; i++){

            this.renderBreak(ctx, this.breaks[i]);
        }
    }

    // Mientras espera se queda entera; despues se oscurece y, ya entre el humo, encoge, sube un poco y se apaga
    renderBreak(ctx, cardBreak){

        const time = Math.max(0, cardBreak.time);
        const darken = Math.min(1, time / DARKEN_TIME);
        const fade = Math.min(1, Math.max(0, (time - DARKEN_TIME) / FADE_TIME));
        const alpha = 1 - fade * fade * (3 - 2 * fade);
        const scale = 1 - SHRINK * fade;
        const darkness = DARKNESS * (0.6 * darken + 0.4 * fade);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cardBreak.xPos + this.width / 2, cardBreak.yPos + this.height / 2 - RISE * fade);
        ctx.scale(scale, scale);
        ctx.translate(-this.width / 2, -this.height / 2);
        ctx.drawImage(cardBreak.image, 0, 0);

        if (darkness > 0){

            Slot.roundedPath(ctx, 0, 0, this.width, this.height, SLOT_RADIUS);
            ctx.fillStyle = `rgba(12, 8, 6, ${darkness})`;
            ctx.fill();
        }

        ctx.restore();
    }
}
