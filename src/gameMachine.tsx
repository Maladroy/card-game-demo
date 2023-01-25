import { createMachine, assign } from "xstate";
import { generateRandomCard, villager } from "./assets/entities";
import { IEntity, IContext, IEffect } from "./interface";
import _ from "lodash";

class Effect {
  card: IEntity;
  side: string;
  requiresOwn: boolean;

  constructor( card: IEntity, side: string, requiresOwn: boolean) {
    this.card = card,
    this.side = side,
    this.requiresOwn = requiresOwn
  }
}

class Target {
  deck: IEntity[];
  side: string;
  index: number;

  constructor( deck: IEntity[], side: string, index: number) {
    this.deck = deck,
    this.side = side,
    this.index = index
  }
}

const generateDeck = (num: number, ...entities: IEntity[]) => {
  let deck = entities.map(e => _.cloneDeep(e))
  while ( deck.length < num ) {
    deck.push(generateRandomCard())
  }
  return deck
}

const actionProcess = (cause: IEntity[], target: IEntity[], causeIndex = 0, targetIndex = 0) => {
  // avoid object mutation with cloning
  const cloneCause = _.cloneDeep(cause);
  const cloneTarget = _.cloneDeep(target);

  cloneTarget[targetIndex].hitPoints -= cloneCause[causeIndex].attackPoints;
  cloneTarget[targetIndex].hitPoints = Math.max(cloneTarget[targetIndex].hitPoints, 0);

  console.log(
    `${cloneCause[causeIndex].name} deal ${cloneCause[causeIndex].attackPoints} damage to ${cloneTarget[targetIndex].name}!`
  );

  return { cloneCause, cloneTarget };
};

// trigger a single effect
const processEffect = (effect: IEffect, playerDeck: IEntity[], enemyDeck: IEntity[]) => {
  const processor = effect.card.effects.effect()

  if (effect.requiresOwn) {
    playerDeck = processor(playerDeck)
  } else {
    enemyDeck = processor(enemyDeck)
  }

  return { playerDeck, enemyDeck }
}

