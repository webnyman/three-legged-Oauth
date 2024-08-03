/**
 * User routes.
 *
 * @author Björn Nyman
 * @version 1.0.0
 */

import express from 'express'

export const router = express.Router()

/**
 * Resolves a UserController object from the IoC container.
 *
 * @param {object} req - Express request object.
 * @returns {object} An object that can act as a UserController object.
 */
const resolveUserController = (req) => req.app.get('container').resolve('UserController')

// Map HTTP verbs and route paths to controller action methods.
router.get('/login',
  (req, res, next) => resolveUserController(req).login(req, res, next)
)

router.get('/callback',
  (req, res, next) => resolveUserController(req).callback(req, res, next)
)

router.get('/profile',
  (req, res, next) => resolveUserController(req).renewAccessToken(req, res, next),
  (req, res, next) => resolveUserController(req).profile(req, res, next)
)

router.get('/activities',
  (req, res, next) => resolveUserController(req).renewAccessToken(req, res, next),
  (req, res, next) => resolveUserController(req).activities(req, res, next)
)

router.get('/groupprojects',
  (req, res, next) => resolveUserController(req).renewAccessToken(req, res, next),
  (req, res, next) => resolveUserController(req).groupProjects(req, res, next)
)

router.get('/logout',
  (req, res, next) => resolveUserController(req).logout(req, res, next)
)
