import { useState, useEffect } from "react";
import { useMachine } from "@xstate/react";
import gameMachine from "./gameMachine";
import _ from "lodash";
import { IEntity } from "./interface";
import PlayerDeck from "./components/PlayerDeck";
import EnemyDeck from "./components/EnemyDeck";
import { Card, cardList } from "./assets/entities";
import InventoryCard from "./components/InventoryCard";
import UsersDeck from "./components/UsersDeck";


function Game() {
  const [state, send] = useMachine(gameMachine);
  const [playerEntityList, setPlayerEntityList] = useState<IEntity[]>([]);
  const [enemyEntityList, setEnemyEntityList] = useState<IEntity[]>([]);
  const [usersCardList, setUsersCardList] = useState<Card[] | any[]>([{},{},{},{},{}])

  const equipCard = (num: number, card: Card) => {
    console.log(num, card.name)
    setUsersCardList(prevList => {
      prevList[num-1] = card
      return [...prevList]
    })
  }

  // render after every state changes
  useEffect(() => {
    //@ts-ignore
    setPlayerEntityList(_.values(state.context.entities.player));
    //@ts-ignore
    setEnemyEntityList(_.values(state.context.entities.enemy));
  }, [state.value]);

  return (
    <div className="">
      <div className="mx-auto w-full">
        {state.value !== "Idle" ?
          <div className="">
            <div className="grid gap-4 xl:gap-[10rem] grid-cols-2">
              <PlayerDeck key="Player" playerEntityList={playerEntityList} />
              <EnemyDeck key="Enemy" enemyEntityList={enemyEntityList} />
            </div>
            <div className="flex gap-6 justify-center mb-8">
              <button
                className="bg-yellow-500 block px-10 py-4 mt-10"
                onClick={() => {
                  send("INPUT");
                }}
              >
                {state.value === "Idle" ? "Start" : "Restart"}
              </button>
            </div>
          </div> 
          :
          <div className="">
            <div className="flex pt-[4.5rem] pb-[5.75rem] px-8 bg-neutral-400">
              <UsersDeck key="UsersDeck" UsersCardList={usersCardList}/>
              <button
                className="bg-yellow-500 block px-10 py-4 mt-10 h-fit"
                onClick={() => {
                  send("INPUT");
                }}
              >
                {state.value === "Idle" ? "Start" : "Restart"}
              </button>
            </div>

            <div className="bg-neutral-700 w-full p-6 flex gap-8 flex-wrap mt-auto">
              {cardList.map(card => 
                <InventoryCard
                  key={card.cardId}
                  card={card}
                  name={card.name}
                  attackPoints={card.attackPoints}
                  hitPoints={card.hitPoints}
                  equipCard={equipCard}
                />  
              )}
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export { Game };
