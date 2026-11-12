import { ScreenSize, TypeId } from "./constants.js";
import Slot from "./Slot.js";

// Estilo comun de los tooltips: pergamino con marco de bronce y oro, como los paneles del tablero, con el titulo en
// Cinzel y el texto en EB Garamond, como la ayuda rapida y la pantalla de fin de partida.
//
// Un tooltip se describe con su contenido y se coloca junto a lo que explica:
//   { title, titleInk, corner, subtitle, subtitleInk, sections: [[{ text, ink }]] }
// Cada seccion son parrafos que se parten en lineas, y entre seccion y seccion va una raya dorada. Sin secciones es un
// tooltip corto, con el titulo y el subtitulo centrados

export const TooltipFont = {
    TITLE:  "Cinzel",
    BODY:   "EB Garamond",
};

export const TooltipInk = {
    TEXT:       "#3b2414",
    TITLE:      "#6b1a0c",
    MUTED:      "#7a5636",
    READY:      "#3f6b1f",
    ENGRAVE:    "rgba(255, 246, 222, 0.8)",
};

// El color de cada tipo de carta, oscurecido para que se lea sobre el pergamino
export const TypeInk = {
    [TypeId.MINION]:    "#6b4423",
    [TypeId.BUFF]:      "#8a5a12",
    [TypeId.CURSE]:     "#5e2a8a",
    [TypeId.HERO]:      "#6b1a0c",
    [TypeId.JOSEPH]:    "#6b1a0c",
    [TypeId.ARMOR]:     "#3d5a78",
    [TypeId.WEAPON]:    "#8f1d1d",
    [TypeId.SPELL]:     "#a3400f",
};

// A que lado de lo que explica sale: hacia el centro de la pantalla, para no tapar los paneles de los lados, o al lado
// que se pida; si no cabe, al otro
export const Placement = {
    AUTO:   0,
    LEFT:   1,
    RIGHT:  2,
};

const WIDTH         = 300;          // Con texto; los cortos se ajustan a su titulo
const SHORT_MIN     = 140;
const SHORT_MAX     = 320;
const PADDING       = 16;
const TITLE_SIZE    = 18;
const SHORT_TITLE   = 19;
const BODY_SIZE     = 17;
const LINE          = 20;
const SECTION_GAP   = 12;
const ANCHOR_GAP    = 12;
const ARROW_SIZE    = 8;            // La flecha que apunta a lo que explica

const RADIUS        = 9;
const FRAME_INSET   = 3.5;
const SCREEN_MARGIN = 8;
const APPEAR_TIME   = 0.15;
const RISE          = 6;            // Lo que sube mientras aparece
const STUD_SIZE     = 5;
const MIN_FONT_SIZE = 12;

// anchor: { xPos, yPos, width, height } de lo que explica; appear: de 0 a 1, lo que ha aparecido
export function drawTooltip(ctx, content, anchor, placement, appear){

    ctx.save();
    ctx.textBaseline = "alphabetic";

    const layout = content.sections !== undefined && content.sections.length > 0 ? layoutLong(ctx, content) : layoutShort(ctx, content);
    const [xPos, yPos, arrow] = placeTooltip(anchor, placement, layout.width, layout.height);

    applyAppear(ctx, appear);
    drawTooltipBox(ctx, xPos, yPos, layout.width, layout.height, arrow);
    layout.draw(xPos, yPos);

    ctx.restore();
}

// Titulo centrado y, si lo hay, una raya y el subtitulo debajo
function layoutShort(ctx, content){

    const hasSubtitle = content.subtitle !== undefined;
    const titleSize = fitFont(ctx, content.title, SHORT_MAX - PADDING * 2, SHORT_TITLE, TooltipFont.TITLE, "700");
    const titleWidth = ctx.measureText(content.title).width;
    ctx.font = BODY_SIZE + 1 + "px '" + TooltipFont.BODY + "'";
    const subtitleWidth = hasSubtitle ? ctx.measureText(content.subtitle).width : 0;
    const width = Math.ceil(Math.min(SHORT_MAX, Math.max(SHORT_MIN, titleWidth + PADDING * 2, subtitleWidth + PADDING * 2)));
    const height = hasSubtitle ? 76 : 50;

    return {
        width: width,
        height: height,
        draw: (xPos, yPos) => {

            ctx.textAlign = "center";
            ctx.font = "700 " + titleSize + "px '" + TooltipFont.TITLE + "'";
            drawEngraved(ctx, content.title, xPos + width / 2, yPos + (hasSubtitle ? 32 : 32), content.titleInk ?? TooltipInk.TITLE);

            if (hasSubtitle){

                drawTooltipDivider(ctx, xPos + PADDING, yPos + 43, width - PADDING * 2);
                ctx.font = BODY_SIZE + 1 + "px '" + TooltipFont.BODY + "'";
                drawEngraved(ctx, content.subtitle, xPos + width / 2, yPos + 63, content.subtitleInk ?? TooltipInk.TEXT);
            }
        },
    };
}

