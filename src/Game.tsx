import { useState, useEffect } from "react";
import { useMachine } from "@xstate/react";
import gameMachine from "./Machines";
import { interpret } from "xstate";
import _ from "lodash";
import player from "./assets/entities/player";

interface IEntity {
  atk: number;
  hp: number;
  id: string;
}

function Game() {
  const [state, send] = useMachine(gameMachine);
  const [entityList, setEntities] = useState<IEntity[]>([]);

  // const service = interpret(gameMachine).onTransition((state) => {
  //   console.log(state.value);
  // });

  useEffect(() => {
    if (state.value != "Init") {
      if (
        ["PlayerAction", "NPCAction"].includes(
          _.values(state.value)[0] as string
        )
      ) {
        setTimeout(() => send("NEXT"), 1000);
      }
    }
    setEntities(_.values(state.context.entities));
  }, [state.value]);

  return (
    <div className="w-screen mx-auto mt-16 w-3/4">
      <div id="wrapper" className=" grid grid-cols-2 justify-items-center">
        {entityList &&
          entityList.map((ntt) => {
            if (ntt.hp >= 0)
              return (
                <div
                  key={ntt.id}
                  id={ntt.id}
                  className={`${
                    ntt.id == "player" ? "bg-blue-400" : "bg-red-400"
                  } text-white w-1/4 h-[25vh]`}
                >
                  <p>ATK: {ntt.atk}</p>
                  <p>HP: {ntt.hp}</p>
                  <p className="text-center text-lg mt-2">{ntt.id}</p>
                </div>
              );
          })}
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
