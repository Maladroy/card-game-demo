export interface IEntity {
    id: string;
    name: string;
    attackPoints: number;
    hitPoints: number;
    effects: Array<() => void>;
}
