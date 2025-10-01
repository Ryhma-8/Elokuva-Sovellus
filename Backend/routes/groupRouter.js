import { Router } from 'express'
import { auth } from '../helpers/auth.js'
import { makeNewGroup, getAllGroups } from '../controllers/groupController.js'

const router = Router()

router.post("/new_group", auth, makeNewGroup)

router.get("/get_all", getAllGroups)

export default router