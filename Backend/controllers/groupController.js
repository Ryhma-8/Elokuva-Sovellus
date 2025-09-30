import { ApiError } from '../helpers/apiErrorClass.js'
import { createGroup } from '../models/groupModel.js'
import { userExists } from '../models/userModel.js'

const makeNewGroup = async(req,res,next) => {
    const grouName = req.body.groupName
    const owner = await userExists(req.user.user)
    const ownerId = owner.rows[0].id
    if (!grouName || !ownerId) return next (new ApiError("No group name or owner", 400))
    const membersList = req.body.membersId
    if (membersList.length > 5) return next (new ApiError("Maximum of 5 members", 400))

    try {
        const group = await createGroup(grouName, ownerId, membersList)
        return res.status(201).json(group)
    }
    catch (err) {
        return next(new ApiError(err, 400))
    }
}

export {makeNewGroup}