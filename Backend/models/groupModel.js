import { pool } from '../helpers/db.js'

const isGroupOwner = async (groupId, userId) => {
  const res = await pool.query('SELECT owner_id FROM "Group" WHERE id = $1', [groupId])
  return res.rows[0]?.owner_id === userId
}

const isGroupMember = async (groupId, userId) => {
  const res = await pool.query(
    'SELECT account_id FROM "Group_members" WHERE account_id = $1 AND group_id = $2',
    [userId, groupId]
  )
  return res.rows[0]?.account_id === userId
}

const groupExists = async (groupId) => {
  return pool.query('SELECT * FROM "Group" where id=$1', [groupId])
}

const alreadyInGroup = async (userId, groupId) => {
  if (await isGroupOwner(groupId, userId)) return true
  const member = await pool.query(
    'SELECT * FROM "Group_members" where account_id = $1 and group_id = $2',
    [userId, groupId]
  )
  if (member.rows.length) return true
  const alreadyRequested = await pool.query(
    'SELECT * FROM "Group_requests" where account_id = $1 and group_id = $2 and status != $3',
    [userId, groupId, 'rejected']
  )
  if (alreadyRequested.rows.length) return true
  return false
}

const groupNameAlreadyInUse = async (name) => {
  const dbGoupName = await pool.query('SELECT name FROM "Group" WHERE name=$1', [name])
  return dbGoupName.rows[0]
}

const groupFull = async (groupId) => {
  const result = await pool.query(
    'SELECT COUNT(account_id) >= 20 AS full FROM "Group_members" WHERE group_id = $1',
    [groupId]
  )
  return result.rows[0].full
}

const createGroup = async (name, ownerId, memberEmails = []) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const groupQuery = await client.query(
      'INSERT INTO public."Group" (name, owner_id) VALUES ($1, $2) RETURNING id',
      [name, ownerId]
    )
    const groupId = groupQuery.rows[0].id

    // Omistaja on aina myös jäsen
    await client.query(
      'INSERT INTO public."Group_members" (account_id, group_id) VALUES ($1, $2)',
      [ownerId, groupId]
    )

    // Poimitaan sähköposteista mahdolliset käyttäjä-ID:t
    let memberIds = []
    for (const memberEmail of memberEmails) {
      const res = await client.query('SELECT id FROM "Account" WHERE email = $1', [memberEmail])
      if (res.rows[0]) memberIds.push(res.rows[0].id)
    }

    // Ei duplikaatteja, eikä omistajaa kahdesti
    const members = [...new Set(memberIds)].filter((id) => id !== ownerId)

    if (members.length) {
      for (const member of members) {
        await client.query(
          'INSERT INTO public."Group_members" (account_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [member, groupId]
        )
      }
    }

    await client.query('COMMIT')

    return {
      id: groupId,
      name,
      ownerId,
      members,
    }
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    throw err
  } finally {
    client.release()
  }
}

const allGroups = async () => {
  return pool.query(`
     SELECT 
        g.id,
        g.name,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT a.username), NULL) AS member_names,
        COUNT(DISTINCT a.id) AS count
    FROM "Group" g
    LEFT JOIN (
        SELECT account_id, group_id FROM "Group_members"
        UNION ALL
        SELECT owner_id AS account_id, id AS group_id FROM "Group"
    ) gm ON gm.group_id = g.id
    LEFT JOIN "Account" a ON a.id = gm.account_id
    GROUP BY g.id, g.name
    ORDER BY g.id;
      `)
}

