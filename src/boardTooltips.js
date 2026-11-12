import { BoardTooltipText, ButtonState, ButttonsId, CardId, DecksId, TooltipText, TypeId, TypeNames, renderState } from "./constants.js";
import HeroEvents from "./Events/temp_events/HeroEvents.js";
import Tooltip, { getCardArea } from "./Tooltip.js";
import { TooltipInk, TypeInk } from "./tooltipStyle.js";

// Tooltips de lo que no es una carta del tablero: los botones, los heroes, Joseph en su hueco, las gemas de vida, los
// mazos, las acciones que quedan y el reloj del turno

// Lo que explica cada boton; los de las cuatro acciones dicen ademas que gastan una
const BUTTONS = {
    [ButttonsId.BTN_MOVE]:              { text: BoardTooltipText.MOVE, isAction: true },
    [ButttonsId.BTN_PREPARE_EVENT]:     { text: BoardTooltipText.PREPARE, isAction: true },
    [ButttonsId.BTN_USE_EVENT]:         { text: BoardTooltipText.USE, isAction: true },
    [ButttonsId.BTN_ATTACK]:            { text: BoardTooltipText.ATTACK, isAction: true },
    [ButttonsId.BTN_END_TURN]:          { text: BoardTooltipText.END_TURN },
    [ButttonsId.BTN_PARRY]:             { text: BoardTooltipText.PARRY },
    [ButttonsId.BTN_NO_PARRY]:          { text: BoardTooltipText.NO_PARRY },
    [ButttonsId.BTN_CHANGE_LANGUAGE]:   { text: BoardTooltipText.LANGUAGE },
    [ButttonsId.BTN_QUICK_HELP]:        { text: BoardTooltipText.QUICK_HELP },
    [ButttonsId.BTN_RETURN_TO_MENU]:    { text: BoardTooltipText.MENU },
};

// Zonas del tablero, por lo que se ve de cada cosa; arriba esta el rival del jugador del turno y abajo el del turno
const Area = {
    RIVAL_GEM:          { xPos: 265, yPos: 40, width: 105, height: 110 },
    OWN_GEM:            { xPos: 265, yPos: 920, width: 105, height: 110 },
    RIVAL_MINION_DECK:  { xPos: 69, yPos: 26, width: 182, height: 181 },     // Con su marco dorado
    OWN_MINION_DECK:    { xPos: 69, yPos: 866, width: 182, height: 181 },
    EVENT_DECK:         { xPos: 44, yPos: 450, width: 212, height: 180 },
    ACTIONS:            { xPos: 1600, yPos: 22, width: 85, height: 180 },
    TIMER:              { xPos: 1495, yPos: 510, width: 110, height: 55 },
};

export function requestBoardTooltips(game){

    const mouse = game.mouse;
    const turns = game.turnContainer.turnContainer;
    const turn = turns[game.currentTurn];
    const rival = turns[(game.currentTurn + 1) % 2];
    const decks = game.deckContainer.decks;

    requestButtonTooltip(game.turnContainer.buttonContainer);

    for (const player of [turn, rival]){

        const hero = player.mainCharacter;

        if (hero.state === CardId.HOVER){

            Tooltip.show(hero, getCardArea(hero), (language) => getHeroContent(hero, game.eventContainer, language));
        }
    }

    const joseph = decks[DecksId.JOSEPH_DECK].cards[0];

    if (joseph !== undefined && joseph.state === CardId.HOVER && joseph.toolTip !== undefined){

        Tooltip.show(joseph, getCardArea(joseph), (language) => joseph.toolTip.getContent(joseph, language));
    }

    const zones = [
        [Area.RIVAL_GEM, (language) => getHealthContent(rival, language)],
        [Area.OWN_GEM, (language) => getHealthContent(turn, language)],
        [Area.RIVAL_MINION_DECK, (language) => getMinionDeckContent(rival, language)],
        [Area.OWN_MINION_DECK, (language) => getMinionDeckContent(turn, language)],
        [Area.EVENT_DECK, (language) => getCountContent(BoardTooltipText.EVENT_DECK, decks[DecksId.EVENT_DECK].cards.length, language)],
        [Area.ACTIONS, (language) => getCountContent(BoardTooltipText.ACTIONS, undefined, language)],
        [Area.TIMER, (language) => getCountContent(BoardTooltipText.TIMER, undefined, language)],
    ];

    for (const [area, getContent] of zones){

        if (isInside(mouse, area)){

            Tooltip.show(area, area, getContent);
        }
    }
}

