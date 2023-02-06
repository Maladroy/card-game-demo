const InventoryCard = ({ name, attackPoints, hitPoints }
    : { name: string, attackPoints: number, hitPoints: number}) => {
    return (
        <div className="bg-yellow-500  px-3 py-4 max-h-[10rem]">
            <div className="h-6"></div>
            <h1>{name}</h1>
            <div className="">
                <h1>ATK: {attackPoints}</h1>
                <h1>HP: {hitPoints}</h1>
            </div>
        </div>
    )
}

export default InventoryCard;