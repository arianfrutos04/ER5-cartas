import { TooltipText, TypeId, TypeNames } from "./constants.js";

export default class Tooltip {

    constructor(category, texts, timer){
        this.category   = category;
        this.texts      = texts;
        this.timer      = timer;
    }

    render(xPos, yPos, language, ctx, range){
        xPos += 30;
        this.timer.updatePlus();

        if(this.timer.value >= 2){

            switch(this.category){
                case TypeId.ARMOR:
                case TypeId.BUFF:
                case TypeId.CURSE:
                case TypeId.JOSEPH:
                case TypeId.MINION:
                case TypeId.SPELL:
                    
                    ctx.fillStyle = '#d59d00';
                    ctx.fillRect(xPos, yPos, 178, 63 ); 
        
                    ctx.fillStyle = '#362315';
                    ctx.fillRect(xPos + 3, yPos + 3, 172, 57 ); 
                    ctx.fillStyle = 'white';
                    
                    ctx.font ="15px LongaIberica-DEMO";
                    ctx.fillText(TooltipText.NAME[language], xPos + 35, yPos + 20);
                    this.texts.texts[1].render(ctx, xPos - 5, yPos - 217, language); 
        
                    ctx.fillText(TooltipText.TYPE[language], xPos + 36, yPos + 40);
                    ctx.fillText(TypeNames[this.category][language], xPos + 115, yPos + 40);
                    break;
    
                case TypeId.WEAPON:
                    ctx.fillStyle = '#d59d00'
                    ctx.fillRect(xPos, yPos, 178, 83 ) 

                    ctx.fillStyle = '#362315'
                    ctx.fillRect(xPos + 3, yPos + 3, 172, 77 ) 
                    ctx.fillStyle = 'white'

                    ctx.font ="15px LongaIberica-DEMO"
                    ctx.fillText(TooltipText.NAME[language], xPos+35, yPos+20)
                    this.texts.texts[1].render(ctx, xPos-5, yPos-217, language) 

                    ctx.fillText(TooltipText.TYPE[language], xPos+36, yPos+40)
                    ctx.fillText(TypeNames[this.category][language], xPos+115, yPos+40)

                    ctx.fillText(TooltipText.RANGE[language], xPos + 32, yPos + 60)
                    ctx.fillText(range, xPos + 118, yPos + 62)
                    break;
            }

        }
    }
}