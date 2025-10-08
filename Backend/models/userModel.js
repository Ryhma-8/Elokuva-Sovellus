import { pool } from "../helpers/db.js";
import { deleteGroup, leaveFromGroup } from "./groupModel.js"; // ryhmänpoisto täältä

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

// poistaa käyttäjän ja siihen liittyvät tiedot
const deleteUserCompletely = async (email) => {
    const client = await pool.connect()

    try {
        // transaktion aloitus, jos jotain menee pieleen niin kaikki perutaan (ROLLBACK)
        await client.query('BEGIN')

        const { rows } = await client.query('SELECT id FROM "Account" WHERE email = $1', [email])
        if (rows.length === 0) {
            await client.query('ROLLBACK')
            return null
        }
        const accountId = rows[0].id


        //hakee käyttäjän omat ryhmät ja missä on itse jäsenenä
        const { rows: ownedGroups } = await client.query('SELECT id FROM "Group" WHERE owner_id = $1', [accountId])

        //poistaa käyttäjän omistaman ryhmän
        for (const group of ownedGroups) {
            await deleteGroup(accountId, group.id)
        }

        const { rows: groupMember } = await client.query('SELECT group_id FROM "Group_members" WHERE account_id = $1', [accountId])
        
        // poistuu ryhmästä missä on jäsenenä
        for (const membership of groupMember) {
            await leaveFromGroup(accountId, membership.group_id)
        }
        
        // poistaa suosikkileffat ja jätetyt arvostelut
        await client.query('DELETE FROM "Favorites" WHERE account_id = $1', [accountId])
        await client.query('DELETE FROM "Reviews" WHERE account_id = $1', [accountId])

        // lopuksi poistaa käyttäjän
        await client.query('DELETE FROM "Account" WHERE id = $1', [accountId])

        await client.query('COMMIT')
        console.log(`User ${email} and related data deleted successfully`)
        return true

    } catch (err) {
        await client.query('ROLLBACK')
        console.error("Error deleting user completely:", err)
        throw err
    } finally {
        client.release()
    }
}


export { registerUser, userExists, getUserWithRefreshToken, insertRefreshToken, deleteRefreshToken, deleteUserCompletely };