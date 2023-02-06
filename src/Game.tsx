import { useState, useEffect } from "react";
import { useMachine } from "@xstate/react";
import gameMachine from "./gameMachine";
import _ from "lodash";
import { IEntity } from "./interface";
import PlayerDeck from "./components/PlayerDeck";
import EnemyDeck from "./components/EnemyDeck";
import { cardList } from "./assets/entities";
import InventoryCard from "./components/InventoryCard";

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
            }}
          >
            {state.value === "Init" ? "Start" : "Restart"}
          </button>
        </div>
      </div>
      <div className="bg-neutral-700 w-full h-[24rem] p-6 flex gap-8 flex-wrap">
        {cardList.map(card => 
          <InventoryCard
            key={card.cardId}
            name={card.name}
            attackPoints={card.attackPoints}
            hitPoints={card.hitPoints}
          />  
        )}
      </div>
    </div>
  );
}

export { Game };
