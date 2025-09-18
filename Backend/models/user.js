import { pool } from "../helpers/db.js";

const registerUser = async (username, email, passwordHash) => {
    return pool.query('INSERT INTO "Account" (username, email, password) VALUES ($1, $2, $3) returning id, email', [username, email, passwordHash]);
}

const userExists = async (email) => {
    return pool.query('SELECT * FROM "Account" WHERE email = $1', [email]);
}




export { registerUser, userExists };