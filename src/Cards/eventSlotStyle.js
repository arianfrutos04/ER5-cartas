import { IconsPos } from "../constants.js";
import Slot from "../Slot.js";

const EVENT_SLOT_RADIUS = 13;

// Imagen de la carta ocupando su Slot de eventos, con las esquinas redondeadas del Slot
export function drawEventSlotImage(ctx, image, xPos, yPos){

    ctx.save();
    Slot.roundedPath(ctx, xPos, yPos, IconsPos.EVENT_FADE_WIDTH, IconsPos.EVENT_FADE_HEIGTH, EVENT_SLOT_RADIUS);
    ctx.clip();
    ctx.drawImage(image, xPos, yPos, IconsPos.EVENT_FADE_WIDTH, IconsPos.EVENT_FADE_HEIGTH);
    ctx.restore();
}

// Sombra sobre la carta, mas oscura abajo para que se lean el contador y el estado
export function eventFade(ctx, xPos, yPos){

    const width = IconsPos.EVENT_FADE_WIDTH;
    const height = IconsPos.EVENT_FADE_HEIGTH;

    ctx.save();
    Slot.roundedPath(ctx, xPos, yPos, width, height, EVENT_SLOT_RADIUS);

    const gradient = ctx.createLinearGradient(0, yPos, 0, yPos + height);
    gradient.addColorStop(0, "rgba(10, 6, 3, 0.30)");
    gradient.addColorStop(0.55, "rgba(10, 6, 3, 0.48)");
    gradient.addColorStop(1, "rgba(10, 6, 3, 0.72)");
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255, 226, 160, 0.22)";
    ctx.stroke();
    ctx.restore();
}

// Borde de la carta lista para usar, del color de su tipo
export function eventReadyGlow(ctx, xPos, yPos, color){

    const width = IconsPos.EVENT_FADE_WIDTH;
    const height = IconsPos.EVENT_FADE_HEIGTH;

    ctx.save();
    Slot.roundedPath(ctx, xPos, yPos, width, height, EVENT_SLOT_RADIUS);
    ctx.clip();
    Slot.roundedPath(ctx, xPos + 1.5, yPos + 1.5, width - 3, height - 3, EVENT_SLOT_RADIUS - 1);
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
}

// Borde de la carta seleccionada o con el raton encima
export function eventSelectGlow(ctx, xPos, yPos, isSelected){

    const width = IconsPos.EVENT_FADE_WIDTH;
    const height = IconsPos.EVENT_FADE_HEIGTH;
    const [red, green, blue] = isSelected ? [255, 210, 90] : [255, 240, 205];

    ctx.save();
    Slot.roundedPath(ctx, xPos, yPos, width, height, EVENT_SLOT_RADIUS);
    ctx.clip();
    Slot.roundedPath(ctx, xPos + 1.5, yPos + 1.5, width - 3, height - 3, EVENT_SLOT_RADIUS - 1);
    ctx.shadowColor = `rgba(${red}, ${green}, ${blue}, 0.95)`;
    ctx.shadowBlur = isSelected ? 16 : 11;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${isSelected ? 0.95 : 0.8})`;
    ctx.stroke();
    ctx.restore();
}
