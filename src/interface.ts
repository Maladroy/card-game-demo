export interface IEntity {
    cardId: string;
    name: string;
    attackPoints: number;
    hitPoints: number;
    types: string[];
    effects: Array<() => any>;
}

export interface IEntities {
    entities: {
        player: IEntity[],
        enemy: IEntity[]
    }
}