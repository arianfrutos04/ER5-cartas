import { BorderId, CardActions, TooltipText, TypeId, TypeNames } from "./constants.js";
import { Placement, TooltipInk, TypeInk, drawTooltip, getAppear } from "./tooltipStyle.js";

export const TOOLTIP_DELAY = 0.6;       // Segundos con el raton encima antes de que salga

// El tooltip que se ha pedido en este fotograma; si se piden varios, sale el ultimo
let pending = undefined;
let frame = 0;                          // Fotogramas pintados, para saber si un tooltip se pidio tambien en el anterior
const appearState = {};

export default class Tooltip {

    constructor(category, texts, timer){

        this.category   = category;
        this.texts      = texts;
        this.timer      = timer;
    }

    // La carta con el raton encima pide su tooltip, que sale a su lado
    request(card){

        Tooltip.show(card, getCardArea(card), (language) => this.getContent(card, language));
    }

    // Se pide al pintar y se pinta al final, por encima de todo el tablero. key es lo que explica: si cambia, vuelve a
    // esperar antes de salir
    static show(key, anchor, getContent, delay = TOOLTIP_DELAY, placement = Placement.AUTO){

        pending = { key: key, anchor: anchor, getContent: getContent, delay: delay, placement: placement };
    }

    static renderPending(ctx, language){

        if (pending !== undefined){

            const appear = getAppear(appearState, pending.key, pending.delay, frame);

            if (appear > 0){

                drawTooltip(ctx, pending.getContent(language), pending.anchor, pending.placement, appear);
            }
        }

        pending = undefined;
    }

    // Se llama al acabar cada fotograma, se haya pintado o no el tooltip
    static clearPending(){

        pending = undefined;
        frame++;
    }

    // Nombre y tipo; en los esbirros, su alcance y su equipo; en los eventos, lo que hacen y como estan
    getContent(card, language){

        const content = {
            title:          this.texts.texts[1].text[language].trim(),
            subtitle:       TypeNames[this.category][language],
            subtitleInk:    TypeInk[this.category],
        };

        if (this.category === TypeId.MINION){

            content.sections = [getMinionLines(card, language)];
        }

        else{

            content.sections = [[{ text: this.texts.texts[0].text[language].trim() }]];

            const status = getEventStatus(card, this.category, language);

            if (status !== undefined){

                content.sections.push([status]);
            }
        }

        return content;
    }
}

// Lo que se ve de la carta segun su tamano. A las pequenas (esbirros, heroes y Joseph) con el raton encima se les pinta
// un brillo que sobresale 5 px por la izquierda y 3 por la derecha, y el tooltip se separa desde ahi como de lo demas
const HOVER_GLOW_LEFT   = 5;
const HOVER_GLOW_RIGHT  = 3;

export function getCardArea(card){

    if (card.size === BorderId.SMALL_SIZE){

        return { xPos: card.xPos - HOVER_GLOW_LEFT, yPos: card.yPos, width: 133 + HOVER_GLOW_LEFT + HOVER_GLOW_RIGHT, height: 155 };
    }

    const [width, height] = card.size === BorderId.NORMAL_SIZE ? [197.6, 303.2] : [93, 93];

    return { xPos: card.xPos, yPos: card.yPos, width: width, height: height };
}

// Hasta donde ataca (1 sin arma) y el arma y la armadura que lleva, con lo que les queda
function getMinionLines(minion, language){

    const range = minion.weapon !== undefined ? minion.weapon.range : 1;
    const lines = [{ text: TooltipText.RANGE[language] + " " + range }];

    if (minion.weapon !== undefined){

        lines.push({ text: TooltipText.WEAPON[language] + getEquipmentText(minion.weapon, language), ink: TypeInk[TypeId.WEAPON] });
    }

    if (minion.armor !== undefined){

        lines.push({ text: TooltipText.ARMOR[language] + getEquipmentText(minion.armor, language), ink: TypeInk[TypeId.ARMOR] });
    }

    if (minion.weapon === undefined && minion.armor === undefined){

        lines.push({ text: TooltipText.NO_EQUIPMENT[language], ink: TooltipInk.MUTED });
    }

    return lines;
}

function getEquipmentText(equipment, language){

    // La durabilidad y su numero van juntos aunque no quepan en la linea
    return equipment.texts.texts[1].text[language].trim() + " (" + TooltipText.DURABILITY[language] + "\u00a0" + Math.ceil(equipment.durability) + ")";
}

// Cuanto le falta para estar lista, si ya lo esta, o cuanto le queda aplicada o equipada
function getEventStatus(card, category, language){

    const isEquipment = category === TypeId.WEAPON || category === TypeId.ARMOR;

    switch (card.action){

        case CardActions.COOLDOWN:
            return { text: TooltipText.COOLDOWN_LEFT[language] + Math.ceil(card.cooldown), ink: TooltipInk.MUTED };

        case CardActions.READY:
            return { text: TooltipText.READY[language], ink: TooltipInk.READY };

        case CardActions.ON_USE:
        case CardActions.WORN_OUT:

            if (isEquipment){

                return { text: TooltipText.EQUIPPED[language] + Math.ceil(card.durability), ink: TooltipInk.MUTED };
            }

            if (card.durability === null){

                return { text: TooltipText.APPLIED_PERMANENT[language], ink: TooltipInk.MUTED };
            }

            return { text: TooltipText.APPLIED_TURNS[language] + Math.ceil(card.durability), ink: TooltipInk.MUTED };

        default:
            return undefined;
    }
}
