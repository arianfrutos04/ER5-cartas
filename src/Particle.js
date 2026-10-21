import { ParticleId } from "./constants.js";

// Particula con fisica por tiempo: se mueve, se frena, cae y se desvanece a lo largo de su vida
export default class Particle{

    constructor(id, xPos, yPos, xSpeed, ySpeed, life, size, color, options = {}){

        this.id         = id;
        this.xPos       = xPos;
        this.yPos       = yPos;
        this.xSpeed     = xSpeed;
        this.ySpeed     = ySpeed;
        this.life       = life;
        this.age        = 0;
        this.size       = size;
        this.color      = color;                            // [r, g, b]
        this.growth     = options.growth   ?? 0;            // px por segundo que crece el tamano
        this.gravity    = options.gravity  ?? 0;            // px por segundo al cuadrado hacia abajo
        this.drag       = options.drag     ?? 0;            // fraccion de velocidad que pierde por segundo
        this.alpha      = options.alpha    ?? 1;
        this.angle      = options.angle    ?? 0;            // para el tajo: angulo de inicio del arco
        this.sweep      = options.sweep    ?? 0;            // para el tajo: angulo que recorre el arco
    }

    update(deltaTime){

        this.age += deltaTime;

        const friction = Math.max(0, 1 - this.drag * deltaTime);
        this.xSpeed *= friction;
        this.ySpeed  = this.ySpeed * friction + this.gravity * deltaTime;

        this.xPos += this.xSpeed * deltaTime;
        this.yPos += this.ySpeed * deltaTime;
        this.size  = Math.max(0, this.size + this.growth * deltaTime);
    }

    isDead(){

        return this.age >= this.life;
    }

    render(ctx){

        const progress = Math.min(1, this.age / this.life);
        const [red, green, blue] = this.color;

        ctx.save();

        switch (this.id){

            case ParticleId.DUST:
            case ParticleId.SMOKE: {

                // Aparece rapido y se va apagando mientras crece
                const alpha = this.alpha * Math.min(1, progress * 6) * Math.pow(1 - progress, 1.4);
                const gradient = ctx.createRadialGradient(this.xPos, this.yPos, 0, this.xPos, this.yPos, this.size);
                gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${alpha})`);
                gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.xPos, this.yPos, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            }

            case ParticleId.SPARK: {

                // Raya en la direccion del movimiento, blanca en la punta y del color de la chispa en la cola
                const alpha = this.alpha * (1 - progress);
                const tailX = this.xPos - this.xSpeed * 0.05;
                const tailY = this.yPos - this.ySpeed * 0.05;
                const gradient = ctx.createLinearGradient(this.xPos, this.yPos, tailX, tailY);
                gradient.addColorStop(0, `rgba(255, 248, 220, ${alpha})`);
                gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
                ctx.globalCompositeOperation = "lighter";
                ctx.strokeStyle = gradient;
                ctx.lineWidth = this.size;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(this.xPos, this.yPos);
                ctx.lineTo(tailX, tailY);
                ctx.stroke();
                break;
            }

            case ParticleId.MOTE: {

                // Punto de luz que parpadea
                const alpha = this.alpha * Math.min(1, progress * 5) * (1 - progress) * (0.7 + 0.3 * Math.sin(this.age * 25));
                const gradient = ctx.createRadialGradient(this.xPos, this.yPos, 0, this.xPos, this.yPos, this.size);
                gradient.addColorStop(0, `rgba(255, 252, 235, ${alpha})`);
                gradient.addColorStop(0.35, `rgba(${red}, ${green}, ${blue}, ${alpha * 0.8})`);
                gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
                ctx.globalCompositeOperation = "lighter";
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.xPos, this.yPos, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            }

            case ParticleId.RING: {

                const alpha = this.alpha * Math.pow(1 - progress, 2);
                ctx.globalCompositeOperation = "lighter";
                ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                ctx.lineWidth = 6 * (1 - progress) + 1;
                ctx.beginPath();
                ctx.arc(this.xPos, this.yPos, this.size, 0, Math.PI * 2);
                ctx.stroke();
                break;
            }

            case ParticleId.FLASH: {

                const alpha = this.alpha * (1 - progress);
                const gradient = ctx.createRadialGradient(this.xPos, this.yPos, 0, this.xPos, this.yPos, this.size);
                gradient.addColorStop(0, `rgba(255, 255, 240, ${alpha})`);
                gradient.addColorStop(0.4, `rgba(${red}, ${green}, ${blue}, ${alpha * 0.6})`);
                gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
                ctx.globalCompositeOperation = "lighter";
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.xPos, this.yPos, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            }

            case ParticleId.SLASH: {

                // Arco que se dibuja en el primer tercio de su vida y despues se estrecha y se apaga
                const drawn = Math.min(1, progress * 3);
                const alpha = this.alpha * (1 - Math.max(0, progress - 0.3) / 0.7);
                const end = this.angle + this.sweep * drawn;
                const start = Math.max(this.angle, end - this.sweep * 0.75);
                ctx.globalCompositeOperation = "lighter";
                ctx.lineCap = "round";
                ctx.shadowColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                ctx.shadowBlur = 18;
                ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * 0.9})`;
                ctx.lineWidth = 16 * (1 - progress * 0.7);
                ctx.beginPath();
                ctx.arc(this.xPos, this.yPos, this.size, start, end);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = `rgba(255, 250, 230, ${alpha})`;
                ctx.lineWidth = 5 * (1 - progress * 0.7);
                ctx.stroke();
                break;
            }

            default:
                break;
        }

        ctx.restore();
    }
}
