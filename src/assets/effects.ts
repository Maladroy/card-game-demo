import { IEntity } from "../interface";
import _ from "lodash";

const increaseHPToTypes = ( num: number, types: string[] ) => {
    const processor = (ownDeck: IEntity[]) => {
        let deckClone = _.cloneDeep(ownDeck)
        deckClone.map(card => {
            if ( types.some(type => card.types.includes(type))) {
                card.hitPoints += num
            }
        })
        return deckClone
    }

    return processor
}

export { increaseHPToTypes }