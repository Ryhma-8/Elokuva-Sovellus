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

export {createGroup}