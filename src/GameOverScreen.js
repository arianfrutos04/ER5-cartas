import { CardId, GameOverText } from "./constants.js";

const TITLE_FONT    = "Cinzel";
const BODY_FONT     = "EB Garamond";
const INK           = "#3b2414";
const TITLE_INK     = "#6b1a0c";
const WINNER_INK    = "#8a5a12";
const LOSER_INK     = "#6e5b49";
const ENGRAVE       = "rgba(255, 244, 214, 0.75)";

// Las posiciones encajan con el panel, los aros de los retratos y las lineas de la tabla de game_over_panel
const Layout = {
    TITLE_X:            960,
    TITLE_Y:            316,
    PORTRAIT_X:         [700, 1220],
    PORTRAIT_Y:         486,
    PORTRAIT_RADIUS:    104,
    LABEL_Y:            642,
    NAME_Y:             686,
    STATS_LABEL_X:      960,
    STATS_Y:            746,
    STATS_ROW_HEIGHT:   50,
    FOOTER_Y:           962,
};

const STATS = [
    { TEXT: GameOverText.MELEE_HITS,       VALUE: "meleeHits" },
    { TEXT: GameOverText.RANGED_HITS,      VALUE: "rangedHits" },
    { TEXT: GameOverText.DAMAGE_DONE,      VALUE: "damageDone" },
    { TEXT: GameOverText.DAMAGE_RECEIVED,  VALUE: "damageReceived" },
];

export default class GameOverScreen {

    static render(ctx, panel, game, language){

        ctx.drawImage(panel, 0, 0);

        ctx.save();
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "center";

        GameOverScreen.renderEngraved(ctx, GameOverText.TITLE[language], Layout.TITLE_X, Layout.TITLE_Y, "700 56px '" + TITLE_FONT + "'", TITLE_INK, "4px");

        GameOverScreen.renderPlayer(ctx, game.winnerCharacter, game.winner, GameOverText.WINNER[language], Layout.PORTRAIT_X[0], true);
        GameOverScreen.renderPlayer(ctx, game.loserCharacter, game.loser, GameOverText.LOSER[language], Layout.PORTRAIT_X[1], false);

        GameOverScreen.renderStats(ctx, game.winnerStats, game.loserStats, language);

        // El aviso para continuar late suavemente
        ctx.globalAlpha = 0.8 + 0.2 * Math.sin(performance.now() / 400);
        ctx.font = "28px '" + BODY_FONT + "'";
        ctx.fillStyle = INK;
        ctx.fillText(GameOverText.RETURN_TO_LOBBY[language], Layout.TITLE_X, Layout.FOOTER_Y);

        ctx.restore();
    }

    // El perdedor sale en gris para que se distinga de un vistazo
    static renderPlayer(ctx, character, name, label, xPos, isWinner){

        const radius = Layout.PORTRAIT_RADIUS;

        ctx.save();
        ctx.beginPath();
        ctx.arc(xPos, Layout.PORTRAIT_Y, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.filter = isWinner ? "none" : "grayscale(1) brightness(0.85)";
        ctx.drawImage(character.image[CardId.BIG_SIZE], xPos - radius, Layout.PORTRAIT_Y - radius, radius * 2, radius * 2);
        ctx.restore();

        GameOverScreen.renderEngraved(ctx, label, xPos, Layout.LABEL_Y, "700 22px '" + TITLE_FONT + "'", isWinner ? WINNER_INK : LOSER_INK, "4px");
        GameOverScreen.renderEngraved(ctx, name, xPos, Layout.NAME_Y, "700 34px '" + TITLE_FONT + "'", isWinner ? TITLE_INK : INK, "1px");
    }

    // Tabla comparada: el valor del ganador a la izquierda y el del perdedor a la derecha
    static renderStats(ctx, winnerStats, loserStats, language){

        for (let i = 0; i < STATS.length; i++){

            const yPos = Layout.STATS_Y + i * Layout.STATS_ROW_HEIGHT;

            ctx.font = "29px '" + BODY_FONT + "'";
            ctx.fillStyle = INK;
            ctx.fillText(STATS[i].TEXT[language], Layout.STATS_LABEL_X, yPos);

            GameOverScreen.renderEngraved(ctx, winnerStats[STATS[i].VALUE], Layout.PORTRAIT_X[0], yPos, "700 32px '" + TITLE_FONT + "'", TITLE_INK, "0px");
            GameOverScreen.renderEngraved(ctx, loserStats[STATS[i].VALUE], Layout.PORTRAIT_X[1], yPos, "700 32px '" + TITLE_FONT + "'", INK, "0px");
        }
    }

    static renderEngraved(ctx, text, xPos, yPos, font, color, letterSpacing){

        ctx.font = font;
        ctx.letterSpacing = letterSpacing;

        ctx.fillStyle = ENGRAVE;
        ctx.fillText(text, xPos, yPos + 1.5);
        ctx.fillStyle = color;
        ctx.fillText(text, xPos, yPos);

        ctx.letterSpacing = "0px";
    }
}
