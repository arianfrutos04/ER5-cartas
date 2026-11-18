import globals from "./globals.js";
import { FPS } from "./constants.js"


function initHTMLelements(){
    
    //canvas
    const canvas = document.getElementById('gameScreen');

    //Context
    const ctx = canvas.getContext("2d");

    //Eliminacion del Anti-Aliasing
    ctx.imageSmoothingEnabled = false;

    return [canvas,ctx]
}

// funcion inicializa variables del juego
function initVars(){
    //variables de gestion de tiempo
    globals.deltaTime = 0;
    globals.frameTimeObj = 1 / FPS;
}

// Exportar funciones
export{

    initHTMLelements,
    initVars,
}