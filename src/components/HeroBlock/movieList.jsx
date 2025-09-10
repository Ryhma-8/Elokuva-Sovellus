import React from "react";

export default function MoviesList({movies}) {
    return (
        <table>
            <tbody>
            {movies && movies.map(movie => (
                <tr key={movie.id}><td>{movie.title}</td></tr>
            ))}
            </tbody>
        </table>
    )
}