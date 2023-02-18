import { IEntity } from "../interface";
import EmptySlot from "./EmptySlot";
import EntityCard from "./EntityCard";

const UsersDeck = ({ UsersCardList }: { UsersCardList: IEntity[]}) => {
    return (
        <div className="w-full flex gap-8 flex-wrap justify-center flex-row-reverse">
          {UsersCardList.map((card, index) => {
              if (card.name) {
                return <EntityCard
                  key={index}
                  name={card.name}
                  attackPoints={card.attackPoints}
                  hitPoints={card.hitPoints}
                  type="none"
                />
              }
              return <EmptySlot key={index}/>
            }

          )}
        </div>
    )
}

export default UsersDeck;