// Titulo (con una nota a la derecha si la hay), subtitulo, y las secciones de texto separadas por rayas
function layoutLong(ctx, content){

    const textWidth = WIDTH - PADDING * 2;
    const bodyFont = BODY_SIZE + "px '" + TooltipFont.BODY + "'";

    ctx.font = bodyFont;
    const cornerWidth = content.corner !== undefined ? ctx.measureText(content.corner).width + 10 : 0;
    const subtitle = content.subtitle !== undefined ? splitLines(ctx, content.subtitle, textWidth) : [];
    const sections = content.sections.map((section) => section.flatMap((paragraph) => splitLines(ctx, paragraph.text, textWidth).map((line) => ({ text: line, ink: paragraph.ink }))));
    const titleSize = fitFont(ctx, content.title, textWidth - cornerWidth, TITLE_SIZE, TooltipFont.TITLE, "700");

    // Lineas base de cada parte, de arriba abajo
    const titleY = PADDING + TITLE_SIZE;
    let bottom = titleY + subtitle.length * (LINE + 1);
    const lines = [];
    const dividers = [];

    for (let i = 0; i < sections.length; i++){

        const dividerY = bottom + (i === 0 ? 10 : SECTION_GAP);
        dividers.push(dividerY);
        bottom = dividerY + 2;

        for (let j = 0; j < sections[i].length; j++){

            bottom += LINE;
            lines.push({ ...sections[i][j], yPos: bottom });
        }
    }

    const height = bottom + PADDING - 4;

    return {
        width: WIDTH,
        height: height,
        draw: (xPos, yPos) => {

            ctx.textAlign = "left";
            ctx.font = "700 " + titleSize + "px '" + TooltipFont.TITLE + "'";
            drawEngraved(ctx, content.title, xPos + PADDING, yPos + titleY, content.titleInk ?? TooltipInk.TITLE);

            ctx.font = bodyFont;

            if (content.corner !== undefined){

                ctx.textAlign = "right";
                drawEngraved(ctx, content.corner, xPos + WIDTH - PADDING, yPos + titleY, TooltipInk.MUTED);
                ctx.textAlign = "left";
            }

            for (let i = 0; i < subtitle.length; i++){

                drawEngraved(ctx, subtitle[i], xPos + PADDING, yPos + titleY + (i + 1) * (LINE + 1), content.subtitleInk ?? TooltipInk.TEXT);
            }

            for (let i = 0; i < dividers.length; i++){

                drawTooltipDivider(ctx, xPos + PADDING, yPos + dividers[i], textWidth);
            }

            for (let i = 0; i < lines.length; i++){

                drawEngraved(ctx, lines[i].text, xPos + PADDING, yPos + lines[i].yPos, lines[i].ink ?? TooltipInk.TEXT);
            }
        },
    };
}

// Al lado de lo que explica y centrado con ello en vertical, sin salirse de la pantalla. Devuelve tambien donde va la
// flecha: en el borde que da a lo que explica y a su altura
function placeTooltip(anchor, placement, width, height){

    const xCenter = anchor.xPos + anchor.width / 2;
    const yCenter = anchor.yPos + anchor.height / 2;
    const xRight = anchor.xPos + anchor.width + ANCHOR_GAP;
    const xLeft = anchor.xPos - ANCHOR_GAP - width;
    const fitsRight = xRight + width <= ScreenSize.X_SIZE - SCREEN_MARGIN;
    const fitsLeft = xLeft >= SCREEN_MARGIN;

    let isRight = placement === Placement.RIGHT || (placement === Placement.AUTO && xCenter < ScreenSize.X_SIZE / 2);

    if (isRight && !fitsRight && fitsLeft){

        isRight = false;
    }

    else if (!isRight && !fitsLeft && fitsRight){

        isRight = true;
    }

    const xPos = Math.min(Math.max(SCREEN_MARGIN, isRight ? xRight : xLeft), ScreenSize.X_SIZE - SCREEN_MARGIN - width);
    const yPos = Math.min(Math.max(SCREEN_MARGIN, yCenter - height / 2), ScreenSize.Y_SIZE - SCREEN_MARGIN - height);
    const arrowY = Math.min(Math.max(RADIUS + ARROW_SIZE, yCenter - yPos), height - RADIUS - ARROW_SIZE);

    return [Math.round(xPos), Math.round(yPos), { isRight: isRight, yPos: Math.round(arrowY) }];
}