const usersGroups = async (userId) => {
  return pool.query(
    `
    WITH user_groups AS (
    SELECT 
        g.id AS group_id,
        g.name AS group_name,
        CASE
            WHEN g.owner_id = $1 THEN 'owner'
            WHEN gm_self.account_id IS NOT NULL THEN 'member'
            WHEN gr_self.account_id IS NOT NULL AND gr_self.request_type = 'invitation' THEN 'invited'
            WHEN gr_self.account_id IS NOT NULL AND gr_self.request_type = 'join_request' THEN 'requested'
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
        -- Kaikki hyväksytyt jäsenet
        SELECT gm.group_id, a.username, a.email AS member_email, 'joined' AS member_status
        FROM "Group_members" gm
        JOIN "Account" a ON gm.account_id = a.id

        UNION ALL

        -- Pending requestit
        SELECT gr.group_id, a.username, a.email AS member_email,
            CASE 
                WHEN gr.request_type = 'join_request' THEN 'requested'
                ELSE 'invited'
            END AS member_status
        FROM "Group_requests" gr
        JOIN "Account" a ON gr.account_id = a.id
        WHERE gr.status = 'pending'
          AND gr.request_type IN ('invitation', 'join_request')

        UNION ALL

        -- Owner
        SELECT g.id AS group_id, a.username, a.email AS member_email, 'owner' AS member_status
        FROM "Group" g
        JOIN "Account" a ON g.owner_id = a.id
    )

      SELECT 
        ug.group_id,
        ug.group_name,
        ug.user_role,
        gm.username AS member_name,
        gm.member_email,
        gm.member_status
      FROM user_groups ug
      LEFT JOIN group_members gm ON ug.group_id = gm.group_id
      ORDER BY ug.group_id, gm.username;

    `,
    [userId]
  );
};


const groupJoinRequest = async (userId, groupId) => {
  return pool.query(
    `
    INSERT INTO "Group_requests"
      (group_id, account_id, requested_by, request_type, status)
    VALUES
      ($2, $1, $1, 'join_request', 'pending')
    RETURNING *`,
    [userId, groupId]
  )
}

const acceptJoinRequest = async (userId, groupId, senderName) => {
  if (!(await isGroupOwner(groupId, userId))) return null

  const senderRes = await pool.query('SELECT id FROM "Account" WHERE username = $1', [senderName])
  if (!senderRes.rows.length) return null

  const senderId = senderRes.rows[0].id
  await pool.query(
    'UPDATE "Group_requests" SET status = $3 WHERE group_id = $1 AND requested_by = $2 AND status = $4',
    [groupId, senderId, 'accepted', 'pending']
  )
  return pool.query(
    'INSERT INTO "Group_members" (group_id, account_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [groupId, senderId]
  )
}

const rejectJoinRequest = async (userId, groupId, senderName) => {
  if (!(await isGroupOwner(groupId, userId))) return null

  const senderRes = await pool.query('SELECT id FROM "Account" WHERE username = $1', [senderName])
  if (!senderRes.rows.length) return null

  const senderId = senderRes.rows[0].id
  return pool.query(
    'UPDATE "Group_requests" SET status = $3 WHERE group_id = $1 AND requested_by = $2',
    [groupId, senderId, 'rejected']
  )
}

const kickFromGroup = async (groupId, ownerId, usersName) => {
  if (!(await isGroupOwner(groupId, ownerId))) return null

  const senderRes = await pool.query('SELECT id FROM "Account" WHERE username = $1', [usersName])
  if (!senderRes.rows.length) return null

  const senderId = senderRes.rows[0].id
  await pool.query('DELETE FROM "Group_requests" WHERE account_id = $1 AND group_id = $2', [
    senderId,
    groupId,
  ])

  return pool.query('DELETE FROM "Group_members" WHERE account_id = $1 AND group_id = $2', [
    senderId,
    groupId,
  ])
}

const leaveFromGroup = async (userId, groupId) => {
  const inGroup = await isGroupMember(groupId, userId)
  if (!inGroup) return null

  await pool.query('DELETE FROM "Group_requests" WHERE account_id = $1 AND group_id = $2', [
    userId,
    groupId,
  ])

  return pool.query('DELETE FROM "Group_members" WHERE account_id = $1 AND group_id = $2 RETURNING *', [
    userId,
    groupId,
  ])
}

