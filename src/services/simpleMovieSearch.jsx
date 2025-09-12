import axios from "axios";

export default async function movieSearch(promps,page=1) {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie?query=${promps}&include_adult=false&language=en-US&page=${page}]`,{
            headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_TMBD_API_KEY}`,
            "Content-Type" : "application/json"
            }
            }
        )
        return response.data.results
    }
    catch (error){
        console.log(error)
    }
}