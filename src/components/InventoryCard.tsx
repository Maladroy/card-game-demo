import { useState, useEffect, useRef } from "react";
import { Card } from "../assets/entities";
import NumberedEquipButton from "./NumberedEquipButton";

const clickDetector = (ref: React.MutableRefObject<HTMLDivElement | null>, func: () => void) => {
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (ref.current && !ref.current.contains(event.target)) {
                func()
            }
        }
  
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
    },[ref])
}

const InventoryCard = ({ card, name, attackPoints, hitPoints, equipCard }
    : { card: Card, name: string, attackPoints: number, hitPoints: number, equipCard: (num: number, card: Card) => void}) => {
    const i = [5,4,3,2,1]
    const [popUpVisible, setPopUpVisible] = useState(false);
    const turnOffPopup = () => setPopUpVisible(false)
    const popupRef = useRef(null);
    clickDetector(popupRef, turnOffPopup)

    return (
        <div className="bg-yellow-regular relative twitch-hover h-fit">
            <div className="bg-neutral-800 w-[117px] h-[156px] relative flex flex-col items-center cursor-pointer transition-all z-10 card" 
                onClick={() => setPopUpVisible(prevState => !prevState)} ref={popupRef}>
                <div className="h-6"></div>
                <h1>{name}</h1>
                <div className="">
                    <h1>ATK: {attackPoints}</h1>
                    <h1>HP: {hitPoints}</h1>
                </div>
            </div>
            <div className={`${popUpVisible ? "flex" : "hidden"} bg-neutral-800 transition-all
                    absolute bottom-1/2 right-1/2 translate-y-[100%] translate-x-1/2 z-20 gap-2 p-4 border-2 border-white`}
                        ref={popupRef}>
                    {i.map(num => 
                        <NumberedEquipButton
                            key={num}
                            num={num}
                            func={()=> equipCard(num, card)}
                        />
                    )}
            </div>
        </div>

    )
}

export default InventoryCard;