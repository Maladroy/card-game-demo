import { IEntity } from "../interface";
import { doNothing, doubleAttack, extraAttack, increaseHPToTypes, reflectAttacker, spawnAlly, swapPositionSelf, swapPositionSingleEnemy } from "./effects";

const names = ["Aaron", "Abdallah", "Bob", "Steve", "John", "Ethan", "Hashem", "Montgomery", "Roman", "Mike Hunt", "Chris Toris"]
export class Card {
    cardId: string;
    name: string;
    attackPoints: number;
    hitPoints: number;
    types: string[];
    effects: { effect: () => any, requirements: string[], event: string, type: string }

    constructor(cardId: string, name: string, attackPoints: number, hitPoints: number, types: string[], 
        effects: { effect: () => any, requirements: string[], event: string, type: string }) {
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
        { effect: () => null, requirements: [], event: '', type: ''},
    )
}

const generateRandomString = (length = 5) => Math.random().toString(20).substring(2, length)



const villager = new Card(
    "001",
    "Villager",
    1,
    5,
    ["human"], 
    {   
        effect: () => increaseHPToTypes(1, ["human"]),
        requirements: ["own"],
        event: "onSpawn",
        type: "buff",
    },
);

const hunter = new Card(
    "002",
    "Hunter",
    3,
    5,
    ["human"],
    {
        effect: () => extraAttack(2, 1),
        requirements: ["opp","latestTargets"],
        event: "onAttack",
        type: "attack"
    }
);

const largeTree = new Card(
    "003",
    "Large Tree",
    0,
    11,
    ["nature"],
    {
        effect: () => reflectAttacker(1, 0.2, 1),
        requirements: ["opp","latestTargets"],
        event: "onHit",
        type: "attack"
    }
);

const landlord = new Card(
    "004",
    "Landlord",
    1,
    4,
    ["human"],
    {
        effect: () => spawnAlly(villager, 0.35),
        requirements: ["own"],
        event: "onEliminated",
        type: "spawn"
    }
);

const assassin = new Card(
    "005",
    "Assassin",
    4,
    4,
    ["human"],
    {
        effect: () => swapPositionSelf(1),
        requirements: ["own"],
        event: "onEliminating",
        type: "swap"
    }
);

const imp = new Card(
    "006",
    "Imp",
    2,
    2,
    ["demon"],
    {
        effect: () => swapPositionSingleEnemy(2, 0),
        requirements: ["opp"],
        event: "onHit",
        type: "swap"
    }
);

const fiend = new Card(
    "007",
    "Fiend",
    2,
    8,
    ["demon"],
    {
        effect: () => doubleAttack(1, 2),
        requirements: ["opp"],
        event: "onAttack",
        type: "attack"
    }
);

const devil = new Card(
    "008",
    "Devil",
    5,
    6,
    ["demon"],
    {
        effect: () => spawnAlly(imp, 0),
        requirements: ["own"],
        event: "onEliminating",
        type: "spawn"
    }
);

const hellhound = new Card(
    "009",
    "Hellhound",
    8,
    10,
    ["demon"],
    {
        effect: () => doNothing(),
        requirements: ["own"],
        event: "onSpawn",
        type: "buff"
    }
)

export { generateRandomCard, villager, hunter, largeTree, landlord, assassin, imp, fiend, devil, hellhound }