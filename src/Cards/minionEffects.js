import { CardActions, CardId, LanguageId, TooltipText, TypeId } from "../constants.js";
import Tooltip from "../Tooltip.js";
import { Placement, TooltipInk, TypeInk } from "../tooltipStyle.js";

// Medallones de las mejoras y maldiciones de cada esbirro del tablero. Las mejoras se amontonan en la esquina de abajo a
// la izquierda y las maldiciones en la de abajo a la derecha; las de arriba se dejan libres para el arma y la armadura.
// Cada medallon lleva el arte de la carta (o del heroe), los turnos que le quedan y, si tiene varias copias, cuantas son.
// En un monton con varias cartas la moneda de arriba se va girando para ensenarlas todas, y al pasar el raton por
// encima el monton se despliega hacia arriba por el lateral del esbirro y cada moneda explica que hace, con las cuentas
// de todas sus copias

const RADIUS            = 15;
const POP_TIME          = 0.35;
const CYCLE_TIME        = 2.5;          // Segundos que se ve cada carta de un monton antes de girarse a la siguiente
const FLIP_TIME         = 0.3;
const SPREAD_TIME       = 0.18;
const SPREAD_STEP       = 33;           // Distancia entre las monedas desplegadas
const SPREAD_TOP        = 10;           // Hasta donde suben, desde arriba de la casilla
const PILE_OFFSET       = 4;
const PILE_COINS        = 2;            // Monedas que se asoman por detras del monton como mucho
const HOVER_MARGIN      = 4;

const BUFF_CORNER       = [16, 139];
const CURSE_CORNER      = [117, 139];

const BUFF_COLOR        = [255, 205, 80];
const CURSE_COLOR       = [190, 110, 245];

const STAT_NAMES        = { Attack: TooltipText.ATTACK, Defense: TooltipText.DEFENSE, Health: TooltipText.HEALTH, Speed: TooltipText.SPEED };
const DICE_FACES        = 20;

export function renderMinionEffects(ctx, eventContainer, minionDeck, mouse){

    const now = performance.now() / 1000;

    for (let i = 0; i < minionDeck.cards.length; i++){

        const minion = minionDeck.cards[i];
        const piles = getPiles(minion, eventContainer.getMinionEffects(minion));
        const states = minion.effectPiles ?? (minion.effectPiles = { buff: newPileState(), curse: newPileState() });

        // Mientras se da la vuelta al cambiar de turno o entra en el tablero no se ven, ni tampoco hasta que el turno
        // nuevo vuelve a aplicar los efectos: asi no asoman los que se acaban al empezarlo. Salen otra vez con su salto
        if (isTurning(minion) || !eventContainer.areEffectsApplied){

            states.buff = newPileState();
            states.curse = newPileState();
            minion.isEffectHovered = false;
            continue;
        }

        // Con el raton sobre un monton se explica su efecto en vez del esbirro
        minion.isEffectHovered = false;

        for (let j = 0; j < piles.length; j++){

            const pile = piles[j];
            const state = states[pile.key];

            minion.isEffectHovered = updatePile(pile, state, mouse, now) || minion.isEffectHovered;
            drawPile(ctx, pile, state, now);
        }

        // Los montones que se han quedado vacios se olvidan, para que si vuelven a tener cartas salgan con su salto
        for (const key in states){

            if (!piles.some((pile) => pile.key === key)){

                states[key] = newPileState();
            }
        }
    }
}

// Se llama despues de pintar los esbirros de los dos jugadores, para que el recuadro quede por encima de todos
// La moneda con el raton encima pide su tooltip, que sale en cuanto se pasa por encima junto a la moneda ya desplegada,
// hacia fuera del monton: el de las mejoras a la izquierda y el de las maldiciones a la derecha
export function requestMinionEffectTooltip(eventContainer, minionDecks, mouse){

    for (let i = 0; i < minionDecks.length; i++){

        for (let j = 0; j < minionDecks[i].cards.length; j++){

            const minion = minionDecks[i].cards[j];

            if (isTurning(minion) || !eventContainer.areEffectsApplied || minion.effectPiles === undefined){

                continue;
            }

            const piles = getPiles(minion, eventContainer.getMinionEffects(minion));

            for (let k = 0; k < piles.length; k++){

                const effect = getHoveredEffect(piles[k], minion.effectPiles[piles[k].key], mouse);

                if (effect !== undefined){

                    const pile = piles[k].effects.length > 1 ? piles[k] : undefined;
                    const [xCoin, yCoin] = getCoinPositions(piles[k], 1)[piles[k].effects.indexOf(effect)];
                    const area = { xPos: xCoin - RADIUS, yPos: yCoin - RADIUS, width: RADIUS * 2, height: RADIUS * 2 };
                    const side = piles[k].key === "buff" ? Placement.LEFT : Placement.RIGHT;

                    Tooltip.show(effect.card, area, (language) => getTooltipContent(effect, pile, minion, language), 0, side);
                    return;
                }
            }
        }
    }
}

