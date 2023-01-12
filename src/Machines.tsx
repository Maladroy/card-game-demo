import { createMachine, assign } from "xstate";
import { generateRandomCard } from "./assets/entities";
import { IEntity, IEntities } from "./interface";
import _ from "lodash";
const player = [generateRandomCard()];
const enemy = [generateRandomCard(), generateRandomCard()];

const actionProcess = (cause: IEntity[], target: IEntity[]) => {
  // avoid object mutation with cloning
  const cloneCause = _.cloneDeep(cause);
  const cloneTarget = _.cloneDeep(target);

  cloneTarget[0].hitPoints -= cloneCause[0].attackPoints;
  cloneTarget[0].hitPoints = Math.max(cloneTarget[0].hitPoints, 0);

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
      context: {} as IEntities,
      events: {} as { type: "INPUT" } | { type: "NEXT" },
    },
  },
  {
    actions: {
      // action implementations
      fightEnemy: assign(({ entities: { player, enemy } }) => {
        const { cloneCause, cloneTarget } = actionProcess(player, enemy);

        return {
          entities: {
            player: cloneCause,
            enemy: cloneTarget,
          },
        };
      }),
      fightPlayer: assign(({ entities: { player, enemy } }) => {
        const { cloneCause, cloneTarget } = actionProcess(enemy, player);

        return {
          entities: {
            player: cloneTarget,
            enemy: cloneCause,
          },
        };
      }),
      // filter out dead entities
      eliminationCheck: assign(({ entities: { player, enemy } }) => {
        return {
          entities: {
            player: _.filter(player, ({ hitPoints }) => hitPoints > 0),
            enemy: _.filter(enemy, ({ hitPoints }) => hitPoints > 0),
          },
        };
      }),
    },
    guards: {
      didPlayerWin: ({ entities: { enemy } }) => {
        // check if player won
        if (enemy.length) return false;

        console.log("Player won!");
        return true;
      },
      isPlayerAlive: ({ entities: { player } }) => {
        // check if player alive
        // console.log(context.entities.player[0].hitPoints);
        return player[0].hitPoints > 0;
      },
      didEnemyWin: ({ entities: { player } }) => {
        // check if enemy won
        if (player.length) return false;

        console.log("Enemy won!");
        return true;
      },
      isEnemyAlive: ({ entities: { enemy } }) => {
        // check if enemy alive
        // console.log(context.entities.enemy[0].hitPoints);
        return enemy[0].hitPoints > 0;
      },
    },
  }
);
