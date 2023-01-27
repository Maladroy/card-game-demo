import { IEntity } from "../interface";

export default class Target {
    deck: IEntity[];
    side: string;
    index: number;
  
    constructor( deck: IEntity[], side: string, index: number) {
      this.deck = deck,
      this.side = side,
      this.index = index
    }
  }