// Rectangulo redondeado con la flecha en el lado que da a lo que explica
function tooltipPath(ctx, xPos, yPos, width, height, arrow){

    ctx.beginPath();
    ctx.moveTo(xPos + RADIUS, yPos);
    ctx.arcTo(xPos + width, yPos, xPos + width, yPos + height, RADIUS);

    if (arrow !== undefined && !arrow.isRight){

        ctx.lineTo(xPos + width, yPos + arrow.yPos - ARROW_SIZE);
        ctx.lineTo(xPos + width + ARROW_SIZE, yPos + arrow.yPos);
        ctx.lineTo(xPos + width, yPos + arrow.yPos + ARROW_SIZE);
    }

    ctx.arcTo(xPos + width, yPos + height, xPos, yPos + height, RADIUS);
    ctx.arcTo(xPos, yPos + height, xPos, yPos, RADIUS);

    if (arrow !== undefined && arrow.isRight){

        ctx.lineTo(xPos, yPos + arrow.yPos + ARROW_SIZE);
        ctx.lineTo(xPos - ARROW_SIZE, yPos + arrow.yPos);
        ctx.lineTo(xPos, yPos + arrow.yPos - ARROW_SIZE);
    }

    ctx.arcTo(xPos, yPos, xPos + width, yPos, RADIUS);
    ctx.closePath();
}

export function drawTooltipBox(ctx, xPos, yPos, width, height, arrow){

    ctx.save();

    // Pergamino con sombra, y la flecha hacia lo que explica
    tooltipPath(ctx, xPos, yPos, width, height, arrow);
    ctx.shadowColor = "rgba(12, 6, 2, 0.55)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 5;

    const paper = ctx.createLinearGradient(0, yPos, 0, yPos + height);
    paper.addColorStop(0, "#f7ebcd");
    paper.addColorStop(1, "#e8d2a2");
    ctx.fillStyle = paper;
    ctx.fill();
    ctx.shadowColor = "transparent";

    // Mas oscuro hacia los bordes, como el pergamino de los paneles
    const xCenter = xPos + width / 2;
    const yCenter = yPos + height / 2;
    const shade = ctx.createRadialGradient(xCenter, yCenter, Math.min(width, height) * 0.3, xCenter, yCenter, Math.max(width, height) * 0.75);
    shade.addColorStop(0, "rgba(120, 78, 30, 0)");
    shade.addColorStop(1, "rgba(120, 78, 30, 0.22)");
    ctx.fillStyle = shade;
    ctx.fill();

    // Marco: bronce por fuera y oro por dentro
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#4a2c10";
    ctx.stroke();

    const gold = ctx.createLinearGradient(0, yPos, 0, yPos + height);
    gold.addColorStop(0, "#f0d27a");
    gold.addColorStop(0.5, "#c8962e");
    gold.addColorStop(1, "#8e6118");
    Slot.roundedPath(ctx, xPos + FRAME_INSET, yPos + FRAME_INSET, width - FRAME_INSET * 2, height - FRAME_INSET * 2, RADIUS - FRAME_INSET);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = gold;
    ctx.stroke();

    // Un remache dorado arriba y otro abajo, como los adornos del tablero
    drawStud(ctx, xCenter, yPos);
    drawStud(ctx, xCenter, yPos + height);

    ctx.restore();
}

