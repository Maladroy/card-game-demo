const EntityCard = ({ name, attackPoints, hitPoints, type }: { name: string, attackPoints: number, hitPoints: number, type: string}) => {
    return (
        <div className={` ${type === 'own' ? 'bg-blue-500' : 'bg-red-500'}  px-3 py-4 max-h-[10rem]`}>
            <div className="h-6"></div>
            <h1>{name}</h1>
            <div className="">
                <h1>ATK: {attackPoints}</h1>
                <h1>HP: {hitPoints}</h1>
            </div>
        </div>
    )
}

export default EntityCard;