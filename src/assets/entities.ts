import { IEntity } from "../interface";
import { increaseHPToTypes } from "./effects";

const names = ["Aaron", "Abdallah", "Bob", "Steve", "John", "Ethan", "Hashem", "Montgomery", "Roman", "Mike Hunt", "Chris Toris"]
class Card {
    cardId: string;
    name: string;
    attackPoints: number;
    hitPoints: number;
    types: string[];
    effects: { effect: () => any, requiresOwn: boolean, event: string, type: string }

    constructor(cardId: string, name: string, attackPoints: number, hitPoints: number, types: string[], 
        effects: { effect: () => any, requiresOwn: boolean, event: string, type: string }) {
            this.cardId = cardId;
            this.name = name;
            this.attackPoints = attackPoints;
            this.hitPoints = hitPoints;
            this.types = types;
            this.effects = effects;
    }
}

function generateRandomCard(): IEntity {
    return new Card(
        generateRandomString(10),
        names[Math.floor(Math.random() * names.length)],
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        ["human"],
        { effect: () => null, requiresOwn: false, event: '', type: ''},
    )
}

const generateRandomString = (length = 5) => Math.random().toString(20).substring(2, length)



const villager = new Card(
    "001",
    "Villager",
    1,
    2,
    ["human"], 
    {   
        effect: () => increaseHPToTypes(1, ["human"]),
        requiresOwn: true,
        event: "onSpawn",
        type: "buff",
    },
)

export { generateRandomCard, villager }