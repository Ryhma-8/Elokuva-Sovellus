import { Router } from 'express'
import { auth } from '../helpers/auth.js'
import { makeNewGroup, getAllGroups, getUsersGroups, sendGroupJoinRequest,
        acceptGroupJoinRequest, rejectGroupJoinRequest, kickUserFromGroup,
        userLeaveFromGroup, ownerDeleteGroup } from '../controllers/groupController.js'

const router = Router()

router.post("/new_group", auth, makeNewGroup)

router.get("/get_all", getAllGroups)

router.get("/get_by_user", auth, getUsersGroups)

router.post("/send_join_request", auth, sendGroupJoinRequest)

router.post("/accept_join_request", auth, acceptGroupJoinRequest)

router.post("/reject_join_request", auth, rejectGroupJoinRequest)

router.post("/kick_from_group", auth, kickUserFromGroup)

router.post("/leave_group", auth, userLeaveFromGroup)

router.delete("/delete", auth, ownerDeleteGroup)

export default router