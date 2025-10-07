import { ApiError } from '../helpers/apiErrorClass.js'
import { createGroup, allGroups, usersGroups,
        groupJoinRequest, groupExists, alreadyInGroup,
        groupNameAlreadyInUse, groupFull, acceptJoinRequest,
        rejectJoinRequest, kickFromGroup,leaveFromGroup, deleteGroup,
        addMovie, addShowTime, deleteMovie, deleteShowTime, getMovies, getShowTimes } from '../models/groupModel.js'
import { userExists } from '../models/userModel.js'


const makeNewGroup = async(req,res,next) => {
    const grouName = req.body?.groupName
    const owner = await userExists(req.user?.email)
    const ownerId = owner.rows[0].id
    if (!grouName || !ownerId) return next (new ApiError("No group name or owner", 400))
    if (await groupNameAlreadyInUse(grouName)) return next (new ApiError("Group name Already in use", 400))
    const membersList = req.body?.memberEmails
    if (membersList.length > 20) return next (new ApiError("Maximum of 20 members", 400))

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

    } catch (error) {
        return next(new ApiError(`error getting groups data: ${error.message}`, 404))
    }
    
}

const getUsersGroups = async (req,res,next) => {
    try {
        const user = await userExists(req.user?.email)
        if (!user.rows.length) return next (new ApiError("User does not exist", 404))
        const userId = user.rows[0].id
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
        return next(new ApiError(`error getting users groups ${error.message}`, 400))
    }
}

const sendGroupJoinRequest = async (req,res,next) => {
    try {
        const user = await userExists(req.user?.email)
        if (!user.rows.length) return next (new ApiError("User does not exist", 404))
        const userId = user.rows[0].id
        const groupId = parseInt(req.body?.groupId)
        const groupRes = await groupExists(groupId)
        if (!groupRes.rows.length) return next (new ApiError("Group does not exist", 404))
        if (await groupFull(groupId)) return next (new ApiError("Group is full", 400))
        const inGroup = await alreadyInGroup(userId, groupId)
        if (inGroup) return next (new ApiError("Already in group", 400))
        const request = await groupJoinRequest(userId, groupId)
        return res.status(201).json({
            message: "request sent",
            request: request.rows[0]
        })
    } catch (error) {
        return next (new ApiError(`Error sending join request ${error.message}`,400))
    }
}

const acceptGroupJoinRequest = async (req,res,next) => {
    try {
        const user = await userExists(req.user?.email)
        if (!user.rows.length) return next (new ApiError("User does not exist", 404))
        const userId = user.rows[0].id
        const groupId = parseInt(req.body?.groupId)
        const senderName = req.body?.senderName
        if (!senderName) return next(new ApiError("Missing senderName", 400));
        await acceptJoinRequest(userId,groupId,senderName)
        return res.status(201).json({message: "Join request accepted"})
    } catch (error) {
       return next (new ApiError(`Error accepting join request ${error.message}`,400))
    }
}

const rejectGroupJoinRequest = async (req,res,next) => {
    try {
        const user = await userExists(req.user?.email)
        if (!user.rows.length) return next (new ApiError("User does not exist", 404))
        const userId = user.rows[0].id
        const groupId = parseInt(req.body?.groupId)
        const senderName = req.body?.senderName
        if (!senderName) return next(new ApiError("Missing senderName", 400));
        await rejectJoinRequest(userId,groupId,senderName)
        return res.status(201).json({message: "Join request rejected"})
    } catch (error) {
       return next (new ApiError(`Error rejecting join request ${error.message}`,400))
    }
}


const kickUserFromGroup = async (req,res,next) => {
    try {
        const user = await userExists(req.user?.email)
        if (!user.rows.length) return next (new ApiError("User does not exist", 404))
        const userId = user.rows[0].id
        const groupId = parseInt(req.body?.groupId)
        const senderName = req.body?.senderName
        if (!senderName) return next(new ApiError("Missing users name", 400));
        await kickFromGroup(groupId, userId,senderName)
        return res.status(201).json({message: "User kicked from the group"})
    } catch (error) {
       return next (new ApiError(`Error rejecting join request ${error.message}`,400))
    }
}


const userLeaveFromGroup = async (req,res,next) => {
    try {
        const user = await userExists(req.user?.email)
        if (!user.rows.length) return next (new ApiError("User does not exist", 404))
        const userId = user.rows[0].id
        const groupId = parseInt(req.body?.groupId)
        const result = await leaveFromGroup(userId, groupId);
        if (!result) return res.status(403).json({ message: "User is not a member of this group" });
        return res.status(201).json({message: "user left the group"})
    } catch (error) {
       return next (new ApiError(`Error in leaving a group ${error.message}`,400))
    }
}


