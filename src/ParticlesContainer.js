import Particle from "./Particle.js";
import { AttackImpact, ParticleId, TypeId } from "./constants.js";
import globals from "./globals.js";

// El polvo y el humo van por debajo de las cartas; las chispas, los tajos y los destellos por encima
const BELOW_CARDS = [ParticleId.DUST, ParticleId.SMOKE];

// Colores [r, g, b] de cada efecto
const DUST_COLOR    = [196, 160, 112];
const GOLD          = [255, 196, 72];
const EMBER         = [255, 120, 40];
const BLOOD         = [220, 40, 30];
const STEEL         = [150, 200, 255];
const ASH           = [70, 62, 58];

const EVENT_COLORS = {
    [TypeId.BUFF]:      [255, 210, 70],
    [TypeId.CURSE]:     [170, 70, 230],
    [TypeId.SPELL]:     [255, 110, 30],
    [TypeId.WEAPON]:    [230, 50, 50],
    [TypeId.ARMOR]:     [190, 215, 240],
};

const DUST_PER_SECOND = 45;

export default class ParticlesContainer{

    constructor(images){

        this.images         = images;
        this.particles      = [];
    }

    // Se llama en cada fotograma del movimiento: suelta polvo y alguna chispa por la parte de atras del esbirro
    createMovement(minionXPos, minionYPos, minionXSize, minionYSize, minionXV, minionYV){

        const speed = Math.hypot(minionXV, minionYV) || 1;
        const xDirection = minionXV / speed;
        const yDirection = minionYV / speed;
        const xBack = minionXPos + minionXSize / 2 - xDirection * minionXSize * 0.4;
        const yBack = minionYPos + minionYSize / 2 - yDirection * minionYSize * 0.4;

        const count = Math.floor(DUST_PER_SECOND * globals.deltaTime + Math.random());

        for (let i = 0; i < count; i++){

            const spread = (Math.random() - 0.5) * minionXSize * 0.7;
            const xPos = xBack - yDirection * spread;
            const yPos = yBack + xDirection * spread;
            const sideSpeed = (Math.random() - 0.5) * 40;

            this.add(ParticleId.DUST, xPos, yPos, -xDirection * 30 - yDirection * sideSpeed, -yDirection * 30 + xDirection * sideSpeed - 10, 0.7 + Math.random() * 0.4, 16 + Math.random() * 10, DUST_COLOR, { growth: 45, drag: 2, alpha: 0.75 });

            if (Math.random() < 0.4){

                this.add(ParticleId.MOTE, xPos, yPos, -xDirection * 20, -yDirection * 20 - 25, 0.6 + Math.random() * 0.4, 6 + Math.random() * 4, GOLD, { drag: 1.5 });
            }
        }
    }

    // El impacto cambia segun el resultado: golpe normal, critico, fallo o bloqueo
    createAttack(minionXPos, minionYPos, minionXSize, minionYSize, impact = AttackImpact.NORMAL){

        const xCenter = minionXPos + minionXSize / 2;
        const yCenter = minionYPos + minionYSize / 2;
        const slashAngle = Math.random() * Math.PI * 2;

        switch (impact){

            case AttackImpact.CRITICAL:
                this.add(ParticleId.FLASH, xCenter, yCenter, 0, 0, 0.35, 170, GOLD);
                this.add(ParticleId.RING, xCenter, yCenter, 0, 0, 0.6, 25, GOLD, { growth: 300 });
                this.add(ParticleId.SLASH, xCenter, yCenter, 0, 0, 0.6, 64, GOLD, { angle: slashAngle, sweep: Math.PI * 0.9 });
                this.add(ParticleId.SLASH, xCenter, yCenter, 0, 0, 0.6, 50, BLOOD, { angle: slashAngle + Math.PI, sweep: Math.PI * 0.8 });
                this.createBurst(xCenter, yCenter, 44, GOLD, 600, 3.6);
                this.createBurst(xCenter, yCenter, 18, BLOOD, 380, 3);
                break;

            case AttackImpact.BLUNT:
                for (let i = 0; i < 10; i++){

                    const angle = Math.random() * Math.PI * 2;
                    this.add(ParticleId.DUST, xCenter, yCenter, Math.cos(angle) * 130, Math.sin(angle) * 130, 0.9 + Math.random() * 0.4, 20 + Math.random() * 10, [180, 172, 160], { growth: 55, drag: 3, alpha: 0.7 });
                }
                this.createBurst(xCenter, yCenter, 6, [220, 220, 210], 240, 2.4);
                break;

            case AttackImpact.BLOCKED:
                this.add(ParticleId.FLASH, xCenter, yCenter, 0, 0, 0.3, 120, STEEL);
                this.add(ParticleId.RING, xCenter, yCenter, 0, 0, 0.5, 35, STEEL, { growth: 190 });
                this.createBurst(xCenter, yCenter, 30, STEEL, 500, 3.2);
                break;

            default:
                this.add(ParticleId.FLASH, xCenter, yCenter, 0, 0, 0.25, 110, EMBER);
                this.add(ParticleId.SLASH, xCenter, yCenter, 0, 0, 0.55, 58, BLOOD, { angle: slashAngle, sweep: Math.PI * 0.8 });
                this.createBurst(xCenter, yCenter, 26, EMBER, 480, 3.2);
                break;
        }
    }

