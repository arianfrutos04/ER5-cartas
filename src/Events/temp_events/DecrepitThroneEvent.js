import Event from "../Event.js";

export default class DecrepitThroneEvent extends Event{

    constructor(minion, enemyActiveMinionDeck, activeMinionDeck){
        super();

        this.enemyActiveMinionDeck  = enemyActiveMinionDeck;
        this.activeMinionDeck       = activeMinionDeck;
        this.minion                 = minion;
    }

    // Possesses an enemy minion, turning it into an ally until the end of the turn and granting it +3 attack and +1 speed until the end of the turn.
    execute(){
        // Search card index
        const index = this.enemyActiveMinionDeck.cards.indexOf(this.minion);

        // Si ya no esta en el mazo rival no se posee nada: con -1, splice quitaria el ultimo esbirro del rival
        if (index === -1){

            return;
        }

        // Splice the card from enemyActiveDeck
        this.enemyActiveMinionDeck.cards.splice(index, 1);

        // Apply the effect
        this.minion.changeStat("attack", 3);
        this.minion.changeStat("speed", 1);
        
        // Push the card to activeMinionDeck
        this.activeMinionDeck.cards.push(this.minion);

        // Mientras esta poseido es del mazo de quien lo posee: si muere, se busca y se quita de ahi
        this.minion.setDeck(this.activeMinionDeck);

    }

    static remove(minion, activeMinionDeck, enemyActiveMinionDeck){
        const index = activeMinionDeck.cards.indexOf(minion);
        console.log(index);
        if(index !== -1){
            activeMinionDeck.cards.splice(index, 1);
            console.log(activeMinionDeck.cards);

            minion.attack -= 3;
            minion.speed  -= 1;
    
            enemyActiveMinionDeck.cards.push(minion);
            enemyActiveMinionDeck.cards.pop();
        }
    }
}