const ownerDeleteGroup = async (req,res,next) => {
    try {
        const user = await userExists(req.user?.email)
        if (!user.rows.length) return next (new ApiError("User does not exist", 404))
        const userId = user.rows[0].id
        const groupId = parseInt(req.body?.groupId)
        const result = await deleteGroup(userId, groupId)
        if(!result) return next (new ApiError("User is not the owner of this group", 400))
        return res.status(201).json({message: "Group deleted"})
    } catch (error) {
       return next (new ApiError(`Error in deleting a group ${error.message}`,400))
    }
}

const addMovieForGroup = async(req, res, next) =>  {
  try {
    const user = await userExists(req.user?.email)
    if (!user.rows.length) return next (new ApiError("User does not exist", 404))
    const userId = user.rows[0].id
    const groupId = parseInt(req.body?.groupId)
    const movieId = parseInt(req.body?.movieId)
    if (!movieId) return next(new ApiError('No movie id', 400))
    const result = await addMovie(userId, groupId, movieId)
    if (!result) return next(new ApiError('Users is not a member of the group', 403))   
    if (result === "Movie already in group") return next(new ApiError('Movie already in group', 400))
    return res.status(201).json({message: "Movie added", result : result.rows[0]})
  } catch (error) {
       return next (new ApiError(`Error in adding movie to group ${error.message}`,400))
    }
}

const addShowTimeForGroup = async(req, res, next) =>  {
  try {
    const user = await userExists(req.user?.email)
    if (!user.rows.length) return next (new ApiError("User does not exist", 404))
    const userId = user.rows[0].id
    const groupId = parseInt(req.body?.groupId)
    const showTimeId = parseInt(req.body?.showTimeId)
    if (!showTimeId) return next(new ApiError('No movie id', 400))
    const result = await addShowTime(userId, groupId, showTimeId)
    if (!result) return next(new ApiError('Users is not a member of the group', 403))  
    if (result === "Show time already in group") return next(new ApiError('Show time already in group', 400))
    return res.status(201).json({message: "Show time added",  result: result.rows[0]})
  } catch (error) {
       return next (new ApiError(`Error in adding Show time to group ${error.message}`,400))
    }
}

const getAllGroupMovies = async(req,res,next) => {
    try {
    const user = await userExists(req.user?.email)
    if (!user.rows.length) return next (new ApiError("User does not exist", 404))
    const userId = user.rows[0].id
    const groupId = parseInt(req.params.groupId)
    const result = await getMovies(userId, groupId)
    if (!result) return next(new ApiError('Users is not a member of the group', 403))  
    return res.status(200).json({result: result.rows})
    } catch (error) {
        return next (new ApiError(`Error in getting movies ${error.message}`,400))
    }
}

const getAllGroupShowTimes = async(req,res,next) => {
    try {
    const user = await userExists(req.user?.email)
    if (!user.rows.length) return next (new ApiError("User does not exist", 404))
    const userId = user.rows[0].id
    const groupId = parseInt(req.params.groupId)
    const result = await getShowTimes(userId, groupId)
    if (!result) return next(new ApiError('Users is not a member of the group', 403))  
    return res.status(200).json({result: result.rows})
    } catch (error) {
        return next (new ApiError(`Error in getting movies ${error.message}`,400))
    }
}

const deleteMovieFromGroup = async (req,res,next) => {
    try {
        const user = await userExists(req.user?.email)
        if (!user.rows.length) return next (new ApiError("User does not exist", 404))
        const userId = user.rows[0].id
        const groupId = parseInt(req.body?.groupId)
        const movieId = parseInt(req.body?.movieId)
        const result = await deleteMovie(userId, groupId, movieId);
        if (result=== null) return next (new ApiError("User is not a member or owner of this group", 403))
        if (!result) return next (new ApiError("Movie not found in this group", 404))
        return res.status(201).json({message: "Movie deleted"})
    } catch (error) {
       return next (new ApiError(`Error deleting movie from a group ${error.message}`,400))
    }
}

const deleteShowTimeFromGroup = async (req,res,next) => {
    try {
        const user = await userExists(req.user?.email)
        if (!user.rows.length) return next (new ApiError("User does not exist", 404))
        const userId = user.rows[0].id
        const groupId = parseInt(req.body?.groupId)
        const showTimeId = parseInt(req.body?.showTimeId)
        const result = await deleteShowTime(userId, groupId, showTimeId);
        if (result=== null) return next (new ApiError("User is not a member or owner of this group", 403))
        if (!result) return next (new ApiError("Show time not found in this group", 404))
        return res.status(201).json({message: "Show time deleted"})
    } catch (error) {
       return next (new ApiError(`Error deleting show time from a group ${error.message}`,400))
    }
}




export {makeNewGroup, getAllGroups, getUsersGroups, sendGroupJoinRequest,
        acceptGroupJoinRequest,rejectGroupJoinRequest, kickUserFromGroup,
        userLeaveFromGroup, ownerDeleteGroup, addMovieForGroup, addShowTimeForGroup,
        deleteMovieFromGroup, deleteShowTimeFromGroup, getAllGroupMovies, getAllGroupShowTimes}