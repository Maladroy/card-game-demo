const NumberedEquipButton = ({ num, func }: { num: number, func: () => void }) => (
    <button className="bg-yellow-500 px-4 py-2" onClick={func}>
        {num}
    </button>
)

export default NumberedEquipButton