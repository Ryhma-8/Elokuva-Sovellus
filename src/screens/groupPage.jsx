import Header from "../components/header";
import Footer from "../components/footer";
import "../css/groupPage.css";
import MoviesList from "../components/HeroBlock/movieList";
import SearchBar from "../components/HeroBlock/searchBar";
import { useEffect, useState, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import movieSearch from "../services/simpleMovieSearch";
import FavouriteList from "../components/FavouriteList";
import GroupShowtimesSection from "../components/group/GroupShowtimesSection.jsx";
import { useParams, useLocation } from "react-router-dom";

export default function GroupPage() {
  const [movieName, setMovieName] = useState("Dune");
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const location = useLocation();
  const params = useParams();

  // Ensisijaisesti URL-paramista, tarvittaessa fallback statesta
  const groupId = params.groupId || location.state?.groupId;

  useEffect(() => {
    fetchMovies(movieName, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hakee elokuvat nimellä ja sivulla, sivu lasketaan infinite scrollissa
  const fetchMovies = async (name, pageToLoad) => {
    const { results, totalPages } = await movieSearch(name, pageToLoad);
    if (pageToLoad === 1) {
      setMovies(results);
    } else {
      setMovies((prev) => [...prev, ...results]);
    }
    setPage(pageToLoad);
    setTotalPages(totalPages);
  };

  const scrollRef = useRef(null);

  // Hakunappi resetoi scrollauksen ja aloittaa haun alusta
  const handleSearch = () => {
    if (!movieName.trim()) return;
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    fetchMovies(movieName, 1);
  };

  return (
    <>
      <Header />
      <div className="hero-block">
        <div className="hero-search">
          <h3 className="hero-title">Search for movies</h3>
          <SearchBar
            setMovieName={setMovieName}
            movieName={movieName}
            placeholder="Search"
            onSearch={handleSearch}
            onKeyPress={handleSearch}
          />
        </div>

        <div className="hero-results" id="hero-results" ref={scrollRef}>
          <InfiniteScroll
            key={movieName}
            dataLength={movies.length}
            next={() => fetchMovies(movieName, page + 1)}
            hasMore={page < totalPages}
            scrollableTarget="hero-results"
          >
            <MoviesList movies={movies} groupId={groupId} />
          </InfiniteScroll>
        </div>
      </div>
      {groupId && <GroupShowtimesSection groupId={Number(groupId)} />}
      <FavouriteList groupId={groupId} />
      <Footer />
    </>
  );
}