function newPileState(){

    return { current: 0, switchTime: 0, spread: 0, lastTime: undefined, appeared: new Map() };
}

function isTurning(minion){

    return minion.spawn !== undefined || (minion.swapScale !== undefined && minion.swapScale < 1);
}

function getPiles(minion, effects){

    const piles = [
        { key: "buff", color: BUFF_COLOR, corner: BUFF_CORNER, effects: effects.filter((effect) => effect.isBuff) },
        { key: "curse", color: CURSE_COLOR, corner: CURSE_CORNER, effects: effects.filter((effect) => !effect.isBuff) },
    ];

    for (let i = 0; i < piles.length; i++){

        piles[i].xPos = minion.xPos + piles[i].corner[0];
        piles[i].yPos = minion.yPos + piles[i].corner[1];
    }

    return piles.filter((pile) => pile.effects.length > 0);
}

// Que carta se ensena arriba, cuanto esta desplegado y que cartas acaban de aparecer; dice si tiene el raton encima
function updatePile(pile, state, mouse, now){

    const count = pile.effects.length;

    // Una carta nueva pasa a verse arriba con su salto, y tambien cuando se le apila otra copia
    for (let i = 0; i < count; i++){

        const effect = pile.effects[i];
        const entry = state.appeared.get(effect.card.id);

        if (entry === undefined || entry.copies < effect.turns.length){

            state.appeared.set(effect.card.id, { start: now, copies: effect.turns.length });
            state.current = i;
            state.switchTime = now;
        }
    }

    state.appeared.forEach((entry, id) => {

        if (!pile.effects.some((effect) => effect.card.id === id)){

            state.appeared.delete(id);
        }
    });

    state.current %= count;

    const deltaTime = state.lastTime === undefined ? 0 : now - state.lastTime;
    const target = isPileHovered(pile, state, mouse) ? 1 : 0;

    state.lastTime = now;
    state.spread = target === 1 ? Math.min(1, state.spread + deltaTime / SPREAD_TIME) : Math.max(0, state.spread - deltaTime / SPREAD_TIME);

    // Desplegado se ven todas; recogido, la de arriba se gira a la siguiente cada cierto tiempo
    if (state.spread > 0 || count === 1){

        state.switchTime = Math.max(state.switchTime, now - FLIP_TIME);
    }

    else if (now - state.switchTime >= CYCLE_TIME){

        state.current = (state.current + 1) % count;
        state.switchTime = now;
    }

    return target === 1;
}

// Recogido basta con la moneda de la esquina; desplegado, toda la columna para que no se cierre al recorrerla
function isPileHovered(pile, state, mouse){

    if (state.spread === 0){

        return Math.hypot(mouse.x - pile.xPos, mouse.y - pile.yPos) <= RADIUS + HOVER_MARGIN;
    }

    const positions = getCoinPositions(pile, 1);
    const top = positions[positions.length - 1][1];

    return Math.abs(mouse.x - pile.xPos) <= RADIUS + HOVER_MARGIN && mouse.y >= top - RADIUS - HOVER_MARGIN && mouse.y <= pile.yPos + RADIUS + HOVER_MARGIN;
}

// Desplegadas suben desde la esquina; si son muchas se juntan para no salirse de la casilla
function getCoinPositions(pile, spread){

    const count = pile.effects.length;
    const top = pile.yPos - pile.corner[1] + SPREAD_TOP;
    const step = count > 1 ? Math.min(SPREAD_STEP, (pile.yPos - top) / (count - 1)) : 0;
    const eased = 1 - Math.pow(1 - spread, 3);
    const positions = [];

    for (let i = 0; i < count; i++){

        positions.push([pile.xPos, pile.yPos - i * step * eased]);
    }

    return positions;
}

