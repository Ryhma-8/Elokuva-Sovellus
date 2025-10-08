import { Router } from 'express'
import { auth } from '../helpers/auth.js'
import { makeNewGroup, getAllGroups, getUsersGroups, sendGroupJoinRequest,
        acceptGroupJoinRequest, rejectGroupJoinRequest, kickUserFromGroup,
        userLeaveFromGroup, ownerDeleteGroup, addMovieForGroup, addShowTimeForGroup,
        deleteMovieFromGroup, deleteShowTimeFromGroup, getAllGroupMovies, getAllGroupShowTimes,
        getGroupAccess
        } from '../controllers/groupController.js'

const router = Router()

//Group controls

router.post("/new_group", auth, makeNewGroup)

router.get("/get_all", getAllGroups)

router.get("/get_by_user", auth, getUsersGroups)

router.post("/send_join_request", auth, sendGroupJoinRequest)

router.post("/accept_join_request", auth, acceptGroupJoinRequest)

router.post("/reject_join_request", auth, rejectGroupJoinRequest)

router.post("/kick_from_group", auth, kickUserFromGroup)

router.post("/leave_group", auth, userLeaveFromGroup)

router.delete("/delete", auth, ownerDeleteGroup)

//Group movies and show times

router.post("/add_movie", auth, addMovieForGroup)

router.post("/add_showTime", auth, addShowTimeForGroup)

router.get("/get_movies/:groupId", auth, getAllGroupMovies)

router.get("/get_showTimes/:groupId", auth, getAllGroupShowTimes)

router.delete("/delete_movie", auth, deleteMovieFromGroup)

router.delete("/delete_showTime", auth, deleteShowTimeFromGroup)

// Group access

router.get("/:groupId", auth, getGroupAccess)

export default router