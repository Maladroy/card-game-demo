import { createMachine, assign } from "xstate";
import { basic, dummy } from "./assets/entities";
import { IEntity } from "./interface";

const player = [basic];
const enemy = [dummy, dummy];

const actionProcess = (cause: IEntity[], target: IEntity[]) => {
  target[0].hp -= cause[0].atk;

  console.log(`${cause[0].name} deal ${cause[0].atk} damage to ${target[0].name}!`);
}

export default createMachine (
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    id: "gameMachine",
    initial: "Init",
    context: {
      entities: { player, enemy },
    },
    states: {
      Init: {
        on: {
          INPUT: {
            target: "GameStart",
          },
        },
      },
      GameStart: {
        initial: "PlayerAction",
        states: {
          PlayerAction: {
            entry: ["fightEnemy"],
            on: {
              NEXT: {
                target: "PlayerActionProcess",
              },
            },
          },
          PlayerActionProcess: {
            entry: ["eliminationCheck"],
            always: [
              { target: "#gameMachine.GameEnd", cond: "didPlayerWin" },
              { target: "EnemyAction", cond: "isPlayerAlive" },
            ],
          },
          EnemyAction: {
            entry: ["fightPlayer"],
            on: {
              NEXT: {
                target: "EnemyActionProcess",
              },
            },
          },
          EnemyActionProcess: {
            entry: ["eliminationCheck"],
            always: [
              { target: "#gameMachine.GameEnd", cond: "didEnemyWin" },
              { target: "PlayerAction", cond: "isEnemyAlive" },
            ],
          },
        },
      },
      GameEnd: {},
    },
    schema: {
      context: {} as {},
      events: {} as { type: "INPUT" } | { type: "NEXT" },
    },
  },
  {
    actions: {
      // action implementations
      fightEnemy: (context: any, event) => {
        let player = context.entities.player;
        let enemy = context.entities.enemy;

        actionProcess(player, enemy)
      },
      fightPlayer: (context, event) => {
        let player = context.entities.player;
        let enemy = context.entities.enemy;

        actionProcess(enemy, player)
      },
      // filter out dead entities
      eliminationCheck: (context, event) => {
        context.entities.player = context.entities.player.filter((entity: IEntity) => entity.hp > 0);
        context.entities.enemy = context.entities.enemy.filter((entity: IEntity) => entity.hp > 0);
        console.log('action ran')
      },
      logger: (context, event) => {
        console.log("state: ", context);
      },
    },
    guards: {
      didPlayerWin: (context, event) => {
        // check if player won
        if (context.entities.enemy.length === 0) {
          console.log("Player won!");
          return true;
        }
        return false;
      },
      isPlayerAlive: (context, event) => {
        // check if player alive
        console.log(context.entities.player[0].hp)
        return context.entities.player[0].hp > 0;
      },
      didEnemyWin: (context, event) => {
        // check if enemy won
        if (context.entities.player.length === 0) {
          console.log("Enemy won!");
          return true;
        }
        return false;
      },
      isEnemyAlive: (context, event) => {
        // check if enemy alive
        console.log(context.entities.enemy[0].hp)
        return context.entities.enemy[0].hp > 0;
      },
    },
  }
);
