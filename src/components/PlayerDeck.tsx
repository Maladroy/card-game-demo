import { IEntity } from "../interface";
import EntityCard from "./EntityCard";

const PlayerDeck = ({ playerEnityList }: { playerEnityList: IEntity[]}) => {
    return (
        <div className="flex gap-8 ml-auto">
            {playerEnityList.map((e: IEntity, index) => (
                <EntityCard
                    key={index}
                    name={e.name}
                    atk={e.atk}
                    hp={e.hp}
                    type='own'
                />
            ))}
        </div>
    )
}

export default PlayerDeck;