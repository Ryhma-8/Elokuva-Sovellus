import "../../css/HeroBlock.css"

export default function SearchBar({movieName, setMovieName, placeholder, onSearch, onKeyPress}) {

    return (
    <div className="search-bar input-group">
      <span className="input-group-text">
        <i className="fas fa-search"></i>
      </span>
      <input
        type="text"
        className="form-control"
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
      <button className="btn btn-outline-light" onClick={onSearch}>
        SEARCH
      </button>
    </div>
  );
}