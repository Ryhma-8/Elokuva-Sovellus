import { pool } from "../helpers/db.js";

const registerUser = async (username, email, passwordHash) => {
    return pool.query('INSERT INTO "Account" (username, email, password) VALUES ($1, $2, $3) returning id, email', [username, email, passwordHash]);
}

const userExists = async (email) => {
    return pool.query('SELECT * FROM "Account" WHERE email = $1', [email]);
}

const getUserWithRefreshToken = async (refreshToken) => {
    return pool.query('SELECT * FROM "Account" WHERE refreshtoken = $1', [refreshToken]);
}

const insertRefreshToken = async (refreshToken, email) => {
    return pool.query('UPDATE "Account" SET refreshtoken = $1 WHERE email = $2', [refreshToken,email]);
}

const deleteRefreshToken = async(refreshToken) => {
    return pool.query('UPDATE "Account" SET refreshtoken = NULL WHERE refreshtoken = $1', [refreshToken])
}

const deleteUserByEmail = async (email) => {
    return pool.query('DELETE FROM "Account" WHERE email = $1', [email])
}


export { registerUser, userExists, getUserWithRefreshToken, insertRefreshToken, deleteRefreshToken, deleteUserByEmail };