import { IEntity, IPosition } from "../interface";
import _ from "lodash";
import Target from "./targets";

class Effect {
    card: IEntity;
    index: number;
    side: string;
    requirements: string[];
  
    constructor( card: IEntity, index: number, side: string, requirements: string[]) {
      this.card = card,
      this.index = index,
      this.side = side,
      this.requirements = requirements
    }
}

const setNewIndex = (currentIndex: number, steps: number) => {
    currentIndex += steps
    if (currentIndex < 0) {
        currentIndex = 0
    } else if (currentIndex > 5) {
        currentIndex = 5
    }
    return currentIndex
}

const increaseHPToTypes = ( num: number, types: string[] ) => {
    const ownProcessor = (ownDeck: IEntity[]) => {
        ownDeck.map(card => {
            if ( types.some(type => card.types.includes(type))) {
                card.hitPoints += num
            }
        })
        return ownDeck
    }

    return [ownProcessor]
}

const extraAttack = ( num: number, target: number ) => {
    const oppProcessor = (oppDeck: IEntity[]) => {
        let deckClone = _.cloneDeep(oppDeck);
        if (deckClone.length > 1) {
            deckClone[target].hitPoints -= num
            deckClone[target].hitPoints = Math.max(deckClone[target].hitPoints, 0)
    
            console.log(`${deckClone[target].name} was hit for ${num}`)
        }

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
    const targetsProcessor = (oppDeck: IEntity[], targetsSide: string): IPosition[] => {
        let newTarget = new Target(
            oppDeck,
            targetsSide,
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
            const cardClone = _.cloneDeep(card)
            deckClone.unshift(cardClone);
        }
        while ( deckClone.length > 5 ) {
            deckClone.shift()
        }
        return deckClone
    }

    return [ownProcessor]
}

const swapPositionSelf = (steps: number) => {
    const ownProcessor = (ownDeck: IEntity[], index: number) => {
        let newIndex = setNewIndex(index, steps);
        ownDeck.splice(newIndex, 0, ownDeck.splice(index, 1)[0])
        return ownDeck
    }

    return [ownProcessor]
}

const swapPositionSingleEnemy = (steps: number, enemyIndex: number) => {
    const oppProcessor = (oppDeck: IEntity[]) => {
        let newIndex = setNewIndex(enemyIndex, steps);
        if (oppDeck[enemyIndex].effects.type != "movementImmunity") {
            oppDeck.splice(newIndex, 0, oppDeck.splice(enemyIndex, 1)[0])
        }
        return oppDeck
    }

    return [oppProcessor]
}

const doubleAttack = (chance: number, damage: number) => {
    const roll = Math.random()
    const oppProcessor = (oppDeck: IEntity[]) => {
        let deckClone = _.cloneDeep(oppDeck)
        if (deckClone[0].hitPoints > 0 && roll < chance) {
            deckClone[0].hitPoints -= damage
            deckClone[0].hitPoints = Math.max(deckClone[0].hitPoints, 0)
            console.log(`${deckClone[0].name} was hit for ${damage}`)
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

    return [oppProcessor,targetsProcessor]
}

const doNothing = () => {
    const ownProcessor = (ownDeck: IEntity[]) => {
        return ownDeck
    }

    return [ownProcessor]
}

const increaseAttackToSelf = (num: number) => {
    const ownProcessor = (ownDeck: IEntity[], index: number) => {
        ownDeck[index].attackPoints += num
        return ownDeck
    }

    return [ownProcessor]
}

const attackOnPosition = (damage: number, target: number, positions: number[]) => {
    const oppProcessor = (oppDeck: IEntity[], index: number) => {
        if (oppDeck.length > target + 1 && positions.includes(index)) {
            oppDeck[target].hitPoints -= damage
            oppDeck[target].hitPoints = Math.max(oppDeck[target].hitPoints, 0)
            console.log(`${oppDeck[target].name} was hit for ${damage}`)
        }

        return oppDeck
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

const attackAndMove = (damage: number, newIndex: number, targetIndex: number) => {
    const ownProcessor = (ownDeck: IEntity[], index: number) => {
        ownDeck.splice(newIndex, 0, ownDeck.splice(index, 1)[0])
        return ownDeck
    }

    const oppProcessor = (oppDeck: IEntity[], index: number) => {
        oppDeck[targetIndex].hitPoints -= index + 1 + damage
        oppDeck[targetIndex].hitPoints = Math.max(oppDeck[targetIndex].hitPoints, 0)
        console.log(`${oppDeck[targetIndex].name} was hit for ${index - damage}`)

        return oppDeck
    }

    const targetsProcessor = (oppDeck: IEntity[], targetSide: string): IPosition[] => {
        let newTarget = new Target(
            oppDeck,
            targetSide,
            targetIndex
        )
        return [newTarget]
    }
    return [ownProcessor,oppProcessor,targetsProcessor]
}

const executeTarget = (threshhold: number, targetIndex: number) => {
    const oppProcessor = (oppDeck: IEntity[]) => {
        if (oppDeck[targetIndex].hitPoints <= threshhold) {
            oppDeck[targetIndex].hitPoints = 0
        }
        console.log(`${oppDeck[targetIndex].name} was executed`)

        return oppDeck
    }
    const targetsProcessor = (oppDeck: IEntity[], targetSide: string): IPosition[] => {
        let newTarget = new Target(
            oppDeck,
            targetSide,
            targetIndex
        )
        return [newTarget]
    }
    return [oppProcessor,targetsProcessor]
}

export { Effect, increaseHPToTypes, extraAttack, reflectAttacker, spawnAlly, swapPositionSelf, swapPositionSingleEnemy, doNothing, doubleAttack,
    increaseAttackToSelf, attackOnPosition, attackAndMove, executeTarget}