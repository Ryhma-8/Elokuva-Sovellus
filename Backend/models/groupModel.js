import { pool } from '../helpers/db.js'

const isGroupOwner = async(groupId, userId) => {
    const res = await pool.query('SELECT owner_id FROM "Group" WHERE id = $1', [groupId])
    return res.rows[0]?.owner_id === userId
}


const groupExists = async(groupId) => {
    return pool.query('SELECT * FROM "Group" where id=$1', [groupId])
}

const alreadyInGroup = async (userId, groupId) => {
    if (isGroupOwner(userId, groupId)) return true
    const member = pool.query('SELECT * FROM "Group_members" where account_id = $1 and group_id = $2',[userId, groupId])
    if (member.rows.length) return true
    const alreadyRequested = pool.query('SELECT * FROM "Group_requests" where account_id = $1 and group_id = $2',[userId, groupId])
    if (alreadyRequested) return true
    return false
}


const createGroup = async (name, ownerId, memberEmails = []) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const groupQuery = await client.query('INSERT INTO public."Group" (name,owner_id) VALUES ($1, $2) RETURNING id',[name,ownerId])
        const groupId = groupQuery.rows[0].id
        await client.query('INSERT INTO public."Group_members" (account_id, group_id) VALUES ($1, $2)', [ownerId, groupId])
        let memberIds = []
        for (const memberEmail of memberEmails){
            const res = await client.query('SELECT id FROM "Account" WHERE email = ($1)', [memberEmail])
            if (res.rows[0]) memberIds.push(res.rows[0].id)
        }
        
        const members = [...new Set(memberIds)].filter(id => id !== ownerId);
        
        if (members.length){
            for (const member of members){
                await client.query('INSERT INTO public."Group_requests" (group_id, account_id, requested_by, request_type, status) VALUES ($1, $2, $3, $4, $5)',
                    [groupId, member, ownerId, 'invitation', 'pending'])
                }
            }
        await client.query('COMMIT')
        return {
            id: groupId,
            name,
            ownerId,
            invitedMembers: members
        }

    } catch (err) {
        await client.query('ROLLBACK')
        console.log(err) 
    }
    finally {
        client.release()
    }
    
}

const allGroups = async () => {
    return pool.query(`
        SELECT "Group".id,
        "Group".name,
        COUNT(account_id)
        FROM "Group" LEFT JOIN "Group_members"
        on "Group".id = "Group_members".group_id
        Group BY "Group".name, "Group".id;`)

}

//muuta ehkä jopa kantaan tuo join_requested -> requested
const usersGroups = async (userId) => {
  return pool.query(
    `
    WITH user_groups AS (
        SELECT g.id AS group_id,
            g.name AS group_name,
            CASE
                WHEN g.owner_id = $1 THEN 'owner'
                WHEN gm_self.account_id IS NOT NULL THEN 'member'
                WHEN gr_self.account_id IS NOT NULL AND gr_self.request_type = 'invitation' THEN 'invited'
                WHEN gr_self.account_id IS NOT NULL AND gr_self.request_type = 'join_request' THEN 'join_requested'
            END AS user_role
        FROM "Group" g
        LEFT JOIN "Group_members" gm_self
            ON g.id = gm_self.group_id AND gm_self.account_id = $1
        LEFT JOIN "Group_requests" gr_self
            ON g.id = gr_self.group_id 
            AND gr_self.account_id = $1
            AND gr_self.status = 'pending'
            AND gr_self.request_type IN ('invitation', 'join_request')
        WHERE g.owner_id = $1 
        OR gm_self.account_id = $1 
        OR gr_self.account_id = $1
    ),
    group_members AS (
        SELECT gm.group_id, a.username, 'joined' AS member_status
        FROM "Group_members" gm
        JOIN "Account" a ON gm.account_id = a.id

        UNION ALL

        SELECT gr.group_id, a.username, 'invited' AS member_status
        FROM "Group_requests" gr
        JOIN "Account" a ON gr.account_id = a.id
        WHERE gr.status = 'pending' AND gr.request_type IN ('invitation', 'join_request')
    )
    SELECT ug.group_id,
        ug.group_name,
        ug.user_role,
        gm.username AS member_name,
        gm.member_status
    FROM user_groups ug
    LEFT JOIN group_members gm ON ug.group_id = gm.group_id
    ORDER BY ug.group_id, gm.username;
`, [userId]);
};


const groupJoinRequest = async (userId, groupId) => {
    return pool.query(`
    INSERT INTO "Group_requests"
    (group_id, account_id, requested_by, request_type, status)
    VALUES ($2, $1, $1, 'join_request', 'pending') RETURNING *`,[userId, groupId])
}


const acceptJoinRequest = async (ownerId, groupId) => {

}

export {createGroup, allGroups, usersGroups, groupJoinRequest, acceptJoinRequest, isGroupOwner, groupExists, alreadyInGroup}