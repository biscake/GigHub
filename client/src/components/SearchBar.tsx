import type { SearchBarProp } from "../types/inputProps"

export const SearchBar = ({ placeholder, handleSearch } : SearchBarProp) => {
  return (
    <div className="w-full flex flex-col items-start p-4 border-b border-white/50">
      <input 
        placeholder={ placeholder } 
        onChange={ (e) => { handleSearch(e.target.value) } }
        className="w-1/2 focus:outline-none overflow-x-auto"
      />
    </div>
  )
}