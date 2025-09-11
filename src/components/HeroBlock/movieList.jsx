import React from "react";

export default function MoviesList({movies}) {
    return (
        <table>
            <tbody>
            {movies?.map(movie => (
                <tr key={movie.id}><td><img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}/> {movie.title} {movie.release_date} Score {Math.round(movie.vote_average * 10) / 10}</td></tr>
            ))}
            </tbody>
        </table>
    )
}