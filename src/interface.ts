import { Card } from "./assets/entities";

export interface IEntity {
    cardId: string;
    name: string;
    attackPoints: number;
    hitPoints: number;
    types: string[];
    effects: { effect: () => any, requirements: string[], event: string, type: string };
}

export interface IContext {
    entities: {
        player: IEntity[],
        enemy: IEntity[],
    },
    // usersDeck: any[],
    effects: {
        inQueue: IEffect[],
        lastEffect: IEffect | any
    },
    isPlayersTurn: boolean,
    flag: {
        latestCauses: IPosition[]
        latestTargets: IPosition[]
    }
}

export interface IEffect {
    card: IEntity,
    index: number,
    side: string,
    requirements: string[],
}

export interface IPosition {
    deck: IEntity[],
    side: string,
    index: number
}