export default createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    id: "gameMachine",
    initial: "Init",
    context: {
      entities: { player: [], enemy: [] }, // context must not be mutated externally but with assign()
      activeCards: [],
      effects: {
        inQueue: [],
        lastEffect: []
      },
      isPlayersTurn: true,
      flag: {
        latestCauses: [],
        latestTargets: []
      }
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
        initial: "SpawnCards",
        states: {
          SpawnCards: {
            entry: ["checkOnSpawn"],
            always: [
              { target: "ProcessEffects" },
            ]
          },
          ProcessEffects: {
            initial: "CheckEffectsQueue",
            states: {
              CheckEffectsQueue: {
                always: [
                  { target: "TriggerEffect", cond: "isQueueingEffects"},
                  { target: "#gameMachine.GameStart.AutoAction", internal: false }
                ]
              },
              TriggerEffect: {
                always: [
                  { actions: "triggerPlayerEffect", target: "PostEffect" ,cond: "isCardInPlayersDeck" },
                  { actions: "triggerEnemyEffect", target: "PostEffect" , cond: "isCardInEnemysDeck" },
                ],
              },
              PostEffect: {
                always: [
                  { target: "#gameMachine.GameStart.HitRegister", cond: "effectAttacks"},
                  { target: "#gameMachine.GameStart.Eliminate.DiscardEliminated", cond: "effectEliminates"},
                  { target: "#gameMachine.GameStart.SpawnCards", cond: "effectSpawns"},
                  { target: "CheckEffectsQueue" }
                ]
              }
            }
          },
          // EffectsCheck: {
          //   always: [
          //     { target: "SpawnEffectsProcess", cond: "isPendingSpawnEffects"},
          //     { target: "AutoAction" },
          //   ]
          // },
          // SpawnEffectsProcess: {
          //   entry: ["cardSpawnProcess"],
          //   after: {
          //     1000 : { target: "AutoAction"}
          //   }
          // },
          AutoAction: {
            always: [
              { target: "PlayerAction", cond: "isPlayersTurn"},
              { target: "EnemyAction" }
            ],
          },
          PlayerAction: {
            entry: ["fightEnemy"],
            always: [
              { target: "ProcessEffects", cond: "cardHasOnAttack"}
            ],
            after: {
              1000: { target: "HitRegister"}
            },
          },
          EnemyAction: {
            entry: ["fightPlayer"],
            always: [
              { target: "ProcessEffects", cond: "cardHasOnAttack"}
            ],
            after: {
              1000: { target: "HitRegister" }
            },
          },
          HitRegister: {
            entry: ["checkOnHit"],
            always: [
              { target: "Eliminate", cond: "isTargetEliminated" },
              { target: "ProcessEffects", internal: false}
            ],
          },
          Eliminate: {
            initial: "InitEliminate",
            states: {
              InitEliminate: {
                always: [
                  { target: "#gameMachine.GameStart.ProcessEffects", cond: "targetsHaveOnEliminated" },
                  { target: "DiscardEliminated" }
                ],
              },
              DiscardEliminated: {
                entry: ["discardEliminated"],
                always: [
                  { target: "#gameMachine.GameStart.WinCheck", cond: "isGameOver" },
                  { target: "PostEliminate"}
                ]
              },
              PostEliminate: {
                entry: ["checkOnEliminating"],
                always: [
                  { target: "#gameMachine.GameStart.ProcessEffects" }
                ]
              },
            }
          },
          WinCheck: {
            always: [
              { target: "#gameMachine.GameEnd", cond: "didPlayerWin" },
              { target: "#gameMachine.GameEnd", cond: "didEnemyWin" },
            ],
            after: {
              1000: { target: "AutoAction"}
            }
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
      context: {} as IContext,
      events: {} as { type: "INPUT" } | { type: "NEXT" } | { type: "PREVIOUS"},
    },
  },
  {
    actions: {
      // action implementations
      initializeMatch: assign(({}) => {
        const playerDeck = generateDeck(3, villager);
        const enemyDeck = generateDeck(3);
        
        return {
          entities: {
            player: playerDeck,
            enemy: enemyDeck,
          },
          activeCards: playerDeck.concat(enemyDeck),
          isPlayersTurn: true
        }
      }),
      checkOnSpawn: assign(({ entities: { player, enemy } , effects: { inQueue, lastEffect }}) => {
        let clone = inQueue;
        player.filter(card => card.effects.event === "onSpawn").forEach(card => {
          const queuedEffect = new Effect (
            card,
            "player",
            card.effects.requiresOwn
          )
          clone.unshift(queuedEffect)
        })
        enemy.filter(card => card.effects.event === "onSpawn").forEach(card => {
          const queuedEffect = new Effect (
            card,
            "enemy",
            card.effects.requiresOwn
          )
          clone.unshift(queuedEffect)
        })

        return {
          effects: {
            inQueue: clone,
            lastEffect
          }
        }
      }),
      checkOnHit: assign(({ effects: { inQueue, lastEffect }, flag: { latestTargets } }) => {
        let clone = _.cloneDeep(inQueue);
        latestTargets.filter(obj => obj.deck[obj.index].effects.event === "onHit")
        .forEach(obj => {
          const card = obj.deck[obj.index]
          const queuedEffect = new Effect(
            card,
            obj.side,
            card.effects.requiresOwn
          )
          clone.unshift(queuedEffect)
        })
        return {
          effects: {
            inQueue: clone,
            lastEffect
          }
        }
      }),
      checkOnEliminating: assign(({ effects: { inQueue, lastEffect }, flag: { latestCauses } }) => {
        let clone = _.cloneDeep(inQueue);
        latestCauses.filter(obj => obj.deck[obj.index].effects.event === "onHit")
        .forEach(obj => {
          const card = obj.deck[obj.index]
          const queuedEffect = new Effect(
            card,
            obj.side,
            card.effects.requiresOwn
          )
          clone.unshift(queuedEffect)
        })
        return {
          effects: {
            inQueue: clone,
            lastEffect
          }
        }
      }),
      triggerPlayerEffect: assign(({ entities: { player, enemy }, effects: { inQueue } }) => {
        let clone = _.cloneDeep(inQueue);
        let { playerDeck, enemyDeck } = processEffect(inQueue[0], player, enemy)
        setTimeout(()=> null, 3000)
        let last = clone.shift()
        return {
          entities: {
            player: playerDeck,
            enemy: enemyDeck
          },
          effects: {
            inQueue: clone,
            lastEffect: last
          }
        }
      }),
      triggerEnemyEffect: assign(({ entities: { player, enemy }, effects: { inQueue } }) => {
        let clone = inQueue;
        let { playerDeck, enemyDeck } = processEffect(inQueue[0], enemy, player)
        setTimeout(()=> null, 3000)
        let last = clone.shift()
        return {
          entities: {
            player: playerDeck,
            enemy: enemyDeck
          },
          effects: {
            inQueue: clone,
            lastEffect: last
          }
        }
      }),
      fightEnemy: assign(({ entities: { player, enemy } }) => {
        const { cloneCause, cloneTarget } = actionProcess(player, enemy);
        const newCause = new Target(cloneCause, "player", 0)
        const newTarget = new Target(cloneTarget, "enemy", 0)

        return {
          entities: {
            player: cloneCause,
            enemy: cloneTarget,
          },
          isPlayersTurn: false,
          flag: {
            latestCauses: [newCause],
            latestTargets: [newTarget]
          }
        };
      }),
      fightPlayer: assign(({ entities: { player, enemy } }) => {
        const { cloneCause, cloneTarget } = actionProcess(enemy, player);
        const newCause = new Target(cloneCause, "enemy", 0)
        const newTarget = new Target(cloneTarget, "player", 0)

        return {
          entities: {
            player: cloneTarget,
            enemy: cloneCause,
          },
          isPlayersTurn: true,
          flag: {
            latestCauses: [newCause],
            latestTargets: [newTarget]
          }
        };
      }),
      // filter out dead cards
      discardEliminated: assign(({ entities: { player, enemy } }) => {
        return {
          entities: {
            player: _.filter(player, ({ hitPoints }) => hitPoints > 0),
            enemy: _.filter(enemy, ({ hitPoints }) => hitPoints > 0),
          },
        };
      }),
    },
    guards: {
      isPlayersTurn: ({ isPlayersTurn }) => {
        return isPlayersTurn
      },
      didPlayerWin: ({ entities: { enemy } }) => {
        // check if player won
        if (enemy.length) return false;

        console.log("Player won!");
        return true;
      },
      didEnemyWin: ({ entities: { player } }) => {
        // check if enemy won
        if (player.length) return false;

        console.log("Enemy won!");
        return true;
      },
      isQueueingEffects: ({ effects: { inQueue } }) => {
        // check if theres still queueing effects
        return inQueue.length > 0
      },
      isTargetEliminated: ({ flag: { latestTargets } }) => {
        const card = latestTargets[0].deck[latestTargets[0].index]
        console.log(card.hitPoints)
        return card.hitPoints === 0
      },
      effectSpawns: ({ effects: { lastEffect } }) => {
        return lastEffect.card.effects.type === "spawn"
      },
      effectAttacks: ({ effects: { lastEffect } }) => {
        return lastEffect.card.effects.type === "attack"
      },
      effectEliminates: ({ effects: { lastEffect } }) => {
        return lastEffect.card.effects.type === "eliminate"
      },
      isCardInPlayersDeck: ({ effects: { inQueue } }) => {
        return inQueue[0].side === 'player'
      },
      isCardInEnemysDeck: ({ effects: { inQueue } }) => {
        return inQueue[0].side === 'enemy'
      },
      cardHasOnAttack: ({ entities: { player, enemy }, isPlayersTurn }) => {
        return isPlayersTurn ? player[0]?.effects?.event === "onAttack" : enemy[0]?.effects?.event === "onAttack"
      },
      targetsHaveOnEliminated: ({ flag: { latestTargets } }) => {
        return latestTargets.some(obj => obj.deck[obj.index].effects.event === "onEliminated")
      },
      isGameOver: ({ entities: { player, enemy }}) => {
        return player.length === 0 || enemy.length === 0
      }
    },
  }
);
