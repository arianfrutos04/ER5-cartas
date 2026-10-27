// Los numeros de las cartas (estadisticas de los esbirros y contadores de los eventos) se animan solos al cambiar:
// el numero viejo sale hacia arriba y el nuevo entra desde abajo, como un contador, se ilumina del color del cambio
// con un halo y un pequeno salto, y junto a el aparece la diferencia

export const NumberMode = {
    STAT:       0,      // Sube en verde y baja en rojo
    COUNTER:    1,      // Cuenta atras: avanza en dorado
};

// Donde sale la diferencia respecto al numero, para no tapar los numeros de al lado
export const DeltaPosition = {
    ABOVE:      0,
    BELOW:      1,
};

const ROLL_TIME         = 0.3;
const POP_TIME          = 0.4;
const HIGHLIGHT_TIME    = 1.2;
const DELTA_FADE_START  = 0.75;

const UP_COLOR          = [120, 235, 120];
const DOWN_COLOR        = [255, 85, 60];
const COUNTER_COLOR     = [255, 205, 95];

// Olvida los valores anteriores para que el siguiente cambio no se anime, como al restablecer las estadisticas al cambiar de turno
export function resetCardNumbers(card){

    card.numberAnimations = undefined;
}

export function drawCardNumber(ctx, card, key, value, xPos, yPos, mode = NumberMode.STAT, deltaPosition = DeltaPosition.ABOVE){

    const now = performance.now() / 1000;
    const numbers = card.numberAnimations ?? (card.numberAnimations = {});
    let entry = numbers[key];

    if (entry === undefined){

        entry = numbers[key] = { value: value, previous: value, start: -Infinity };
    }

    else if (entry.value !== value){

        entry.previous = entry.value;
        entry.value = value;
        entry.start = now;
    }

    const time = now - entry.start;
    const change = Number(value) - Number(entry.previous);

    if (time >= HIGHLIGHT_TIME || !Number.isFinite(change) || change === 0){

        ctx.fillText(value, xPos, yPos);
        ctx.strokeText(value, xPos, yPos);
        return;
    }

    const fontSize = Number((ctx.font.match(/(\d+)px/) || [0, 24])[1]);
    const [red, green, blue] = mode === NumberMode.COUNTER ? COUNTER_COLOR : change > 0 ? UP_COLOR : DOWN_COLOR;
    const baseColor = ctx.fillStyle;
    const roll = 1 - Math.pow(1 - Math.min(1, time / ROLL_TIME), 3);
    const travel = fontSize * 0.85;
    const highlight = time < ROLL_TIME ? 1 : 1 - (time - ROLL_TIME) / (HIGHLIGHT_TIME - ROLL_TIME);
    const pop = 1 + 0.35 * Math.sin(Math.PI * Math.min(1, Math.max(0, (time - ROLL_TIME * 0.5) / POP_TIME)));

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Halo del color del cambio detras del numero
    const glow = ctx.createRadialGradient(xPos, yPos, 0, xPos, yPos, fontSize * 0.8);
    glow.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${0.6 * highlight})`);
    glow.addColorStop(0.6, `rgba(${red}, ${green}, ${blue}, ${0.25 * highlight})`);
    glow.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(xPos - fontSize, yPos - fontSize, fontSize * 2, fontSize * 2);

    // El contador: solo se ve lo que cabe en el hueco del numero
    ctx.save();
    ctx.beginPath();
    ctx.rect(xPos - fontSize * 1.2, yPos - fontSize * 0.62, fontSize * 2.4, fontSize * 1.24);
    ctx.clip();

    if (roll < 1){

        ctx.globalAlpha = 1 - roll;
        ctx.fillStyle = baseColor;
        ctx.fillText(entry.previous, xPos, yPos - travel * roll);
        ctx.strokeText(entry.previous, xPos, yPos - travel * roll);
    }

    const newYPos = yPos + travel * (1 - roll);

    ctx.translate(xPos, newYPos);
    ctx.scale(pop, pop);
    ctx.globalAlpha = roll;
    ctx.fillStyle = baseColor;
    ctx.fillText(value, 0, 0);
    ctx.globalAlpha = roll * highlight;
    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    ctx.fillText(value, 0, 0);
    ctx.globalAlpha = roll;
    ctx.strokeText(value, 0, 0);
    ctx.restore();

    // La diferencia, del mismo tamano que el numero y con un contorno oscuro, se aleja un poco del numero y se apaga
    const deltaAlpha = time < ROLL_TIME ? roll : Math.max(0, 1 - (time - DELTA_FADE_START) / (HIGHLIGHT_TIME - DELTA_FADE_START));
    const deltaText = (change > 0 ? "+" : "-") + Math.abs(change);
    const drift = time * 6;
    const deltaY = deltaPosition === DeltaPosition.BELOW ? yPos + fontSize * 1.1 + drift : yPos - fontSize * 1.1 - drift;

    ctx.globalAlpha = deltaAlpha;
    ctx.font = "bold " + fontSize + "px LongaIberica-DEMO";

    // Lo que se centra es la cifra; el signo sobresale a la izquierda
    const signOffset = ctx.measureText(deltaText.charAt(0)).width / 2;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(18, 8, 3, 0.9)";
    ctx.strokeText(deltaText, xPos - signOffset, deltaY);
    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    ctx.fillText(deltaText, xPos - signOffset, deltaY);

    ctx.restore();
}