    // Humo que sube y brasas que caen donde estaba el esbirro
    createDeath(minionXPos, minionYPos, minionXSize, minionYSize){

        const xCenter = minionXPos + minionXSize / 2;
        const yCenter = minionYPos + minionYSize / 2;

        for (let i = 0; i < 16; i++){

            const xPos = xCenter + (Math.random() - 0.5) * minionXSize * 0.8;
            const yPos = yCenter + (Math.random() - 0.5) * minionYSize * 0.6;
            this.add(ParticleId.SMOKE, xPos, yPos, (Math.random() - 0.5) * 30, -40 - Math.random() * 50, 1.6 + Math.random() * 0.8, 24 + Math.random() * 16, ASH, { growth: 30, drag: 0.5, alpha: 0.85 });
        }

        this.createBurst(xCenter, yCenter, 26, EMBER, 300, 3, -120);
    }

    // Destellos del color del evento que suben alrededor del esbirro
    createEvent(minionXPos, minionYPos, minionXSize, minionYSize, category){

        const color = EVENT_COLORS[category] ?? GOLD;
        const xCenter = minionXPos + minionXSize / 2;
        const yCenter = minionYPos + minionYSize / 2;

        this.add(ParticleId.RING, xCenter, yCenter, 0, 0, 0.8, 30, color, { growth: 140 });

        for (let i = 0; i < 34; i++){

            const xPos = xCenter + (Math.random() - 0.5) * minionXSize;
            const yPos = yCenter + (Math.random() - 0.2) * minionYSize * 0.6;
            this.add(ParticleId.MOTE, xPos, yPos, (Math.random() - 0.5) * 20, -60 - Math.random() * 80, 1.0 + Math.random() * 0.6, 8 + Math.random() * 6, color, { drag: 0.8 });
        }

        if (category === TypeId.SPELL){

            this.createBurst(xCenter, yCenter, 24, color, 360, 2.4);
        }
    }

    // Brasa que sube y se apaga, de una carta que arde
    createEmber(xPos, yPos){

        const color = Math.random() < 0.5 ? EMBER : GOLD;
        this.add(ParticleId.MOTE, xPos, yPos, (Math.random() - 0.5) * 40, -50 - Math.random() * 70, 0.7 + Math.random() * 0.5, 5 + Math.random() * 4, color, { drag: 0.8 });
    }

    // Joseph se descubre: fogonazo, anillo y chispas doradas
    createJosephReveal(xPos, yPos){

        this.add(ParticleId.FLASH, xPos, yPos, 0, 0, 0.4, 260, GOLD);
        this.add(ParticleId.RING, xPos, yPos, 0, 0, 0.7, 60, GOLD, { growth: 520 });
        this.createBurst(xPos, yPos, 40, GOLD, 650, 3.5);
        this.createBurst(xPos, yPos, 16, EMBER, 420, 3);
    }

    // Joseph llega a su sitio
    createJosephLanding(xPos, yPos){

        this.add(ParticleId.RING, xPos, yPos, 0, 0, 0.6, 30, GOLD, { growth: 160 });
        this.createBurst(xPos, yPos, 12, GOLD, 260, 2.6);
    }

    // Chispas en todas direcciones con un poco de gravedad
    createBurst(xPos, yPos, count, color, maxSpeed, size, gravity = 420){

        for (let i = 0; i < count; i++){

            const angle = Math.random() * Math.PI * 2;
            const speed = maxSpeed * (0.35 + Math.random() * 0.65);
            this.add(ParticleId.SPARK, xPos, yPos, Math.cos(angle) * speed, Math.sin(angle) * speed, 0.5 + Math.random() * 0.4, size * (0.7 + Math.random() * 0.6), color, { gravity: gravity, drag: 2.5 });
        }
    }

    add(id, xPos, yPos, xSpeed, ySpeed, life, size, color, options){

        this.particles.push(new Particle(id, xPos, yPos, xSpeed, ySpeed, life, size, color, options));
    }

    update(){

        for (let i = this.particles.length - 1; i >= 0; i--){

            const particle = this.particles[i];
            particle.update(globals.deltaTime);

            if (particle.isDead()){

                this.particles.splice(i, 1);
            }
        }
    }

    renderBelowCards(ctx){

        for (let i = 0; i < this.particles.length; i++){

            if (BELOW_CARDS.includes(this.particles[i].id)){

                this.particles[i].render(ctx);
            }
        }
    }

    renderAboveCards(ctx){

        for (let i = 0; i < this.particles.length; i++){

            if (!BELOW_CARDS.includes(this.particles[i].id)){

                this.particles[i].render(ctx);
            }
        }
    }
}
