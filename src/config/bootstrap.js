/**
 * Module for bootstrapping.
 *
 * @author Björn Nyman <bn222eg@student.lnu.se>
 * @version 1.0.0
 */

import { IoCContainer } from '../lib/IoCContainer.js'
import { UserService } from '../services/UserService.js'
import { HomeController } from '../controllers/home-controller.js'
import { UserController } from '../controllers/user-controller.js'

const iocContainer = new IoCContainer()

iocContainer.register('HomeController', HomeController, {
  singleton: true
})

iocContainer.register('UserService', UserService, {
  singleton: true
})

iocContainer.register('UserController', UserController, {
  dependencies: [
    'UserService'
  ],
  singleton: true
})

export const container = Object.freeze(iocContainer)