function getHoveredEffect(pile, state, mouse){

    if (state === undefined || !isPileHovered(pile, state, mouse)){

        return undefined;
    }

    if (state.spread === 0){

        return pile.effects[state.current];
    }

    const positions = getCoinPositions(pile, state.spread);

    // La moneda mas cercana al raton, mirando primero las de arriba, que se pintan encima
    for (let i = positions.length - 1; i >= 0; i--){

        if (Math.hypot(mouse.x - positions[i][0], mouse.y - positions[i][1]) <= RADIUS + 2){

            return pile.effects[i];
        }
    }

    return undefined;
}

function drawPile(ctx, pile, state, now){

    const count = pile.effects.length;
    const [red, green, blue] = pile.color;

    ctx.save();

    if (state.spread > 0){

        const positions = getCoinPositions(pile, state.spread);

        for (let i = 0; i < count; i++){

            drawMedallion(ctx, pile.effects[i], pile.color, positions[i][0], positions[i][1], getPop(state, pile.effects[i], now), 1);
        }
    }

    else{

        // Por detras se asoman tantas monedas como cartas mas tiene el monton, hacia dentro de la casilla
        const xDirection = pile.key === "buff" ? 1 : -1;
        const hidden = Math.min(count - 1, PILE_COINS);

        for (let i = hidden; i >= 1; i--){

            drawCoin(ctx, pile.xPos + xDirection * PILE_OFFSET * i, pile.yPos - PILE_OFFSET * i, RADIUS, red, green, blue);
        }

        const effect = pile.effects[state.current];

        drawMedallion(ctx, effect, pile.color, pile.xPos, pile.yPos, getPop(state, effect, now), getFlip(state, count, now));
    }

    ctx.restore();
}

function getPop(state, effect, now){

    const entry = state.appeared.get(effect.card.id);
    const pop = entry === undefined ? 1 : Math.min(1, (now - entry.start) / POP_TIME);

    return easeOutBack(pop);
}

// Ancho de la moneda de arriba al girarse: se estrecha antes de cambiar de carta y se vuelve a abrir con la nueva
function getFlip(state, count, now){

    const time = now - state.switchTime;
    const half = FLIP_TIME / 2;
    const opening = time < half ? Math.sin(time / half * Math.PI / 2) : 1;
    const closing = count > 1 && time > CYCLE_TIME - half ? Math.cos(Math.min(1, (time - CYCLE_TIME + half) / half) * Math.PI / 2) : 1;

    return Math.max(0, Math.min(opening, closing));
}

// Turnos hasta que se acaba el efecto (los de la copia que mas dura); sin numero si es permanente
function getTurnsLeft(effect){

    return effect.turns.includes(null) ? null : Math.max(...effect.turns);
}

function drawMedallion(ctx, effect, color, xPos, yPos, scale, xScale){

    const [red, green, blue] = color;
    const radius = RADIUS * scale;
    const copies = effect.turns.length;
    const turnsLeft = getTurnsLeft(effect);

    ctx.save();
    ctx.translate(xPos, yPos);
    ctx.scale(xScale, 1);

    drawCoin(ctx, 0, 0, radius, red, green, blue);

    // El arte de la carta recortado en circulo
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(effect.card.image[CardId.BIG_SIZE], -radius, -radius, radius * 2, radius * 2);
    ctx.restore();

    ctx.font = "bold " + Math.round(15 * scale) + "px LongaIberica-DEMO";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(18, 8, 3, 0.9)";

    // Turnos que le quedan, en la esquina de abajo
    if (turnsLeft !== null){

        ctx.strokeText(turnsLeft, radius * 0.8, radius * 0.8);
        ctx.fillStyle = "white";
        ctx.fillText(turnsLeft, radius * 0.8, radius * 0.8);
    }

    // Cuantas copias tiene, en la esquina de arriba y del color del efecto
    if (copies > 1){

        ctx.strokeText("x" + copies, -radius * 0.75, -radius * 0.8);
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillText("x" + copies, -radius * 0.75, -radius * 0.8);
    }

    ctx.restore();
}

