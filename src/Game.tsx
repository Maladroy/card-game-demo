import { useState, useEffect } from "react";
import { useMachine } from "@xstate/react";
import gameMachine from "./gameMachine";
import _ from "lodash";
import { IEntity } from "./interface";
import PlayerDeck from "./components/PlayerDeck";
import EnemyDeck from "./components/EnemyDeck";

function Game() {
  const [state, send] = useMachine(gameMachine);
  const [playerEntityList, setPlayerEntityList] = useState<IEntity[]>([]);
  const [enemyEntityList, setEnemyEntityList] = useState<IEntity[]>([]);
  const [timelinePaused, setTimelinePaused] = useState(false);

  const toggleTimeline = () => {
    send("PREVIOUS");
    setTimelinePaused(preState => !preState)
  }

  const resetTimeLIne = () => {
    setTimelinePaused(false)
  }


  // render after every state changes
  useEffect(() => {
    // if (!timelinePaused && state.value != "Init") {
    //   if (
    //     ["PlayerAction", "EnemyAction","PlayerActionProcess","EnemyActionProcess"].includes(
    //       _.values(state.value)[0] as string
    //     )
    //   ) {
    //     setTimeout(() => send("NEXT"), 1000);
    //   }
    // }
    // console.log(state.value)

    //@ts-ignore
    setPlayerEntityList(_.values(state.context.entities.player));
    //@ts-ignore
    setEnemyEntityList(_.values(state.context.entities.enemy));
  }, [state.value, timelinePaused]);

  return (
    <div className="">
      <div className="mx-auto mt-16 w-full xl:w-3/4 mb-8">
        <div className="grid gap-4 xl:gap-[10rem] grid-cols-2 mb-12">
          <PlayerDeck key="Player" playerEntityList={playerEntityList} />
          <EnemyDeck key="Enemy" enemyEntityList={enemyEntityList} />
        </div>
        <div className="flex gap-6 justify-center">
          <button
            className="bg-yellow-500 block px-10 py-4 mt-10"
            onClick={() => {
              send("INPUT");
              resetTimeLIne()
            }}
          >
            {state.value === "Init" ? "Start" : "Restart"}
          </button>
        { state.value != "Init" && (
          <button
            className="bg-yellow-500 block px-10 py-4 mt-10"
            onClick={toggleTimeline}
          >
            {timelinePaused ? "Resume" : "Pause"}
          </button>
        )}
        </div>
      </div>
      <div className="bg-neutral-700 w-full h-[24rem]"></div>
    </div>
  );
}

export default Game;
