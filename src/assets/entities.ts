
// const basic = {
//     id: 1,
//     name: 'basic',
//     attackPoints: 2,
//     hitPoints: 5,
//     effects: []
// }

import { IEntity } from "../interface";

// const dummy = {
//     id: 2,
//     name: 'dummy',
//     attackPoints: 1,
//     hitPoints: 5,
//     effects: []

// }

const names = ["Aaron", "Abdallah", "Bob", "Steve", "John", "Ethan", "Hashem", "Montgomery", "Roman", "Mike Hunt", "Chris Toris"]
class Card {
    id: string;
    name: string;
    attackPoints: number;
    hitPoints: number;
    effects: Array<() => void>;

    constructor(id: string, name: string, attackPoints: number, hitPoints: number, effects: Array<() => void>) {
        this.id = id;
        this.name = name;
        this.attackPoints = attackPoints;
        this.hitPoints = hitPoints;
        this.effects = effects;
    }
}

function generateRandomCard(): IEntity {
    return new Card(
        generateRandomString(10),
        names[Math.floor(Math.random() * names.length)],
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        [])
}

const generateRandomString = (length = 5) => Math.random().toString(20).substring(2, length)


export { generateRandomCard }