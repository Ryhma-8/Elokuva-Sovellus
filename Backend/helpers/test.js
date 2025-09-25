import fs from "fs"
import path from "path"
import {pool} from "./db.js"
import { hash } from "bcrypt"
import jwt from "jsonwebtoken"

const __dirname=import.meta.dirname

const initializeTestDb = async () => {
    try {
        const sql= fs.readFileSync(path.resolve(__dirname, "../test.sql"),"utf8")
        await pool.query(sql)
        console.log("Test database initialized")
    } catch (err) {
        console.error("Error initalizing test database",err)
        throw err
    }
}

const insertTestUser = (user) => {
  return new Promise((resolve, reject) => {
    hash(user.password, 10, (err, hashedPassword) => {
      if (err) return reject(err);
      pool.query(
        'INSERT INTO "Account" (username, email, password) VALUES ($1, $2, $3) RETURNING id',
        [user.username, user.email, hashedPassword],
        (err, result) => {
          if (err) return reject(err);
          console.log("Test user inserted successfully");
          resolve(result.rows[0]);
        }
      );
    });
  });
};

const getToken = (email) => {
    return jwt.sign({email}, process.env.JWT_SECRET_KEY,{expiresIn: "2m"})
}



export {initializeTestDb, insertTestUser, getToken}