function requestButtonTooltip(buttonContainer){

    // En el menu y en la ayuda rapida no se explica nada
    if (buttonContainer.state !== renderState.GAME && buttonContainer.state !== renderState.PARRY){

        return;
    }

    for (const button of buttonContainer.container){

        const explanation = BUTTONS[button.id];
        const isVisible = button.renderState === buttonContainer.state || button.renderState === undefined;

        if (explanation !== undefined && isVisible && button.state === ButtonState.HOVER){

            Tooltip.show(button, button.getArea(), (language) => getButtonContent(explanation, language));
        }
    }
}

function getButtonContent(explanation, language){

    const content = { title: explanation.text.TITLE[language] };

    if (explanation.text.TEXT !== undefined){

        content.sections = [[{ text: explanation.text.TEXT[language] }]];

        if (explanation.isAction){

            content.sections.push([{ text: BoardTooltipText.ACTION_COST[language], ink: TooltipInk.MUTED }]);
        }
    }

    return content;
}

// La habilidad del heroe y si esta activa
function getHeroContent(hero, eventContainer, language){

    const event = eventContainer.events.find((other) => other instanceof HeroEvents && other.hero === hero);
    const isActive = event !== undefined && event.card.durability > 0;
    const status = isActive ? { text: TooltipText.HERO_ACTIVE[language] + Math.ceil(event.card.durability), ink: TooltipInk.READY } : { text: TooltipText.HERO_HINT[language], ink: TooltipInk.MUTED };

    return {
        title:          hero.texts.texts[1].text[language].trim(),
        subtitle:       TypeNames[TypeId.HERO][language],
        subtitleInk:    TypeInk[TypeId.HERO],
        sections:       [[{ text: hero.texts.texts[0].text[language].trim() }], [status]],
    };
}

// La vida que le queda a un jugador: la de todos sus esbirros, en el tablero y en la reserva
function getHealthContent(player, language){

    const minions = [...player.activeMinionDeck.cards, ...player.minionDeck.cards];
    const health = minions.reduce((total, minion) => total + minion.health, 0);

    return {
        title:      BoardTooltipText.HEALTH.TITLE[language] + ": " + health,
        subtitle:   player.name,
        sections:   [[{ text: BoardTooltipText.HEALTH.TEXT[language] }], [{ text: BoardTooltipText.HEALTH.COUNT[language] + player.minionDeck.cards.length, ink: TooltipInk.MUTED }]],
    };
}

function getMinionDeckContent(player, language){

    return {
        title:      BoardTooltipText.MINION_DECK.TITLE[language],
        subtitle:   player.name,
        sections:   [[{ text: BoardTooltipText.MINION_DECK.TEXT[language] }], [{ text: BoardTooltipText.MINION_DECK.COUNT[language] + player.minionDeck.cards.length, ink: TooltipInk.MUTED }]],
    };
}

function getCountContent(text, count, language){

    const content = { title: text.TITLE[language], sections: [[{ text: text.TEXT[language] }]] };

    if (count !== undefined){

        content.sections.push([{ text: text.COUNT[language] + count, ink: TooltipInk.MUTED }]);
    }

    return content;
}

function isInside(mouse, area){

    return mouse.x >= area.xPos && mouse.x <= area.xPos + area.width && mouse.y >= area.yPos && mouse.y <= area.yPos + area.height;
}
