import { ApiError } from '../helpers/apiErrorClass.js'
import { createGroup, allGroups } from '../models/groupModel.js'
import { userExists } from '../models/userModel.js'

const makeNewGroup = async (req, res, next) => {
  try {
    const groupName = String(req.body.groupName || '').trim()
    if (!groupName) return next(new ApiError('No group name', 400))

    //  Omistajan sähköposti tokenista
    const ownerEmail = req.user?.email ?? req.user?.user ?? null
    if (!ownerEmail) return next(new ApiError('Owner not found from token', 401))

    //  Haetaan omistajan id kannasta sähköpostilla
    const owner = await userExists(ownerEmail)
    const ownerRow = owner?.rows?.[0]
    if (!ownerRow?.id) return next(new ApiError('Owner not found', 404))
    const ownerId = ownerRow.id

    const membersListRaw = Array.isArray(req.body.memberEmails) ? req.body.memberEmails : []
    const membersList = membersListRaw.slice(0, 5)

    const group = await createGroup(groupName, ownerId, membersList)

    return res.status(201).json(group)
  } catch (err) {
    console.error('makeNewGroup error:', err)
    return next(new ApiError(err.message || 'Failed to create group', 400))
  }
}

const getAllGroups = async(req,res,next) => {
    try {
        const result = await allGroups()
        const groupsData = result.rows
        console.log(groupsData)
        return res.status(200).json(groupsData)

    } catch (err) {
        return next(new ApiError(`geting groups data: ${err}`, 404))
    }
    
}

export {makeNewGroup, getAllGroups}