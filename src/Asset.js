import { ImageTypes } from "./constants.js";
import { Images } from "./imageNames.js";

export default class Asset {

    constructor(){

        this.images = []
        this.assetsToLoad = []
        this.assetsLoaded = 0
        this.isLoaded = false
    }

    static create(){
        
        return new Asset()
    }

    loadImages(data) {

        this.loadCardImages(data);
        this.loadCardBorders();
        this.loadCardIcons();
        this.loadCardRarity();
        this.loadEquipmentRarity();
        this.loadGameRarity();
        this.loadCardType();
        this.loadBackground();
        this.loadTeamIcons();
        this.loadButtonImages();
        this.loadChatBubble();
        this.loadQuickHelp();
        this.loadParticleImages();
        this.loadButtonIcons();
    }

    loadCardImages(data) {
        
        let normalSize = [];
        let smallSize  = [];
        let images = [];
        let image;

        for (let i = 0; i < data.length; i++){

            const img = data[i].image;

            //Crear Imagenes de las Cartas
            image = new Image();
            image.addEventListener("load", this.loadHandler.bind(this), false);
            image.src = `../media/images/cards_img/${img}`;
            normalSize.push(image);
            this.assetsToLoad.push(image);

            image = new Image();
            image.addEventListener("load", this.loadHandler.bind(this), false);
            image.src = `../media/images/mini_cards_img/mini_${img}`;
            smallSize.push(image);
            this.assetsToLoad.push(image);
        }

        images.push(normalSize); 
        images.push(smallSize);
        this.images.push(images);
    }

    loadBackground(){

        this.createImage(Images.backgroundImages, "background");
    }

    loadCardBorders(){

        this.createImage(Images.cardBordersImages, "others");
    }

    loadCardIcons(){

        this.createImage(Images.cardIconsImages, "icons/card_icons");
    }

    loadCardRarity(){

        this.createImage(Images.cardRarityImages, "icons/card_rarity_icons");
    }

    loadEquipmentRarity(){

        this.createImage(Images.equipmentRarityImages, "icons/equip_rarity_icons");
    }

    loadGameRarity(){

        this.createImage(Images.gameRarityImages, "icons/game_rarity_icons");
    }

    loadCardType(){

        this.createImage(Images.cardTypeImages, "icons/card_type_icons");
    }

    loadTeamIcons(){

        this.createImage(Images.TeamImages, "icons/card_team_icons");
    }

    loadButtonImages(){

        this.createImage(Images.buttonImages, "others");
    }

    loadChatBubble(){

        this.createImage(Images.chatBubble, "others");
    }

    loadQuickHelp(){

        this.createImage(Images.quickHelpImages, "helps");
    }

    loadParticleImages(){

        this.createImage(Images.particleImages, "particles");
    }

    loadButtonIcons(){

        this.createImage(Images.buttonIconImages, "buttons");
    }

    loadHandler() {

        this.assetsLoaded++; //Adds 1 to the counter

        //Once all Elements are loaded
        if (this.assetsLoaded === this.assetsToLoad.length) {

            //Removes Load Event Listener
            for (let i = 0; i < this.images.length; i++){
                
                for (let j = 0; j < this.images[i].length; j++){

                    const image = this.images[i][j];
                    
                    if (i===0){

                        for (let k = 0; k < image.length; k++){

                            const img = image[k];
                            img.removeEventListener("load", this.loadHandler.bind(this), false);
                        }
                    }

                    else{
                        
                        image.removeEventListener("load", this.loadHandler.bind(this), false);
                    }
                }
            }

            this.isLoaded = true;
            console.log("Assets loaded");
        }
    }

    createImage(imagesToCreate, file) {

        let images = [];
        let image;

        for (let i = 0; i < imagesToCreate.length; i++) {

            // Crear Bordes de las Cartas
            image = new Image();
            image.addEventListener("load", this.loadHandler.bind(this), false);
            image.src = "../media/images/" + file + "/" + imagesToCreate[i] + ".png";
            images.push(image);
            this.assetsToLoad.push(image);
        }
        
        this.images.push(images);
    }
}