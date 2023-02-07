import { IEntity } from "../interface";
import EntityCard from "./EntityCard";

const UsersDeck = ({ UsersCardList }: { UsersCardList: IEntity[]}) => {
    return (
        <div className="bg-neutral-500 w-full px-16 py-8 flex gap-8 justify-center flex-row-reverse">
          {UsersCardList.map((card, index) => 
            <EntityCard
              key={index}
              name={card.name}
              attackPoints={card.attackPoints}
              hitPoints={card.hitPoints}
              type="own"
            />  
          )}
        </div>
    )
}

export default UsersDeck;