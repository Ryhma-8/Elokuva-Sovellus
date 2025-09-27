import "../../css/HeroBlock.css"

export default function SearchBar({movieName, setMovieName, placeholder, onSearch, onKeyPress}) {

    return (
    <div className="search-container">
        <div className="search-bar">
          <div className="input-group">
            <input
            type="text"
            className="form-control" 
            aria-label="Search"
            aria-describedby="search-addon"
            placeholder={placeholder}
            value={movieName}
            onChange={(e) => setMovieName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
            e.preventDefault();
            onKeyPress();
            }
            }}
            />
            <button className="btn btn-outline-secondary"  id="search-addon" onClick={onSearch}>
                    <i className="fas fa-search"></i>
                </button>
            </div>
        </div>
    </div>
  );
}


