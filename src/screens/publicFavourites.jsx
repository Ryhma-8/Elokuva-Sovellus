import { useParams } from "react-router-dom";
import FavouriteList from "../components/favouriteList";

export default function PublicFavorites() {
  const { userId } = useParams();
  return (
  <FavouriteList userId={userId} />
  )
}