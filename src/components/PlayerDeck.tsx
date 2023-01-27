import { IEntity } from "../interface";
import EntityCard from "./EntityCard";

const PlayerDeck = ({ playerEntityList }: { playerEntityList: IEntity[]}) => {
    return (
        <div className="flex gap-8 flex-wrap justify-center flex-row-reverse ml-auto">
            {playerEntityList.map((e: IEntity, index) => (
                <EntityCard
                    key={index}
                    name={e.name}
                    attackPoints={e.attackPoints}
                    hitPoints={e.hitPoints}
                    type='own'
                />
            ))}
        </div>
    )
}

export default PlayerDeck;