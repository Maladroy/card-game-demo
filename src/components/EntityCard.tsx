const EntityCard = ({ name, attackPoints, hitPoints, type }: { name: string, attackPoints: number, hitPoints: number, type: string}) => {
    return (
        <div className="bg-yellow-regular relative inline-block twitch-hover h-fit">
            <div className={`bg-neutral-800 ${type === "none" ? "w-[209px] h-[292px]" : "w-[117px] h-[156px]"}  
                px-2 pt-4 pb-3 flex flex-col items-center translate-x-0 translate-y-0 transition-all relative z-10 card`}>
                <div className="h-6"></div>
                <h1>{name}</h1>
                <div className="">
                    <h1>ATK: {attackPoints}</h1>
                    <h1>HP: {hitPoints}</h1>
                </div>
            </div>
        </div>

    )
}

export default EntityCard;