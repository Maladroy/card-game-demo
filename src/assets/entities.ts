import { IEntity } from "../interface";
import { attackAndMove, attackOnPosition, doNothing, doubleAttack, executeTarget, extraAttack, increaseAttackToSelf, increaseHPToTypes, reflectAttacker, spawnAlly, swapPositionSelf, swapPositionSingleEnemy } from "./effects";

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
    3,
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
        requirements: ["opp","latestTargets"],
        event: "onAttack",
        type: "attack"
    }
);

const devil = new Card(
    "008",
    "Devil",
    4,
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
    5,
    10,
    ["demon"],
    {
        effect: () => {},
        requirements: [],
        event: "none",
        type: "none"
    }
);

const hellreaper = new Card(
    "010",
    "Hell Reaper",
    4,
    3,
    ["demon"],
    {
        effect: () => increaseAttackToSelf(2),
        requirements: ["own"],
        event: "onAllyEliminated",
        type: "buff"
    }
);

const swordman = new Card(
    "011",
    "Swordman",
    4,
    6,
    ["warrior","human"],
    {
        effect: () => {},
        requirements: [],
        event: "none",
        type: "none"
    }
);

const archer = new Card(
    "012",
    "Archer",
    2,
    6,
    ["warrior","human"],
    {
        effect: () => attackOnPosition(2,0,[3,4,5]),
        requirements: ["opp","latestTargets"],
        event: "onAllyAttack",
        type: "attack"
    }
);

const cavalry = new Card(
    "013",
    "Cavalry",
    4,
    8,
    ["warrior","human"],
    {
        effect: () => attackAndMove(0, 0, 0),
        requirements: ["own","opp","latestTargets"],
        event: "onAllyEliminated",
        type: "attack"
    }
);

const shielder = new Card(
    "014",
    "Shielder",
    1,
    12,
    ["warrior","human"],
    {
        effect: () => {},
        requirements: [],
        event: "none",
        type: "movementImmunity"
    }
);

const spearman = new Card(
    "015",
    "Spearman",
    4,
    6,
    ["warrior","human"],
    {
        effect: () => executeTarget(2,0),
        requirements: ["opp","latestTargets"],
        event: "onAttack",
        type: "attack"
    }
)

const cardList = [villager, hunter, largeTree, landlord, assassin, imp, fiend, devil, hellhound, hellreaper, swordman, archer,
cavalry, shielder, spearman]

export { generateRandomCard, cardList, villager, hunter, largeTree, landlord, assassin, imp, fiend, devil, hellhound, hellreaper, swordman, archer,
cavalry, shielder, spearman }