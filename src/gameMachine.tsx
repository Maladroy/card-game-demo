import { createMachine, assign } from "xstate";
import { generateRandomCard, villager } from "./assets/entities";
import { IEntity, IEntities } from "./interface";
import _ from "lodash";

const generateDeck = (num: number, ...entities: IEntity[]) => {
  let deck = entities.map(e => _.cloneDeep(e))
  while ( deck.length < num ) {
    deck.push(generateRandomCard())
  }
  return deck
}

const actionProcess = (cause: IEntity[], target: IEntity[]) => {
  // avoid object mutation with cloning
  const cloneCause = _.cloneDeep(cause);
  const cloneTarget = _.cloneDeep(target);

  cloneTarget[0].hitPoints -= cloneCause[0].attackPoints;
  cloneTarget[0].hitPoints = Math.max(cloneTarget[0].hitPoints, 0);

  console.log(
    `${cloneCause[0].name} deal ${cloneCause[0].attackPoints} damage to ${cloneTarget[0].name}!`
  );

  return { cloneCause, cloneTarget };
};

// trigger effects of cards in deck
const effectProcess = (deck: IEntity[]) => {
  deck.forEach(card => {
    card.effects.forEach(func => {
      const processor = func();
      deck = processor(deck)
    })
  })
  return deck
}

export default createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    id: "gameMachine",
    initial: "Init",
    context: {
      entities: { player: [], enemy: [] }, // context must not be mutated externally but with assign()
    },
    states: {
      Init: {
        entry: ["initializeMatch"],
        on: {
          INPUT: {
            target: "GameStart",
          },
        },
      },
      GameStart: {
        entry: ["processPreCombat"],
        initial: "PlayerAction",
        states: {
          PlayerAction: {
            entry: ["fightEnemy"],
            // after: {
            //   1000: { target: "PlayerActionProcess" },
            // },
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
              // { target: "EnemyAction", cond: "isPlayerAlive" },
            ],
            on: {
              NEXT: {
                target: "EnemyAction",
              },
            },
          },
          EnemyAction: {
            entry: ["fightPlayer"],
            // after: {
            //   1000: { target: "EnemyActionProcess" },
            // },
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
              // { target: "PlayerAction", cond: "isEnemyAlive" },
            ],
            on: {
              NEXT: {
                target: "PlayerAction",
              },
            },
          },
        },
        on: {
          INPUT: {
            target: "GameEnd"
          }
        },
      },
      GameEnd: {
        after: {
          1000: { target: "Init"}
        }
      },
    },
    schema: {
      context: {} as IEntities,
      events: {} as { type: "INPUT" } | { type: "NEXT" },
    },
  },
  {
    actions: {
      // action implementations
      initializeMatch: assign(() => {
        return {
          entities: {
            player: generateDeck(3, villager,villager,villager),
            enemy: generateDeck(3),
          }
        }
      }),
      processPreCombat: assign(({ entities: { player, enemy }}) => {
        const clonePlayer = effectProcess(player)
        const cloneEnemy = effectProcess(enemy)
        
        return {
          entities: {
            player: clonePlayer,
            enemy: cloneEnemy,
          },
        }
      }),
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
      reset: () => {

      }
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
