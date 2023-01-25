export interface IEntity {
    cardId: string;
    name: string;
    attackPoints: number;
    hitPoints: number;
    types: string[];
    effects: { effect: () => any, requiresOwn: boolean, event: string, type: string };
}

export interface IContext {
    entities: {
        player: IEntity[],
        enemy: IEntity[],
    },
    activeCards: IEntity[],
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
    side: string,
    requiresOwn: boolean,
}

export interface IPosition {
    deck: IEntity[],
    side: string,
    index: number
}