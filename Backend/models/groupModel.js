import { pool } from '../helpers/db.js'

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


const usersGroups = async (id) => {
  return pool.query(
    `
    SELECT 
      g.id AS group_id,
      g.name AS group_name,
      CASE
    WHEN g.owner_id = $1 THEN 'owner'
          WHEN gm.account_id IS NOT NULL THEN 'member'
          WHEN gr.account_id IS NOT NULL AND gr.status = 'pending' AND gr.request_type = 'invitation' THEN 'invited'
      END AS role,
      COALESCE(a.username, a_invited.username) AS member_name,
      CASE 
          WHEN gm_all.account_id IS NOT NULL THEN 'joined'
          ELSE 'invited'
      END AS member_status
        FROM "Group" g
        LEFT JOIN "Group_members" gm_self 
            ON g.id = gm_self.group_id AND gm_self.account_id = $1
        LEFT JOIN "Group_requests" gr_self
            ON g.id = gr_self.group_id AND gr_self.account_id = $1 AND gr_self.status = 'pending'

        LEFT JOIN "Group_members" gm_all 
            ON g.id = gm_all.group_id
        LEFT JOIN "Account" a 
            ON gm_all.account_id = a.id

        LEFT JOIN "Group_requests" gr_all
            ON g.id = gr_all.group_id AND gr_all.status = 'pending' AND gr_all.request_type = 'invitation'
        LEFT JOIN "Account" a_invited
            ON gr_all.account_id = a_invited.id

            WHERE g.owner_id = $1 OR gm_self.account_id = $1 OR gr_self.account_id = $1
            ORDER BY g.id, member_name
            `, [id]);
};


export {createGroup, allGroups, usersGroups}