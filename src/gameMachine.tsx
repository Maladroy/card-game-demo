import { createMachine, assign } from "xstate";
import { generateRandomCard, villager, hunter, largeTree, landlord, assassin, fiend, devil, imp, hellhound } from "./assets/entities";
import { IEntity, IContext, IEffect } from "./interface";
import Target from "./assets/targets";
import { Effect } from "./assets/effects";
import _ from "lodash";


// generate new deck every restart
const generateDeck = (num: number, ...entities: IEntity[]) => {
  let deck = entities.map(e => _.cloneDeep(e))
  while ( deck.length < num ) {
    deck.push(generateRandomCard())
  }
  return deck
}

// auto attack 
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
const processEffect = (effect: IEffect, ownDeck: IEntity[], oppDeck: IEntity[], targetsSide: string) => {
  const processor = effect.card.effects.effect()
  let newTargets = []
  for ( let i = 0; i < effect.card.effects.requirements.length; i++) {
    if (effect.card.effects.requirements[i] === "own") {
      ownDeck = processor[i](ownDeck, effect.index)
    } else if (effect.card.effects.requirements[i] === "opp") {
      oppDeck = processor[i](oppDeck)
    } else if (effect.card.effects.requirements[i] === "latestTargets"){
      newTargets = processor[i](oppDeck, targetsSide)
    }
  }

  return { ownDeck, oppDeck, newTargets }
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
                ],
                after: {
                  300: { target: "#gameMachine.GameStart.AutoAction", internal: false }
                }
              },
              TriggerEffect: {
                always: [
                  { actions: "triggerPlayerEffect", target: "PostEffect" ,cond: "isCardInPlayersDeck" },
                  { actions: "triggerEnemyEffect", target: "PostEffect" , cond: "isCardInEnemysDeck" },
                ],
              },
              PostEffect: {
                entry: ["clearQueue"],
                always: [
                  { target: "#gameMachine.GameStart.SpawnCards", cond: "effectSpawns"},
                  { target: "#gameMachine.GameStart.HitRegister", cond: "effectAttacks"},
                  { target: "#gameMachine.GameStart.WinCheck", cond: "effectEliminates"},
                  { target: "CheckEffectsQueue" }
                ]
              }
            }
          },
          AutoAction: {
            always: [
              { target: "PlayerAction", cond: "isPlayersTurn"},
              { target: "EnemyAction" }
            ],
          },
          PlayerAction: {
            entry: ["fightEnemy"],
            always: [
              { target: "ProcessEffects", actions: ["queueOnAttackEffect"], cond: "cardHasOnAttack" }
            ],
            after: {
              1000: { target: "HitRegister"}
            },
          },
          EnemyAction: {
            entry: ["fightPlayer"],
            always: [
              { target: "ProcessEffects", actions: ["queueOnAttackEffect"], cond: "cardHasOnAttack"}
            ],
            after: {
              1000: { target: "HitRegister" }
            },
          },
          HitRegister: {
            always: [
              { target: "Eliminate", cond: "isTargetEliminated" },
              { target: "ProcessEffects", internal: false, actions: ["queueOnHitEffect"],  cond: "cardHasOnHit" },
              { target: "ProcessEffects", internal: false },
            ],
          },
          Eliminate: {
            initial: "InitEliminate",
            states: {
              InitEliminate: {
                always: [
                  { target: "#gameMachine.GameStart.ProcessEffects", actions: ["queueOnEliminated","discardEliminated"], cond: "targetsHaveOnEliminated" },
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
                always: [
                  { target: "#gameMachine.GameStart.ProcessEffects", actions: ["queueOnEliminating"], cond: "causesHaveOnEliminating"}
                ],
                after: {
                  1000: { target: "#gameMachine.GameStart.ProcessEffects" }
                }
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
        const playerDeck = generateDeck(5, assassin, landlord, villager, villager, assassin);
        const enemyDeck = generateDeck(5, fiend, fiend, devil, imp, imp);
        
        return {
          entities: {
            player: playerDeck,
            enemy: enemyDeck,
          },
          activeCards: playerDeck.concat(enemyDeck),
          isPlayersTurn: true
        }
      }),

      // check effects
      checkOnSpawn: assign(({ entities: { player, enemy } , effects: { inQueue, lastEffect }}) => {
        let clone = inQueue;
        player.filter(card => card.effects.event === "onSpawn").forEach((card, index) => {
          const queuedEffect = new Effect (
            card,
            index,
            "player",
            card.effects.requirements
          )
          clone.unshift(queuedEffect)
        })
        enemy.filter(card => card.effects.event === "onSpawn").forEach((card, index) => {
          const queuedEffect = new Effect (
            card,
            index,
            "enemy",
            card.effects.requirements
          )
          clone.push(queuedEffect)
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
            obj.index,
            obj.side,
            card.effects.requirements
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

      //queue effects
      queueOnAttackEffect: assign(({ effects: { inQueue, lastEffect }, flag: { latestCauses }}) => {
        let clone = _.cloneDeep(inQueue)
        const newEffect = new Effect(
          latestCauses[0].deck[latestCauses[0].index],
          latestCauses[0].index,
          latestCauses[0].side,
          latestCauses[0].deck[latestCauses[0].index].effects.requirements
        )
        clone.unshift(newEffect)
        return {
          effects: {
            inQueue: clone,
            lastEffect
          }
        }
      }),
      queueOnHitEffect: assign(({ effects: { inQueue, lastEffect }, flag: { latestTargets } }) => {
        let clone = _.cloneDeep(inQueue);
        latestTargets.filter(obj => obj.deck[obj.index].effects.event === "onHit")
        .forEach(obj => {
          const card = obj.deck[obj.index]
          const queuedEffect = new Effect(
            card,
            obj.index,
            obj.side,
            card.effects.requirements
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
      queueOnEliminated: assign(({ effects: { inQueue, lastEffect }, flag: { latestTargets }}) => {
        let clone = _.cloneDeep(inQueue)
        latestTargets.forEach(target => {
          const newEffect = new Effect(
            target.deck[target.index],
            target.index,
            target.side,
            target.deck[target.index].effects.requirements
          )
          clone.push(newEffect)
        })
        return {
          effects: {
            inQueue: clone,
            lastEffect
          }
        }
      }),
      queueOnEliminating: assign(({ effects: { inQueue, lastEffect }, flag: { latestCauses }}) => {
        let clone = _.cloneDeep(inQueue)
        latestCauses.forEach(target => {
          const newEffect = new Effect(
            target.deck[target.index],
            target.index,
            target.side,
            target.deck[target.index].effects.requirements
          )
          clone.push(newEffect)
        })
        return {
          effects: {
            inQueue: clone,
            lastEffect
          }
        }
      }),

      // trigger effects
      triggerPlayerEffect: assign(({ entities: { player, enemy }, effects: { inQueue }, flag: { latestCauses, latestTargets } }) => {
        let { ownDeck, oppDeck, newTargets } = processEffect(inQueue[0], player, enemy, "enemy")
        if (inQueue[0].card.effects.event === "onAttack") {
          newTargets = newTargets.concat(latestTargets)
        }
        return {
          entities: {
            player: ownDeck,
            enemy: oppDeck
          },
          flag: {
            latestCauses,
            latestTargets: newTargets.length > 0 ? newTargets : latestTargets
          }
        }
      }),
      triggerEnemyEffect: assign(({ entities: { player, enemy }, effects: { inQueue }, flag: { latestCauses, latestTargets } }) => {
        let { ownDeck, oppDeck, newTargets } = processEffect(inQueue[0], enemy, player, "player")

        return {
          entities: {
            player: oppDeck,
            enemy: ownDeck
          },
          flag: {
            latestCauses,
            latestTargets: newTargets.length > 0 ? newTargets : latestTargets
          }
        }
      }),

      clearQueue: assign(({ effects: { inQueue } }) => {
        let clone = inQueue;
        const last = clone.shift()
        return {
          effects: {
            inQueue: clone,
            lastEffect: last
          }
        }
      }),

      // auto actions
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
        return card.hitPoints === 0
      },

      isCardInPlayersDeck: ({ effects: { inQueue } }) => {
        return inQueue[0].side === 'player'
      },
      isCardInEnemysDeck: ({ effects: { inQueue } }) => {
        return inQueue[0].side === 'enemy'
      },

      cardHasOnAttack: ({ entities: { player, enemy }, isPlayersTurn }) => {
        return isPlayersTurn ? enemy[0]?.effects?.event === "onAttack" : player[0]?.effects?.event === "onAttack"
      },
      cardHasOnHit: ({ flag: { latestTargets } }) => {
        return latestTargets.some(obj => obj.deck[obj.index].effects.event === "onHit")
      },
      targetsHaveOnEliminated: ({ flag: { latestTargets } }) => {
        return latestTargets.some(obj => obj.deck[obj.index].effects.event === "onEliminated")
      },
      causesHaveOnEliminating: ({ flag: { latestCauses } }) => {
        return latestCauses.some(obj => obj.deck[obj.index].effects.event === "onEliminating")
      },
      
      // detect effect type
      effectSpawns: ({ effects: { lastEffect } }) => {
        return lastEffect.card.effects.type === "spawn"
      },
      effectAttacks: ({ effects: { lastEffect } }) => {
        return lastEffect.card.effects.type === "attack" || lastEffect.card.effects.event === "onAttack"
      },
      effectEliminates: ({ effects: { lastEffect } }) => {
        return lastEffect.card.effects.type === "eliminate"
      },

      isGameOver: ({ entities: { player, enemy }}) => {
        return player.length === 0 || enemy.length === 0
      }
    },
  }
);
