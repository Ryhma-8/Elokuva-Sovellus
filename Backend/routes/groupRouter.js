import { Router } from 'express'
import { auth } from '../helpers/auth.js'
import { makeNewGroup, getAllGroups, getUsersGroups, sendGroupJoinRequest } from '../controllers/groupController.js'

const router = Router()

router.post("/new_group", auth, makeNewGroup)

router.get("/get_all", getAllGroups)

router.get("/get_by_user", auth, getUsersGroups)

router.post("/send_join_request", auth, sendGroupJoinRequest)

export default router