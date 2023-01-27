import { IEntity, IPosition } from "../interface";
import _ from "lodash";
import Target from "./targets";

class Effect {
    card: IEntity;
    side: string;
    requirements: string[];
  
    constructor( card: IEntity, side: string, requirements: string[]) {
      this.card = card,
      this.side = side,
      this.requirements = requirements
    }
  }

const increaseHPToTypes = ( num: number, types: string[] ) => {
    const ownProcessor = (ownDeck: IEntity[]) => {
        let deckClone = _.cloneDeep(ownDeck)
        deckClone.map(card => {
            if ( types.some(type => card.types.includes(type))) {
                card.hitPoints += num
            }
        })
        return deckClone
    }

    return [ownProcessor]
}

const extraAttack = ( num: number, target: number ) => {
    const oppProcessor = (oppDeck: IEntity[]) => {
        let deckClone = _.cloneDeep(oppDeck);
        deckClone[target].hitPoints -= num
        deckClone[target].hitPoints = Math.max(deckClone[target].hitPoints, 0)

        console.log(`${deckClone[target].name} was hit for ${num}`)
        return deckClone
    }
    const targetsProcessor = (oppDeck: IEntity[], targetSide: string): IPosition[] => {
        let newTarget = new Target(
            oppDeck,
            targetSide,
            target
        )
        return [newTarget]
    }
    return [oppProcessor,targetsProcessor]
}

const reflectAttacker = ( damageNum: number, debuffChance: number, debuffNum: number ) => {
    const roll = Math.random()
    const oppProcessor = (oppDeck: IEntity[]) => {
        let deckClone = _.cloneDeep(oppDeck);
        deckClone[0].hitPoints -= damageNum
        deckClone[0].hitPoints = Math.max(deckClone[0].hitPoints, 0)

        console.log(`${deckClone[0].name} was hit for ${damageNum}`)

        if (roll < debuffChance) {
            deckClone[0].attackPoints -= debuffNum
            deckClone[0].attackPoints = Math.max(deckClone[0].attackPoints, 0)
            console.log(`${deckClone[0].name}'s attack was reduced by ${debuffNum}`)
        }

        return deckClone
    }
    const targetsProcessor = (oppDeck: IEntity[], targetSide: string): IPosition[] => {
        let newTarget = new Target(
            oppDeck,
            targetSide,
            0
        )

        return [newTarget]
    }

    return [oppProcessor, targetsProcessor]
}

const spawnAlly = (card: IEntity, doubleChance: number) => {
    const roll = Math.random()

    const ownProcessor = (ownDeck: IEntity[]) => {
        let deckClone = ownDeck;
        deckClone.unshift(card);
        if (roll < doubleChance) {
            deckClone.unshift(card);
        }
        while ( deckClone.length > 5 ) {
            deckClone.shift()
        }
        console.log(deckClone)
        return deckClone
    }

    return [ownProcessor]
}

export { Effect, increaseHPToTypes, extraAttack, reflectAttacker, spawnAlly }