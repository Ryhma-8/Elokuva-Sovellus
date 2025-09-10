export default function SearchBar({movieName, setMovieName, placeholder, onSearch, onKeyPress}) {
    
    return (
        <div className="search-bar">
            <input type="text"
             placeholder={placeholder}
             onKeyDown ={e =>  {if (e.key === "Enter"){
                 e.preventDefault();
                 onKeyPress()
                }}}
             value={movieName}
             onChange={(e) => setMovieName(e.target.value)}
            />
            <button onClick={onSearch}>Search</button>
        </div>
    )
}