function drawStud(ctx, xPos, yPos){

    const gold = ctx.createLinearGradient(0, yPos - STUD_SIZE, 0, yPos + STUD_SIZE);
    gold.addColorStop(0, "#fff0b8");
    gold.addColorStop(1, "#b07a22");

    ctx.beginPath();
    ctx.moveTo(xPos, yPos - STUD_SIZE);
    ctx.lineTo(xPos + STUD_SIZE, yPos);
    ctx.lineTo(xPos, yPos + STUD_SIZE);
    ctx.lineTo(xPos - STUD_SIZE, yPos);
    ctx.closePath();
    ctx.fillStyle = gold;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#4a2c10";
    ctx.stroke();
}

// Raya dorada que se apaga por los lados, con un rombo en medio
function drawTooltipDivider(ctx, xPos, yPos, width){

    ctx.save();

    const line = ctx.createLinearGradient(xPos, 0, xPos + width, 0);
    line.addColorStop(0, "rgba(160, 112, 36, 0)");
    line.addColorStop(0.5, "rgba(160, 112, 36, 0.9)");
    line.addColorStop(1, "rgba(160, 112, 36, 0)");
    ctx.fillStyle = line;
    ctx.fillRect(xPos, yPos - 0.5, width, 1);

    const xCenter = xPos + width / 2;
    ctx.beginPath();
    ctx.moveTo(xCenter, yPos - 3);
    ctx.lineTo(xCenter + 3, yPos);
    ctx.lineTo(xCenter, yPos + 3);
    ctx.lineTo(xCenter - 3, yPos);
    ctx.closePath();
    ctx.fillStyle = "#a07024";
    ctx.fill();

    ctx.restore();
}

// Texto grabado en el pergamino: un brillo claro justo debajo de la tinta
function drawEngraved(ctx, text, xPos, yPos, color){

    ctx.fillStyle = TooltipInk.ENGRAVE;
    ctx.fillText(text, xPos, yPos + 1);
    ctx.fillStyle = color;
    ctx.fillText(text, xPos, yPos);
}

// Deja puesta la fuente al tamano que haga caber el texto en ese ancho, sin bajar de un minimo
function fitFont(ctx, text, maxWidth, size, family, weight){

    let fontSize = size;
    ctx.font = weight + " " + fontSize + "px '" + family + "'";

    while (fontSize > MIN_FONT_SIZE && ctx.measureText(text).width > maxWidth){

        fontSize--;
        ctx.font = weight + " " + fontSize + "px '" + family + "'";
    }

    return fontSize;
}

// Parte el texto en lineas que quepan en ese ancho con la fuente puesta, sin cortar por los espacios que no se parten
// y sin dejar una palabra sola en la ultima linea
function splitLines(ctx, text, maxWidth){

    const words = text.split(/[ \t\n]+/).filter((word) => word !== "");
    const lines = [];
    let line = "";

    for (let i = 0; i < words.length; i++){

        const candidate = line === "" ? words[i] : line + " " + words[i];

        if (ctx.measureText(candidate).width > maxWidth && line !== ""){

            lines.push(line);
            line = words[i];
        }

        else{

            line = candidate;
        }
    }

    if (line !== ""){

        lines.push(line);
    }

    // Si la ultima linea se queda con una palabra, baja tambien la ultima de la anterior
    const last = lines.length - 1;

    if (last > 0 && !lines[last].includes(" ")){

        const previous = lines[last - 1].split(" ");
        const moved = previous[previous.length - 1] + " " + lines[last];

        if (previous.length > 2 && ctx.measureText(moved).width <= maxWidth){

            lines[last - 1] = previous.slice(0, -1).join(" ");
            lines[last] = moved;
        }
    }

    return lines;
}

// De 0 a 1, lo que ha aparecido un tooltip que lleva "delay" segundos pidiendose para lo mismo. El estado guarda desde
// cuando: si en el fotograma anterior no se pidio o cambia lo que hay debajo del raton, vuelve a empezar. Se cuenta por
// fotogramas y no por tiempo para que salga igual aunque el juego vaya lento
export function getAppear(state, key, delay, frame){

    const now = performance.now() / 1000;

    if (state.key !== key || state.frame !== frame - 1){

        state.key = key;
        state.start = now;
    }

    state.frame = frame;

    return Math.min(1, Math.max(0, (now - state.start - delay) / APPEAR_TIME));
}

// Mientras aparece se funde y sube un poco hasta su sitio
function applyAppear(ctx, appear){

    const ease = 1 - Math.pow(1 - appear, 2);

    ctx.globalAlpha *= ease;
    ctx.translate(0, (1 - ease) * RISE);
}
