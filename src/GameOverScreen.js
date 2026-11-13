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

// Los rombos de arriba y abajo de cada aro vienen en el panel y sus puntas entran en el hueco del retrato. Para que la
// foto no las tape se sacan del panel los pixeles de las puntas que no son el relleno del hueco y se pintan encima
const RING_FILL         = [106, 97, 74];        // Color del relleno del hueco de los aros en el panel
const FILL_TOLERANCE    = 18;
const TIP_HALF_WIDTH    = 11;
const TIP_DEPTH         = 26;                   // Hasta donde entran en el hueco, desde el borde del aro
const RING_OUTLINE      = "rgba(62, 36, 14, 0.92)";
const RING_OUTLINE_WIDTH = 2.25;

let tipsPatch = undefined;

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

        const tips = GameOverScreen.getTipsPatch(panel);

        if (tips !== undefined){

            ctx.drawImage(tips, 0, 0);
        }

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

        // El contorno oscuro interior del aro, que en el panel recorre todo el borde y la foto tapaba
        ctx.save();
        ctx.beginPath();
        ctx.arc(xPos, Layout.PORTRAIT_Y, radius - RING_OUTLINE_WIDTH / 2, 0, Math.PI * 2);
        ctx.lineWidth = RING_OUTLINE_WIDTH;
        ctx.strokeStyle = RING_OUTLINE;
        ctx.stroke();
        ctx.restore();

        GameOverScreen.renderEngraved(ctx, label, xPos, Layout.LABEL_Y, "700 22px '" + TITLE_FONT + "'", isWinner ? WINNER_INK : LOSER_INK, "4px");
        GameOverScreen.renderEngraved(ctx, name, xPos, Layout.NAME_Y, "700 34px '" + TITLE_FONT + "'", isWinner ? TITLE_INK : INK, "1px");
    }

    // Las puntas de los rombos que caen dentro de los huecos de los retratos, sacadas del panel una sola vez
    static getTipsPatch(panel){

        if (tipsPatch !== undefined && tipsPatch.panel === panel){

            return tipsPatch.canvas;
        }

        if (!panel.complete || panel.naturalWidth === 0){

            return undefined;
        }

        const source = document.createElement("canvas");
        source.width = panel.naturalWidth;
        source.height = panel.naturalHeight;
        const sourceContext = source.getContext("2d");
        sourceContext.drawImage(panel, 0, 0);

        const canvas = document.createElement("canvas");
        canvas.width = source.width;
        canvas.height = source.height;
        const context = canvas.getContext("2d");
        const radius = Layout.PORTRAIT_RADIUS;
        const width = TIP_HALF_WIDTH * 2 + 1;

        for (const xCenter of Layout.PORTRAIT_X){

            for (const yStart of [Layout.PORTRAIT_Y - radius, Layout.PORTRAIT_Y + radius - TIP_DEPTH]){

                const xStart = xCenter - TIP_HALF_WIDTH;
                const image = sourceContext.getImageData(xStart, yStart, width, TIP_DEPTH);
                const data = image.data;

                for (let y = 0; y < TIP_DEPTH; y++){

                    for (let x = 0; x < width; x++){

                        const i = (y * width + x) * 4;
                        const isInside = Math.hypot(xStart + x + 0.5 - xCenter, yStart + y + 0.5 - Layout.PORTRAIT_Y) < radius;
                        const isFill = Math.max(Math.abs(data[i] - RING_FILL[0]), Math.abs(data[i + 1] - RING_FILL[1]), Math.abs(data[i + 2] - RING_FILL[2])) <= FILL_TOLERANCE;

                        if (!isInside || isFill){

                            data[i + 3] = 0;
                        }
                    }
                }

                context.putImageData(image, xStart, yStart);
            }
        }

        tipsPatch = { panel: panel, canvas: canvas };

        return canvas;
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
