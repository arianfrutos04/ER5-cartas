import Event from "../Event.js";

export default class LucretiaEvent extends Event {

    constructor(objectiveMinion, attribute, value){
        super();

        this.objectiveMinion    = objectiveMinion;
        this.attribute          = attribute;
        this.value              = value;
    
    }

    // "When activating the hero's passive ability, -1pts is applied to all statistics of enemy minions."
    execute(){

        switch (this.attribute){
            case "Attack":
                this.objectiveMinion.changeStat("attack", -this.value);
                break;

            case "Defense":
                this.objectiveMinion.changeStat("defense", -this.value);
                break;

            case "Health":
                this.objectiveMinion.changeStat("health", -this.value);
                break;

            case "Speed":
                this.objectiveMinion.changeStat("speed", -this.value);
                break;

        }

    }

}