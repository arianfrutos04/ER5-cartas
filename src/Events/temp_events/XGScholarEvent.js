import Event  from "../Event.js";

export default class XGScholarEvent extends Event {

    constructor(objectiveMinion, attribute, value){
        super();
        this.objectiveMinion    = objectiveMinion;
        this.attribute          = attribute;
        this.value              = value;
    }   

    // Stares at an ally, granting them 2 extra health points and 2 attack points permanently.
    execute(){
        console.log("entra al ejecute");

        switch (this.attribute){
            case "Attack":
                this.objectiveMinion.changeStat("attack", this.value);
                break;

            case "Health":
                this.objectiveMinion.changeStat("health", this.value);
                break;

        }
    }
}