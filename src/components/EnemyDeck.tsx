import { IEntity } from "../interface";
import EntityCard from "./EntityCard";

const EnemyDeck = ({ enemyEnityList }: { enemyEnityList: IEntity[]}) => {
    return (
        <div className="flex gap-8">
            {enemyEnityList.map((e: IEntity, index) => (
                <EntityCard
                    key={index}
                    name={e.name}
                    atk={e.atk}
                    hp={e.hp}
                    type='enemy'
                />
            ))}
        </div>
    )
}

export default EnemyDeck;