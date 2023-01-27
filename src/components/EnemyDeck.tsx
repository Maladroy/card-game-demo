import { IEntity } from "../interface";
import EntityCard from "./EntityCard";

const EnemyDeck = ({ enemyEntityList }: { enemyEntityList: IEntity[]}) => {
    return (
        <div className="flex gap-8 flex-wrap justify-center">
            {enemyEntityList.map((e: IEntity, index) => (
                <EntityCard
                    key={index}
                    name={e.name}
                    attackPoints={e.attackPoints}
                    hitPoints={e.hitPoints}
                    type='enemy'
                />
            ))}
        </div>
    )
}

export default EnemyDeck;