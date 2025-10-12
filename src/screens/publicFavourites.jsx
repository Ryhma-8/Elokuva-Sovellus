import { useParams } from "react-router-dom";
import FavouriteList from "../components/favouriteList";
import Header from "../components/header";
import Footer from "../components/footer";

export default function PublicFavorites() {
    const { userId } = useParams();

    return (
        <div>
    <Header/>
  <FavouriteList userId={userId} />
  <Footer/>
  </div>
    )
}