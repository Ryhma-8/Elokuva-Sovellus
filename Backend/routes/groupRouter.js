import { Router } from 'express'
import { auth } from '../helpers/auth.js'
import { makeNewGroup } from '../controllers/groupController.js'

const router = Router()

router.post("/new_group", auth, makeNewGroup)

export default router