import { QuickHelpText } from "./constants.js";

const TITLE_FONT    = "Cinzel";
const BODY_FONT     = "EB Garamond";
const INK           = "#3b2414";
const TITLE_INK     = "#6b1a0c";
const ENGRAVE       = "rgba(255, 244, 214, 0.75)";
const BULLET_FILL   = "#c08a2c";
const BULLET_EDGE   = "#5e3a0e";

// Las posiciones encajan con los marcos, adornos y ejemplos de las imagenes tuto_1..tuto_5
const Layout = {
    BASICS_X:           560,
    PHASES_X:           1320,
    COLUMN_TITLE_Y:     162,
    COLUMN_TEXT_Y:      258,
    BASICS_TEXT_X:      282,
    BASICS_TEXT_WIDTH:  590,
    PHASES_TEXT_X:      1000,
    PHASES_TEXT_WIDTH:  680,
    ACTIONS_COLUMN_GAP: 330,
    PAGE_X:             960,
    PAGE_TITLE_Y:       620,
    PAGE_TEXT_Y:        716,
    PAGE_TEXT_WIDTH:    1180,
    LEGEND_X:           1446,
    LEGEND_Y:           [203, 331, 459],
    LEGEND_WIDTH:       290,
};

// Imagen de cada pagina en ingles y en euskera: solo las paginas con texto del juego en los ejemplos tienen las dos
const PAGE_IMAGES       = [[0, 0], [1, 1], [2, 2], [3, 5], [4, 6]];

const BODY_SIZE         = 29;
const LINE_HEIGHT       = 38;
const PARAGRAPH_GAP     = 18;

export default class QuickHelp {

    static getImage(images, page, language){

        return images[PAGE_IMAGES[page][language]];
    }

    static render(ctx, page, language){

        ctx.save();
        ctx.textBaseline = "alphabetic";

        if (page === 0){

            QuickHelp.renderBasicsPage(ctx, language);
        }

        else{

            const text = QuickHelpText.PAGES[page - 1];

            QuickHelp.renderTitle(ctx, text.TITLE[language], Layout.PAGE_X, Layout.PAGE_TITLE_Y, 50);
            QuickHelp.renderParagraphs(ctx, text.TEXT, language, Layout.PAGE_X, Layout.PAGE_TEXT_Y, Layout.PAGE_TEXT_WIDTH, "center");

            if (text.LEGEND !== undefined){

                QuickHelp.renderLegend(ctx, text.LEGEND, language);
            }
        }

        ctx.restore();
    }

    static renderBasicsPage(ctx, language){

        QuickHelp.renderTitle(ctx, QuickHelpText.BASICS_TITLE[language], Layout.BASICS_X, Layout.COLUMN_TITLE_Y, 44);
        QuickHelp.renderTitle(ctx, QuickHelpText.PHASES_TITLE[language], Layout.PHASES_X, Layout.COLUMN_TITLE_Y, 44);

        let yPos = Layout.COLUMN_TEXT_Y;

        for (let i = 0; i < QuickHelpText.BASICS.length; i++){

            QuickHelp.renderBullet(ctx, Layout.BASICS_TEXT_X - 22, yPos - 9);
            yPos = QuickHelp.renderParagraphs(ctx, [QuickHelpText.BASICS[i]], language, Layout.BASICS_TEXT_X, yPos, Layout.BASICS_TEXT_WIDTH, "left") + 14;
        }

        yPos = Layout.COLUMN_TEXT_Y - 4;

        for (let i = 0; i < QuickHelpText.PHASES.length; i++){

            const phase = QuickHelpText.PHASES[i];

            QuickHelp.renderSubtitle(ctx, phase.TITLE[language], Layout.PHASES_TEXT_X, yPos);
            yPos = QuickHelp.renderParagraphs(ctx, phase.TEXT, language, Layout.PHASES_TEXT_X, yPos + 44, Layout.PHASES_TEXT_WIDTH, "left");

            if (phase.ACTIONS !== undefined){

                yPos = QuickHelp.renderActions(ctx, phase.ACTIONS, language, yPos);
            }

            yPos += 30;
        }
    }

    // Las cuatro acciones en dos columnas, como los botones del tablero
    static renderActions(ctx, actions, language, yPos){

        ctx.font = BODY_SIZE + "px '" + BODY_FONT + "'";
        ctx.fillStyle = INK;
        ctx.textAlign = "left";

        for (let i = 0; i < actions.length; i++){

            const xPos = Layout.PHASES_TEXT_X + 26 + (i % 2) * Layout.ACTIONS_COLUMN_GAP;
            const lineY = yPos + Math.floor(i / 2) * LINE_HEIGHT;

            QuickHelp.renderBullet(ctx, xPos - 18, lineY - 9);
            ctx.fillText(actions[i][language], xPos, lineY);
        }

        return yPos + Math.ceil(actions.length / 2) * LINE_HEIGHT;
    }