// Fondo oscuro con un halo y un borde del color del efecto
function drawCoin(ctx, xPos, yPos, radius, red, green, blue){

    ctx.shadowColor = `rgba(${red}, ${green}, ${blue}, 0.8)`;
    ctx.shadowBlur = 8;
    ctx.fillStyle = "rgb(24, 12, 6)";
    ctx.beginPath();
    ctx.arc(xPos, yPos, radius + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = `rgb(${red}, ${green}, ${blue})`;
    ctx.beginPath();
    ctx.arc(xPos, yPos, radius + 1.5, 0, Math.PI * 2);
    ctx.stroke();
}

// El tooltip de la moneda: nombre de la carta y cual es del monton, lo que hace, sus cuentas y los turnos que le quedan
// a cada copia
function getTooltipContent(effect, pile, minion, language){

    const card = effect.card;
    const copies = effect.turns.length;
    const turns = effect.turns.filter((turn) => turn !== null).sort((first, second) => second - first);
    const ink = TypeInk[effect.isBuff ? TypeId.BUFF : TypeId.CURSE];
    const results = getEffectResults(effect, minion, language).map((result) => ({ text: result, ink: ink }));
    const content = {
        title:      card.texts.texts[1].text[language].trim() + (copies > 1 ? " x" + copies : ""),
        titleInk:   ink,
        corner:     pile !== undefined ? (pile.effects.indexOf(effect) + 1) + "/" + pile.effects.length : undefined,
        sections:   [[{ text: card.texts.texts[0].text[language].trim() }, ...results]],
    };

    if (turns.length > 0){

        content.sections.push([{ text: TooltipText.TURNS_LEFT[language] + turns.join(", "), ink: TooltipInk.MUTED }]);
    }

    return content;
}

// Las cuentas de la carta sobre el esbirro: las estadisticas con todas sus copias sumadas, y el critico y el fallo con la
// probabilidad que tiene ahora, contando todo lo que lleva encima
function getEffectResults(effect, minion, language){

    const results = [];
    const parts = effect.card.effect ?? [];
    const copies = effect.turns.length;

    for (let i = 0; i < parts.length; i++){

        const attribute = parts[i].common_effect_attribute;
        const value = parts[i].common_effect_value;

        if (STAT_NAMES[attribute] !== undefined){

            results.push(STAT_NAMES[attribute][language] + " " + formatChange(parts[i].modifier, value, copies, language));
        }

        else if (attribute === "Critic_modifier"){

            results.push(TooltipText.CRITICAL[language] + formatPercent(getChance(minion.criticModifier, (face, modifier) => face * modifier >= DICE_FACES), language));
        }

        else if (attribute === "Fail_modifier"){

            results.push(TooltipText.MISS[language] + formatPercent(getChance(minion.failModifier, (face, modifier) => face * modifier <= 1), language));
        }

        else if (attribute === "Card_state" && value === CardActions.STUNNED){

            results.push(TooltipText.STUNNED[language]);
        }
    }

    return results;
}

// Lo que suman todas las copias: se suman las restas y las sumas, y se encadenan las multiplicaciones y divisiones
function formatChange(modifier, value, copies, language){

    switch (modifier){

        case "+":
            return "+" + formatNumber(value * copies, language);
        case "-":
            return "-" + formatNumber(value * copies, language);
        case "*":
            return "x" + formatNumber(Math.pow(value, copies), language);
        case "/":
            return "/" + formatNumber(Math.pow(value, copies), language);
        default:
            return "= " + formatNumber(value, language);
    }
}

function formatNumber(value, language){

    const text = String(Math.round(value * 100) / 100);

    return language === LanguageId.EUS ? text.replace(".", ",") : text;
}

function formatPercent(value, language){

    return language === LanguageId.EUS ? "% " + value : value + "%";
}

// Probabilidad de que salga, tirando todas las caras del dado de 20 con el modificador del esbirro
function getChance(modifier, isHit){

    let hits = 0;

    for (let face = 1; face <= DICE_FACES; face++){

        if (isHit(face, modifier)){

            hits++;
        }
    }

    return hits * 100 / DICE_FACES;
}

function easeOutBack(progress){

    const overshoot = 1.70158;

    return 1 + (overshoot + 1) * Math.pow(progress - 1, 3) + overshoot * Math.pow(progress - 1, 2);
}