const deleteGroup = async (userId, groupId) => {
  if (!(await isGroupOwner(groupId, userId))) return null

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await client.query('DELETE FROM "Group_members" WHERE group_id = $1', [groupId])
    await client.query('DELETE FROM "Group_requests" WHERE group_id = $1', [groupId])
    await client.query('DELETE FROM "Group_movies" WHERE group_id = $1', [groupId])
    await client.query('DELETE FROM "Presenting_times" WHERE group_id = $1', [groupId])

    await client.query('DELETE FROM "Group" WHERE id = $1', [groupId])

    await client.query('COMMIT')
    return true
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

const addMovie = async (userId, groupId, movieId) => {
  const inGroup = await isGroupMember(groupId, userId)
  if (!inGroup) {
    if (!(await isGroupOwner(groupId, userId))) return null
  }
  const movieAlreadyInGroup = await pool.query(
    'SELECT * FROM "Group_movies" WHERE movie_id = $1 AND group_id = $2',
    [movieId, groupId]
  )
  if (movieAlreadyInGroup.rows.length > 0) return 'Movie already in group'
  return pool.query(
    'INSERT INTO "Group_movies" (group_id, movie_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
    [groupId, movieId]
  )
}

/**
 * Lisää näytös ryhmään. Tallentaa samalla snapshotin (start, title, theatre, auditorium, image),
 * jos kentät annetaan. Snapshot helpottaa GroupPage-listausta ilman ulkoisia hakuja.
 */
const addShowTime = async (userId, groupId, showTimeId, snapshot = {}) => {
  const inGroup = await isGroupMember(groupId, userId)
  if (!inGroup) {
    if (!(await isGroupOwner(groupId, userId))) return null
  }

  // Estetään duplikaatit ennen inserttiä
  const existing = await pool.query(
    'SELECT 1 FROM "Presenting_times" WHERE presenting_times_id = $1 AND group_id = $2',
    [showTimeId, groupId]
  )
  if (existing.rows.length > 0) return 'Show time already in group'

  const { start = null, title = null, theatre = null, auditorium = null, image = null } = snapshot

  return pool.query(
    `INSERT INTO "Presenting_times"
       (group_id, presenting_times_id, start, title, theatre, auditorium, image)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [groupId, showTimeId, start, title, theatre, auditorium, image]
  )
}

const getMovies = async (userId, groupId) => {
  const inGroup = await isGroupMember(groupId, userId)
  if (!inGroup) {
    if (!(await isGroupOwner(groupId, userId))) return null
  }
  return pool.query('SELECT * FROM "Group_movies" WHERE group_id = $1', [groupId])
}

const getShowTimes = async (userId, groupId) => {
  const inGroup = await isGroupMember(groupId, userId)
  if (!inGroup) {
    if (!(await isGroupOwner(groupId, userId))) return null
  }
  // SELECT * tuo snapshot-kentät mukaan, jos ne on olemassa
  return pool.query('SELECT * FROM "Presenting_times" WHERE group_id = $1', [groupId])
}

const deleteMovie = async (userId, groupId, movieId) => {
  const inGroup = await isGroupMember(groupId, userId)
  if (!inGroup) {
    if (!(await isGroupOwner(groupId, userId))) return null
  }
  const res = await pool.query('DELETE FROM "Group_movies" WHERE movie_id = $1 AND group_id = $2', [
    movieId,
    groupId,
  ])
  return res.rowCount > 0
}

const deleteShowTime = async (userId, groupId, showTimeId) => {
  const inGroup = await isGroupMember(groupId, userId)
  if (!inGroup) {
    if (!(await isGroupOwner(groupId, userId))) return null
  }
  const res = await pool.query(
    'DELETE FROM "Presenting_times" WHERE presenting_times_id = $1 AND group_id = $2',
    [showTimeId, groupId]
  )
  return res.rowCount > 0
}

const getGroup = async (userId, groupId) => {
  const inGroup = await isGroupMember(groupId, userId)
  if (!inGroup) {
    if (!(await isGroupOwner(groupId, userId))) return null
  }
  return pool.query('SELECT * FROM "Group" WHERE id = $1', [groupId])
}

export {
  createGroup,
  allGroups,
  usersGroups,
  groupJoinRequest,
  acceptJoinRequest,
  isGroupOwner,
  groupExists,
  alreadyInGroup,
  groupNameAlreadyInUse,
  groupFull,
  rejectJoinRequest,
  kickFromGroup,
  leaveFromGroup,
  deleteGroup,
  addMovie,
  addShowTime,
  deleteMovie,
  deleteShowTime,
  getMovies,
  getShowTimes,
  getGroup,
}
