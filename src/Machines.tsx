import { createMachine, assign } from "xstate";
import { generateRandomCard } from "./assets/entities";
import { IEntity } from "./interface";
import _ from "lodash";
const player: IEntity[] = [generateRandomCard()];
const enemy: IEntity[] = [generateRandomCard(), generateRandomCard()];

const actionProcess = (cause: IEntity[], target: IEntity[]) => {
  // avoid object mutation with cloning
  const cloneCause = _.cloneDeep(cause);
  const cloneTarget = _.cloneDeep(target);

  cloneTarget[0].hitPoints -= cloneCause[0].attackPoints;

  console.log(
    `${cause[0].name} deal ${cause[0].attackPoints} damage to ${target[0].name}!`
  );

  return { cloneCause, cloneTarget };
};

export default createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    id: "gameMachine",
    initial: "Init",
    context: {
      entities: { player, enemy }, // context must not be mutated externally but with assign()
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
            after: {
              1000: { target: "PlayerActionProcess" },
            },
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
            after: {
              1000: { target: "EnemyActionProcess" },
            },
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
      fightEnemy: assign(({ entities: { player, enemy } }: any) => {
        const { cloneCause, cloneTarget } = actionProcess(player, enemy);

        return {
          entities: {
            player: cloneCause,
            enemy: cloneTarget,
          },
        };
      }),
      fightPlayer: assign(({ entities: { player, enemy } }: any) => {
        const { cloneCause, cloneTarget } = actionProcess(enemy, player);

        return {
          entities: {
            player: cloneTarget,
            enemy: cloneCause,
          },
        };
      }),
      // filter out dead entities
      eliminationCheck: assign(({ entities: { player, enemy } }: any) => {
        return {
          entities: {
            player: _.filter(player, ({ hitPoints }) => hitPoints > 0),
            enemy: _.filter(enemy, ({ hitPoints }) => hitPoints > 0),
          },
        };
      }),
    },
    guards: {
      didPlayerWin: ({ entities: { enemy } }: any) => {
        // check if player won
        if (!enemy.length) {
          console.log("Player won!");
          return true;
        }
        return false;
      },
      isPlayerAlive: ({ entities: { player } }: any) => {
        // check if player alive
        // console.log(context.entities.player[0].hitPoints);
        return player[0].hitPoints > 0;
      },
      didEnemyWin: ({ entities: { player } }: any) => {
        // check if enemy won
        if (player.length === 0) {
          console.log("Enemy won!");
          return true;
        }
        return false;
      },
      isEnemyAlive: ({ entities: { enemy } }: any) => {
        // check if enemy alive
        // console.log(context.entities.enemy[0].hitPoints);
        return enemy[0].hitPoints > 0;
      },
    },
  }
);
