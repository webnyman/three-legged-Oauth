/**
 * User controller.
 *
 * @author Björn Nyman
 * @version 1.0.0
 */
import cryptoRandomString from 'crypto-random-string'
import { UserService } from '../services/UserService.js'

/**
 * Encapsulates a controller.
 */
export class UserController {
  /**
   * The service.
   *
   * @type {UserService}
   */
  #service

  /**
   * Initializes a new instance.
   *
   * @param {UserService} service - A service instantiated from a class with the same capabilities as UserService.
   */
  constructor (service = new UserService()) {
    this.#service = service
    this.state = cryptoRandomString({ length: 128 })
  }

  /**
   * Checks if the user is authenticated.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @returns {boolean} True if the user is authenticated, false otherwise.
   */
  _checkAuthenticated (req, res) {
    if (!req.session.loggedIn) {
      req.session.flash = {
        type: 'danger',
        text: 'You need to be logged in to access that page.'
      }
      res.redirect('../')
      return false
    }
    return true
  }

  /**
   * Initializes the session.
   *
   * @param {*} req - Express request object.
   * @param {*} res - Express response object.
   * @param {*} data  - The response data.
   * @memberof UserController
   */
  _initializeSession (req, res, data) {
    req.session.accessToken = data.access_token
    req.session.refreshToken = data.refresh_token
    req.session.loggedIn = true
    res.locals.isLoggedIn = true
  }

  /**
   * Destroys the session.
   *
   * @param {*} req - Express request object.
   * @param {*} res - Express response object.
   * @memberof UserController
   */
  _destroySession (req, res) {
    req.session.destroy()
    res.locals.isLoggedIn = false
  }

  /**
   * Handle the redirect.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  login (req, res, next) {
    try {
      res.redirect(
        `https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.APP_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=${process.env.REQUESTED_SCOPE}&state=${this.state}`
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * Handles the callback.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async callback (req, res, next) {
    try {
      if (req.query.state !== this.state) {
        this._destroySession(req, res)
        res.redirect('../')
      }

      const response = await this.#service.callback(req)
      const data = await response.json()

      if (response.status !== 200) {
        this._destroySession(req, res)
        res.redirect('../')
      }

      this._initializeSession(req, res, data)

      res.redirect('./profile')
    } catch (error) {
      next(error)
    }
  }

  /**
   * Handles the renewing of the access token.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - The promise.
   */
  async renewAccessToken (req, res, next) {
    if (!req.session || !req.session.loggedIn) {
      // Redirect to login page or set flash message as needed
      req.session.flash = {
        type: 'danger',
        text: 'Please log in to continue.'
      }
      return res.redirect('/')
    }
    try {
      const response = await this.#service.renewAccessToken(req)
      const data = await response.json()

      this._initializeSession(req, res, data)

      next()
    } catch (error) {
      req.session.flash = {
        type: 'danger',
        message: 'Your session has expired. Please log in again.'
      }
      res.redirect('/')
    }
  }

  /**
   * Handles the redirect to profile page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async profile (req, res, next) {
    if (!this._checkAuthenticated(req, res)) {
      return
    }
    try {
      const token = req.session?.accessToken
      const viewData = await this.#service.profile(token)

      res.render('./user/profile', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Handles the redirect to activities page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async activities (req, res, next) {
    if (!this._checkAuthenticated(req, res)) {
      return
    }
    try {
      const token = req.session?.accessToken
      const viewData = await this.#service.activities(token)

      res.render('./user/activities', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Handles the redirect to group projects page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async groupProjects (req, res, next) {
    if (!this._checkAuthenticated(req, res)) {
      return
    }
    try {
      const token = req.session?.accessToken
      const data = await this.#service.groupProjects(token)
      res.render('./user/groupprojects', { data })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Destroys the users session and logs out.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async logout (req, res) {
    try {
      const accessToken = req.session?.accessToken
      const response = await this.#service.logout(accessToken)

      if (response.status === 200) {
        this._destroySession(req, res)
      }

      res.redirect('/')
    } catch (error) {
      res.redirect('/')
    }
  }
}
