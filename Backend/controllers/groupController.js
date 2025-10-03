import { ApiError } from '../helpers/apiErrorClass.js'
import { createGroup, allGroups, usersGroups } from '../models/groupModel.js'
import { userExists } from '../models/userModel.js'


//lisää tarkistus onko nimi jo käytössä ja palauta siitä virhe jos on
const makeNewGroup = async(req,res,next) => {
    const grouName = req.body.groupName
    const owner = await userExists(req.user?.user)
    const ownerId = owner.rows[0].id
    if (!grouName || !ownerId) return next (new ApiError("No group name or owner", 400))
    const membersList = req.body.memberEmails
    if (membersList.length > 20) return next (new ApiError("Maximum of 5 members", 400)) // fronttiin kanssa maksimi rajaksi 20

    try {
        const group = await createGroup(grouName, ownerId, membersList)
        return res.status(201).json(group)
    }
    catch (err) {
        return next(new ApiError(err, 400))
    }
}

const getAllGroups = async(req,res,next) => {
    try {
        const result = await allGroups()
        const groupsData = result.rows
        console.log(groupsData)
        return res.status(200).json(groupsData)

    } catch (err) {
        return next(new ApiError(`error getting groups data: ${err}`, 404))
    }
    
}

const getUsersGroups = async (req,res,next) => {
    try {
        const user = await userExists(req.user?.user)
        if (!user.rows.length) return next (new ApiError("User does not exist", 404))
        const userId = user.rows[0].id
        console.log(userId)
        const result = await usersGroups(userId)

        const groups = {}

        for (const row of result.rows) {
            if (!groups[row.group_id]) {
                groups[row.group_id] = {
                    group_id: row.group_id,
                    group_name: row.group_name,
                    user_role: row.user_role,
                    members: []
                };
            }

            if (row.member_name) {
                const exists = groups[row.group_id].members.some(
                    m => m.username === row.member_name && m.status === row.member_status
                );

                if (!exists) {
                groups[row.group_id].members.push({
                    username: row.member_name,
                    status: row.member_status
                });
                }
            }
        }
            
        return res.status(200).json(Object.values(groups))
    } catch (error) {
        return next(new ApiError(`error getting users groups ${error}`, 400))
    }
}

export {makeNewGroup, getAllGroups, getUsersGroups}