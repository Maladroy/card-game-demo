import { useState, useEffect } from "react";
import { useMachine } from "@xstate/react";
import gameMachine from "./Machines";
import _ from "lodash";
import { IEntity } from "./interface";
import PlayerDeck from "./components/PlayerDeck";
import EnemyDeck from "./components/EnemyDeck";

function Game() {
  const [state, send] = useMachine(gameMachine);
  const [playerEntityList, setPlayerEntityList] = useState<IEntity[]>([]);
  const [enemyEntityList, setEnemyEntityList] = useState<IEntity[]>([]);

  // render after every state changes
  useEffect(() => {
    //@ts-ignore
    setPlayerEntityList(_.values(state.context.entities.player));
    //@ts-ignore
    setEnemyEntityList(_.values(state.context.entities.enemy));
  }, [state.value]);

  return (
    <div className="mx-auto mt-16 w-3/4">
      <div className="grid gap-[10rem] grid-cols-2 mb-12">
        <PlayerDeck key="Player" playerEntityList={playerEntityList} />
        <EnemyDeck key="Enemy" enemyEntityList={enemyEntityList} />
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