    static renderLegend(ctx, legend, language){

        ctx.font = (BODY_SIZE - 2) + "px '" + BODY_FONT + "'";
        ctx.fillStyle = INK;
        ctx.textAlign = "left";

        for (let i = 0; i < legend.length; i++){

            const lines = QuickHelp.splitInLines(ctx, legend[i][language], Layout.LEGEND_WIDTH);
            const firstLineY = Layout.LEGEND_Y[i] - (lines.length - 1) * LINE_HEIGHT / 2 + 9;

            for (let j = 0; j < lines.length; j++){

                ctx.fillText(lines[j], Layout.LEGEND_X, firstLineY + j * LINE_HEIGHT);
            }
        }
    }

    static renderTitle(ctx, text, xPos, yPos, size){

        ctx.font = "700 " + size + "px '" + TITLE_FONT + "'";
        ctx.letterSpacing = "3px";
        ctx.textAlign = "center";

        ctx.fillStyle = ENGRAVE;
        ctx.fillText(text, xPos, yPos + 1.5);
        ctx.fillStyle = TITLE_INK;
        ctx.fillText(text, xPos, yPos);

        ctx.letterSpacing = "0px";
    }

    static renderSubtitle(ctx, text, xPos, yPos){

        ctx.font = "700 29px '" + TITLE_FONT + "'";
        ctx.letterSpacing = "2px";
        ctx.textAlign = "left";

        ctx.fillStyle = ENGRAVE;
        ctx.fillText(text, xPos, yPos + 1.5);
        ctx.fillStyle = TITLE_INK;
        ctx.fillText(text, xPos, yPos);

        ctx.letterSpacing = "0px";
    }

    // Devuelve la altura en la que acaba el texto, para encadenar bloques
    static renderParagraphs(ctx, paragraphs, language, xPos, yPos, maxWidth, align){

        ctx.font = BODY_SIZE + "px '" + BODY_FONT + "'";
        ctx.fillStyle = INK;
        ctx.textAlign = align;

        for (let i = 0; i < paragraphs.length; i++){

            const lines = align === "center" ? QuickHelp.splitInBalancedLines(ctx, paragraphs[i][language], maxWidth) : QuickHelp.splitInLines(ctx, paragraphs[i][language], maxWidth);

            for (let j = 0; j < lines.length; j++){

                ctx.fillText(lines[j], xPos, yPos);
                yPos += LINE_HEIGHT;
            }

            yPos += PARAGRAPH_GAP;
        }

        return yPos - PARAGRAPH_GAP;
    }

    static renderBullet(ctx, xPos, yPos){

        ctx.beginPath();
        ctx.moveTo(xPos, yPos - 7);
        ctx.lineTo(xPos + 5, yPos);
        ctx.lineTo(xPos, yPos + 7);
        ctx.lineTo(xPos - 5, yPos);
        ctx.closePath();

        ctx.fillStyle = BULLET_FILL;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = BULLET_EDGE;
        ctx.stroke();
        ctx.fillStyle = INK;
    }

    // Las mismas lineas que con el ancho maximo, pero con el ancho mas estrecho posible para que no quede una palabra sola
    static splitInBalancedLines(ctx, text, maxWidth){

        let lines = QuickHelp.splitInLines(ctx, text, maxWidth);
        let width = maxWidth;

        while (lines.length > 1 && width > 100){

            const narrowerLines = QuickHelp.splitInLines(ctx, text, width - 10);

            if (narrowerLines.length > lines.length){

                break;
            }

            lines = narrowerLines;
            width -= 10;
        }

        return lines;
    }

    // Reparte las palabras en lineas que no superan el ancho maximo con la fuente actual
    static splitInLines(ctx, text, maxWidth){

        const words = text.split(" ").filter((word) => word !== "");
        const lines = [];
        let line = "";

        for (let i = 0; i < words.length; i++){

            const testLine = line === "" ? words[i] : line + " " + words[i];

            if (line !== "" && ctx.measureText(testLine).width > maxWidth){

                lines.push(line);
                line = words[i];
            }

            else{

                line = testLine;
            }
        }

        if (line !== ""){

            lines.push(line);
        }

        return lines;
    }
}
