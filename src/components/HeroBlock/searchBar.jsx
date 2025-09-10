import { useState } from "react"

export default function SearchBar({movieName, setMovieName, placeholder, onSearch}) {
    
    return (
        <div className="search-bar">
            <input type="text"
             placeholder={placeholder}
             value={movieName}
             onChange={(e) => setMovieName(e.target.value)}
            />
            <button onClick={onSearch}>Search</button>
        </div>
    )
}