import { pool } from "../helpers/db.js";

const registerUser = async (username, email, passwordHash) => {
    return pool.query('INSERT INTO "Account" (username, email, password) VALUES ($1, $2, $3) returning id, email', [username, email, passwordHash]);
}


export { registerUser };