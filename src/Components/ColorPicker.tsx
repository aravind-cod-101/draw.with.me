import { FiDroplet } from 'react-icons/fi'

const ColorPicker = ({color, setColor}) => {
return (
    <div className='relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800'>
        <label className='relative px-3 py-2 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent'>
            <FiDroplet className="text-2xl text-white-700"/>
            <input className='absolute inset-0 w-full h-full opacity-0 cursor-pointer' type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
    </div>
)
}

export default ColorPicker