const EntityCard = ({ name, atk, hp, type }: { name: string, atk: number, hp: number, type: string}) => {
    return (
        <div className={` ${type === 'own' ? 'bg-blue-300' : 'bg-red-400'}  px-3 py-4`}>
            <div className="h-6"></div>
            <h1>{name}</h1>
            <div className="">
                <h1>ATK: {atk}</h1>
                <h1>HP: {hp}</h1>
            </div>
        </div>
    )
}

export default EntityCard;