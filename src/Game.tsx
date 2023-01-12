import { useState, useEffect } from "react";
import { useMachine } from "@xstate/react";
import gameMachine from "./Machines";
import _ from "lodash";
import { IEntity } from "./interface";
import PlayerDeck from "./components/PlayerDeck";
import EnemyDeck from "./components/EnemyDeck";


function Game() {
  const [state, send] = useMachine(gameMachine);
  const [playerEnityList, setPlayerEntityList] = useState<IEntity[]>([]);
  const [enemyEnityList, setEnemyEntityList] = useState<IEntity[]>([]);


  // const service = interpret(gameMachine).onTransition((state) => {
  //   console.log(state.value);
  // });

  useEffect(() => {
    if (state.value != "Init") {
      if (
        ["PlayerAction", "EnemyAction"].includes(
          _.values(state.value)[0] as string
        )
      ) {
        setTimeout(() => send("NEXT"), 1000);
      }
    }
    setPlayerEntityList(_.values(state.context.entities.player));
    setEnemyEntityList(_.values(state.context.entities.enemy));
  }, [state.value]);

  return (
    <div className="mx-auto mt-16 w-3/4">
        <div className="grid gap-[10rem] grid-cols-2 mb-12">
          <PlayerDeck 
            key="Player"
            playerEnityList={playerEnityList}
          />
          <EnemyDeck 
            key="Enemy"
            enemyEnityList={enemyEnityList}
          />
        </div>
      <button
        className="bg-yellow-500 block px-10 py-4 mt-10 mx-auto"
        onClick={() => {
          send("INPUT");
        }}
      >
        Start
      </button>
    </div>
  );
}

export default Game;
