import { useParams } from "react-router-dom";
import FavouriteList from "../components/favouriteList";
import Header from "../components/header";
import Footer from "../components/footer";
import { useSearchParams } from "react-router-dom";

export default function PublicFavorites() {
    const { userId } = useParams();
    const [searchParams] = useSearchParams();
    const usernameFromUrl = searchParams.get("username");

    
    return (
        <div>
    <Header/>
  <FavouriteList userId={userId} />
  <Footer/>
  </div>
    )
}