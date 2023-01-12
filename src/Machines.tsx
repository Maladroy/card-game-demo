import { createMachine, assign } from "xstate";
import player from "./assets/entities/player";
import npc from "./assets/entities/npc";
export default createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    id: "gameMachine",
    initial: "Init",
    context: {
      entities: { player, npc },
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
            entry: ["fightNPC"],
            on: {
              NEXT: {
                target: "PlayerActionProcess",
              },
            },
          },
          PlayerActionProcess: {
            always: [
              { target: "#gameMachine.GameEnd", cond: "didPlayerWin" },
              { target: "NPCAction", cond: "isPlayerAlive" },
            ],
          },
          NPCAction: {
            entry: ["fightPlayer"],
            on: {
              NEXT: {
                target: "NPCActionProcess",
              },
            },
          },
          NPCActionProcess: {
            always: [
              { target: "#gameMachine.GameEnd", cond: "didNPCWin" },
              { target: "PlayerAction", cond: "isNPCAlive" },
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
      fightNPC: (context: any, event) => {
        let player = context.entities.player;
        let npc = context.entities.npc;
        npc.hp -= player.atk;
        console.log(`Player deal ${player.atk} damage to NPC!`);
      },
      fightPlayer: (context, event) => {
        let player = context.entities.player;
        let npc = context.entities.npc;
        player.hp -= npc.atk;
        console.log(`NPC deal ${npc.atk} to NPC!`);
      },
      logger: (context, event) => {
        console.log("state: ", context);
      },
    },
    guards: {
      didPlayerWin: (context, event) => {
        // check if player won
        if (context.entities.npc.hp <= 0) {
          console.log("Player won!");
          return true;
        }
        return false;
      },
      isPlayerAlive: (context, event) => {
        // check if player alive
        return context.entities.player.hp > 0;
      },
      didNPCWin: (context, event) => {
        // check if npc won
        if (context.entities.player.hp <= 0) {
          console.log("NPC won!");
          return true;
        }
        return false;
      },
      isNPCAlive: (context, event) => {
        // check if npc alive
        return context.entities.npc.hp > 0;
      },
    },
  }
);
