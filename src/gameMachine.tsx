import { createMachine, assign } from "xstate";
import { generateRandomCard, villager, hunter, thornTree, landlord, assassin, fiend, devil, imp, hellhound, hellreaper, swordman, archer, cavalry, shielder, spearman, bard, hippo, youngDruid, lion, treant, herbalist, fairy, woodElf, heartOfTheForest, treantWaker, prototypeI, prototypeII, prototypeIII, prototypeV } from "./assets/entities";
import { IEntity, IContext, IEffect, IPosition } from "./interface";
import Target from "./assets/targets";
import { doNothing, Effect } from "./assets/effects";
import _ from "lodash";

// generate new deck every restart
const generateDeck = (num: number, entities: IEntity[]) => {
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
const processEffect = (effect: IEffect, ownDeck: IEntity[], oppDeck: IEntity[], targetsSide: string, latestTargets: IPosition[]) => {
  const processor = effect.card.effects.effect()
  let newTargets = []
  for ( let i = 0; i < effect.card.effects.requirements.length; i++) {
    if (effect.card.effects.requirements[i] === "own") {
      ownDeck = processor[i](ownDeck, effect.index)
    } else if (effect.card.effects.requirements[i] === "opp") {
      oppDeck = processor[i](oppDeck, effect.index)
    } else if (effect.card.effects.requirements[i] === "latestTargets"){
      newTargets = processor[i](oppDeck, targetsSide, latestTargets)
    }
  }

  return { ownDeck, oppDeck, newTargets }
}

const arrayUnion = (arr1: IPosition[], arr2: IPosition[], identifier: string) => {
  const array = [...arr1, ...arr2]

  return _.uniqBy(array, identifier)  
}

export default createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    id: "gameMachine",
    initial: "Idle",
    context: {
      entities: { player: [], enemy: [] }, // context must not be mutated externally but with assign()
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
      Idle: {
        on: {
          INPUT: {
            target: "Init",
          },
        },
      },
      Init: {
        entry: ["initializeMatch"],
        after: {
          1000: { target: "GameStart" }
        }
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
                  { target: "TriggerEffect", cond: "isQueueingEffects" },
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
                  { target: "#gameMachine.GameStart.Eliminate.DiscardEliminated", cond: "effectEliminates" },
                  { target: "#gameMachine.GameStart.SpawnCards", cond: "effectSpawns" },
                  { target: "#gameMachine.GameStart.HitRegister", cond: "effectAttacks" },
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
            initial: "autoAttack",
            states: {
              autoAttack: {
                entry: ["fightEnemy"],
                always: [
                  { target: "postAttack", cond: "deckHasOnAttack" },
                ],
                after: {
                  1000: { target: "#gameMachine.GameStart.HitRegister" }
                },
              },
              postAttack: {
                entry: ["queueOnAllyAttack"],
                always: [
                  { target: "#gameMachine.GameStart.ProcessEffects", actions: ["queueOnAttackEffect"], cond: "cardHasOnAttack" },
                  { target: "#gameMachine.GameStart.ProcessEffects" },
                ],
              }
            }
          },
          EnemyAction: {
            initial: "autoAttack",
            states: {
              autoAttack: {
                entry: ["fightPlayer"],
                always: [
                  { target: "postAttack", cond: "deckHasOnAttack" },
                ],
                after: {
                  1000: { target: "#gameMachine.GameStart.HitRegister"}
                },
              },
              postAttack: {
                entry: ["queueOnAllyAttack"],
                always: [
                  { target: "#gameMachine.GameStart.ProcessEffects", actions: ["queueOnAttackEffect"], cond: "cardHasOnAttack" },
                  { target: "#gameMachine.GameStart.ProcessEffects" },
                ],
              }
            }
          },
          HitRegister: {
            initial: "phase1",
            states: {
              phase1: {
                always: [
                  { target: "#gameMachine.GameStart.Eliminate", cond: "isTargetEliminated" },
                  { target: "phase2", internal: false, actions: ["queueOnAllyHitEffect"],  cond: "deckHasOnAllyHit" },
                  { target: "phase2", internal: false },
                ],
              },
              phase2: {
                always: [
                  { target: "#gameMachine.GameStart.ProcessEffects", actions: ["queueOnHitEffect"],  cond: "cardHasOnHit" },
                  { target: "#gameMachine.GameStart.ProcessEffects" },
                ],
              }
            }
          },
          Eliminate: {
            initial: "eliminationPhase1",
            states: {
              eliminationPhase1: {
                always: [
                  { target: "eliminationPhase2", actions: ["queueOnAllyEliminated"], cond: "deckHasOnAllyEliminated" },
                  { target: "eliminationPhase2" }
                ],
              },
              eliminationPhase2: {
                always: [
                  { target: "InitEliminate", actions: ["queueOnEliminating"], cond: "causesHaveOnEliminating" },
                  { target: "InitEliminate" }
                ],
              },
              InitEliminate: {
                always: [
                  { target: "#gameMachine.GameStart.ProcessEffects", actions: ["queueOnEliminated"], cond: "targetsHaveOnEliminated" },
                  { target: "DiscardEliminated" }
                ],
              },
              DiscardEliminated: {
                entry: ["discardEliminated","fixEffectQueue"],
                always: [
                  { target: "#gameMachine.GameStart.WinCheck", cond: "isGameOver" },
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
              { target: "#gameMachine.GameStart.SpawnCards", cond: "effectSpawns" },
            ],
            after: {
              1000: { target: "#gameMachine.GameStart.ProcessEffects"}
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
          1000: { target: "Idle"}
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
        // [hellhound, devil, devil, fiend, hellreaper]
        // [heartOfTheForest, thornTree, treant, treant, treantWaker]
        const playerDeck = generateDeck(5, [prototypeV, prototypeI, prototypeI, prototypeI, prototypeI]);
        const enemyDeck = generateDeck(5, [hellhound, devil, devil, fiend, hellreaper]);
        return {
          entities: {
            player: playerDeck,
            enemy: enemyDeck,
          },
          isPlayersTurn: true
        }
      }),

      // check effects
      checkOnSpawn: assign(({ entities: { player, enemy } , effects: { inQueue, lastEffect }}) => {
        let clone = inQueue;
        const playerClone = _.cloneDeep(player);
        const enemyClone = _.cloneDeep(enemy);

        enemyClone.reverse().forEach((card, index) => {
          const trueIndex = enemyClone.length - 1 - index;
          if (card.effects.event === "onSpawn") {
            const newEffect = new Effect(
              card,
              trueIndex,
              "enemy",
              card.effects.requirements
            )
            clone.unshift(newEffect)
            card.effects.event = "none"
          }
        });

        playerClone.reverse().forEach((card, index) => {
          const trueIndex = playerClone.length - 1 - index;
          if (card.effects.event === "onSpawn") {
            const newEffect = new Effect(
              card,
              trueIndex,
              "player",
              card.effects.requirements
            )
            clone.unshift(newEffect)
            card.effects.event = "none"
          }
        })

        return {
          entities: {
            player: playerClone.reverse(),
            enemy: enemyClone.reverse()
          },
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
      queueOnAllyAttack: assign(({ effects: { inQueue, lastEffect }, flag: { latestCauses }}) => {
        let clone = _.cloneDeep(inQueue)

        const deck = _.cloneDeep(latestCauses[0].deck)
        deck.reverse().forEach((card, index) => {
          if (card.effects.event === "onAllyAttack") {
            const trueIndex = deck.length - 1 - index;
            const newEffect = new Effect(
              card,
              trueIndex,
              latestCauses[0].side,
              card.effects.requirements
            )
            clone.unshift(newEffect)
          }
        })

        return {
          effects: {
            inQueue: clone,
            lastEffect
          }
        }
      }),   
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
      queueOnAllyHitEffect: assign(({ effects: { inQueue, lastEffect }, flag: { latestTargets }}) => {
        let clone = _.cloneDeep(inQueue)

        const deck = _.cloneDeep(latestTargets[0].deck)
        deck.reverse().forEach((card, index) => {
          if (card.effects.event === "onAllyHit") {
            const trueIndex = deck.length - 1 - index;
            const newEffect = new Effect(
              card,
              trueIndex,
              latestTargets[0].side,
              card.effects.requirements
            )
            clone.unshift(newEffect)
          }
        })

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
      queueOnAllyEliminated: assign(({ effects: { inQueue, lastEffect }, flag: { latestTargets }}) => {
        let clone = _.cloneDeep(inQueue)
        // queue onAllyEliminated
        const deck = _.cloneDeep(latestTargets[0].deck)
        deck.reverse().forEach((card, index) => {
          if (card.effects.event === "onAllyEliminated") {
            const trueIndex = deck.length - 1 - index;
            const newEffect = new Effect(
              card,
              trueIndex,
              latestTargets[0].side,
              card.effects.requirements
            )
            clone.unshift(newEffect)
          }
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

        // queue onEliminated of targets
        latestTargets.filter(target => {
          const card = target.deck[target.index]
          if (card.effects.event === "onEliminated") {
          const newEffect = new Effect(
            target.deck[target.index],
            target.index,
            target.side,
            target.deck[target.index].effects.requirements
          )
          clone.unshift(newEffect)
          }

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
        let { ownDeck, oppDeck, newTargets } = processEffect(inQueue[0], player, enemy, "enemy", latestTargets)
        if (inQueue[0].card.effects.event === "onAttack" && inQueue[0].card.effects.type !== "swap") {
          newTargets = arrayUnion(newTargets, latestTargets, "index")
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
        let { ownDeck, oppDeck, newTargets } = processEffect(inQueue[0], enemy, player, "player", latestTargets)
        if (inQueue[0].card.effects.event === "onAttack") {
          newTargets = _.union(latestTargets, newTargets)
        }

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
        const  last = clone.shift()
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

      fixEffectQueue: assign(({ effects: { inQueue, lastEffect }, flag: { latestTargets } }) => {
        inQueue.map(effect => {
          if (effect.side === latestTargets[0].side) {
            effect.index -= 1
          }
          return effect
        })
        return {
          effects: {
            inQueue,
            lastEffect
          }
        }
      }) 
    },
    guards: {
      isPlayersTurn: ({ isPlayersTurn }) => {
        return isPlayersTurn
      },
      effectProcessed: ({ effects: { lastEffect }}) => {
        return lastEffect.length > 0
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
        // console.log("isTargetEliminated")
        return latestTargets.some(target => {
          return target.deck[target.index].hitPoints === 0
        })
      },

      isCardInPlayersDeck: ({ effects: { inQueue } }) => {
        return inQueue[0].side === 'player'
      },
      isCardInEnemysDeck: ({ effects: { inQueue } }) => {
        return inQueue[0].side === 'enemy'
      },

      deckHasOnAttack: ({ flag: { latestCauses } }) => {
        const deck = latestCauses[0].deck
        return deck.some(card => card.effects.event === "onAllyAttack") || deck[latestCauses[0].index].effects.event === "onAttack"
      },
      cardHasOnAttack: ({ flag: { latestCauses } }) => {
        const card = latestCauses[0].deck[latestCauses[0].index]
        return card.effects.event === "onAttack"
      },
      
      deckHasOnAllyHit: ({ flag: { latestTargets } }) => {
        const deck = latestTargets[0].deck
        return deck.some(card => card.effects.event === "onAllyHit")
      },
      cardHasOnHit: ({ flag: { latestTargets } }) => {
        return latestTargets.some(obj => obj.deck[obj.index].effects.event === "onHit")
      },
      deckHasOnAllyEliminated: ({ flag: { latestTargets } }) => {
        const deck = latestTargets[0].deck
        return deck.some(card => card.effects.event === "onAllyEliminated")
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
        return lastEffect.card.effects.type === "attack" || lastEffect.card.effects.event === "onAttack" || lastEffect.card.effects.event === "onAllyAttack" 
      },
      effectEliminates: ({ effects: { lastEffect } }) => {
        return lastEffect.card.effects.type === "eliminate" || lastEffect.card.effects.event === "onEliminated"
      },

      isGameOver: ({ entities: { player, enemy }}) => {
        return player.length === 0 || enemy.length === 0
      }
    },
  }
);
