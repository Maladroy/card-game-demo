import { IEntity } from "../interface";
import { attackAndMove, attackOnPosition, buffTypeBasedOnEffectType, doNothing, doubleAttack, executeTarget, extraAttack, increaseAttackAndHPToAll, increaseAttackToSelf, increaseAttackToSelfPerType, increaseAttackToTypes, increaseHPToAllAllies, increaseHPToAllies, increaseHPToSelf, increaseHPToTypes, moveToSpot, reflectAttacker, spawnAlly, swapPositionSelf, swapPositionSingleEnemy } from "./effects";

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

const thornTree = new Card(
    "003",
    "Thorn Tree",
    0,
    7,
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
        effect: () => spawnAlly(villager, 1, 0.35),
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
        requirements: ["opp", "latestTargets"],
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
        effect: () => spawnAlly(imp, 1, 0),
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
);

const bard = new Card(
    "016",
    "Bard",
    1,
    4,
    ["human"],
    {
        effect: () => increaseAttackAndHPToAll(1, 2, 2, 1),
        requirements: ["own"],
        event: "onSpawn",
        type: "buff"
    }
);

const tiger = new Card(
    "017",
    "Tiger",
    3,
    5,
    ["animal"],
    {
        effect: () => {},
        requirements: [],
        event: "none",
        type: "none"
    }
);

const youngDruid = new Card(
    "018",
    "Young Druid",
    1,
    4,
    ["nature"],
    {
        effect: () => spawnAlly(tiger, 1, 0),
        requirements: ["own"],
        event: "onEliminated",
        type: "spawn"
    }
);

const lion = new Card(
    "019",
    "Lion",
    3,
    5,
    ["animal"],
    {
        effect: () => increaseAttackToTypes(1, ["animal"]),
        requirements: ["own"],
        event: "onEliminated",
        type: "buff"
    }
);

const hippo = new Card(
    "020",
    "Hippo",
    0,
    9,
    ["animal"],
    {
        effect: () => extraAttack(3,0),
        requirements: ["opp","latestTargets"],
        event: "onHit",
        type: "attack"
    }
);

const herbalist = new Card(
    "021",
    "Herbalist",
    1,
    3,
    ["human"],
    {
        effect: () => increaseHPToAllies(2,[-1],["nature"]),
        requirements: ["own"],
        event: "onSpawn",
        type: "buff"
    }
);

const treant = new Card(
    "022",
    "Treant",
    2,
    9,
    ["nature"],
    {
        effect: () => spawnAlly(youngTreant, 1, 0),
        requirements: ["own"],
        event: "onEliminated",
        type: "spawn"
    }
);

const youngTreant = new Card(
    "023",
    "Young Treant",
    2,
    4,
    ["nature"],
    {
        effect: () => increaseHPToSelf(1),
        requirements: ["own"],
        event: "onHit",
        type: "buff"
    }
);

const fairy = new Card(
    "024",
    "Fairy",
    1,
    2,
    ["mystic"],
    {
        effect: () => increaseHPToAllAllies(3),
        requirements: ["own"],
        event: "onSpawn",
        type: "buff"
    }
);

const woodElf = new Card(
    "025",
    "Wood Elf",
    2,
    6,
    ["elf"],
    {
        effect: () => increaseAttackToSelfPerType(2, ["nature"]),
        requirements: ["own"],
        event: "onAttack",
        type: "buff"
    }
);

const heartOfTheForest = new Card(
    "026",
    "<Heart Of The Forest>",
    0,
    12,
    ["nature"],
    {
        effect: () => increaseHPToTypes(1, ["nature"]),
        requirements: ["own"],
        event: "onAttack",
        type: "buff"
    }
);

const treantWaker = new Card(
    "027",
    "Treant Waker",
    1,
    6,
    ["misc"],
    {
        effect: () => buffTypeBasedOnEffectType(4,0,0,6,["nature"]),
        requirements: ["own"],
        event: "onSpawn",
        type: "buff"
    }
);

const prototypeI = new Card(
    "028",
    "Prototype I",
    1,
    12,
    ["machine"],
    {
        effect: () => moveToSpot(0),
        requirements: ["own"],
        event: "onAllyHit",
        type: "swap"
    }
);

const prototypeII = new Card(
    "029",
    "Prototype II",
    1,
    14,
    ["machine"],
    {
        effect: () => swapPositionSingleEnemy(1, 0),
        requirements: ["opp","latestTargets"],
        event: "onAttack",
        type: "swap"
    }
)


const cardList = [villager, hunter, thornTree, landlord, assassin, imp, fiend, devil, hellhound, hellreaper, swordman, archer,
cavalry, shielder, spearman, bard, tiger, youngDruid, lion, hippo, herbalist, treant, fairy, woodElf]

export { generateRandomCard, cardList, villager, hunter, thornTree, landlord, assassin, imp, fiend, devil, hellhound, hellreaper, swordman, archer,
cavalry, shielder, spearman, bard, youngDruid, lion, hippo, herbalist, treant, fairy, woodElf, heartOfTheForest, treantWaker, prototypeI,
prototypeII }