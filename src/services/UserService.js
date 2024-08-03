/**
 * Module for the UserService.
 *
 * @author Björn Nyman <bn222eg@student.lnu.se>
 * @version 1.0.0
 */

import { Fetch } from '../lib/Fetch.js'

const fetchData = new Fetch()
const BASE_URL = 'https://gitlab.lnu.se'

/**
 * Encapsulates a service.
 */
export class UserService {
  /**
   * Constructs the body for OAuth-related requests.
   *
   * @param {object} req - Express request object or specific data object.
   * @param {string} grantType - The type of OAuth grant.
   * @returns {object} The request body.
   */
  _constructOAuthBody (req, grantType) {
    const body = {
      client_id: process.env.APP_ID,
      client_secret: process.env.APP_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: grantType
    }

    if (grantType === 'authorization_code') {
      if (!req.query.code) {
        throw new Error('Authorization code is missing.')
      }
      body.code = req.query.code
    } else if (grantType === 'refresh_token') {
      if (!req.session || !req.session.refreshToken) {
        throw new Error('Refresh token is missing from session.')
      }
      body.refresh_token = req.session.refreshToken
    }

    return body
  }

  /**
   * Callback for the OAuth process.
   *
   * @param {object} req - request object.
   * @returns {object} The response data.
   * @memberof UserService
   */
  async callback (req) {
    const body = this._constructOAuthBody(req, 'authorization_code')
    const response = await fetchData.fetchPost(`${BASE_URL}/oauth/token`, body)
    return response
  }

  /**
   * Renews the access token using the refresh token.
   *
   * @param {object} req - request object.
   * @returns {object} The response data.
   * @memberof UserService
   */
  async renewAccessToken (req) {
    const body = this._constructOAuthBody(req, 'refresh_token')
    const response = await fetchData.fetchPost(`${BASE_URL}/oauth/token`, body)
    return response
  }

  /**
   * Profile - Fetches and constructs the profile data for the user.
   *
   * @param {object} token - request object.
   * @returns {object} The response data.
   * @memberof UserService
   */
  async profile (token) {
    const data = await fetchData.fetchGet(`${BASE_URL}/api/v4/user`, token)
    const viewData = await data.json()
    return this._constructViewData(viewData)
  }

  /**
   * Activities - Fetches and constructs the activity data for the user.
   *
   * @param {object} token - request object.
   * @returns {object} The response data.
   * @memberof UserService
   */
  async activities (token) {
    const eventUri = `${BASE_URL}/api/v4/events`
    const activityPerPage = 60
    const pages = 2
    const activityArray = []

    for (let i = 1; i <= pages; i++) {
      const uri = `${eventUri}?per_page=${activityPerPage}&page=${i}`

      // Fetch the data and ensure it's parsed as JSON
      const response = await fetchData.fetchGet(uri, token)
      const data = await response.json()

      if (Array.isArray(data)) {
        activityArray.push(...data)
      } else {
        console.error('Expected data to be an array, received:', data)
      }
    }

    const viewData = activityArray.map(this._mapActivityData)

    return viewData
  }

  /**
   * GroupProjects - Fetches and constructs the group projects data for the user.
   *
   * @param {object} token - request object.
   * @returns {object} The response data.
   * @memberof UserService
   */
  async groupProjects (token) {
    return fetchData.fetchGraphql(`${BASE_URL}/api/graphql`, token)
  }

  /**
   * Logout - Logs out the user by revoking the access token.
   *
   * @param {object} accessToken - request object.
   * @returns {object} The response data.
   * @memberof UserService
   */
  async logout (accessToken) {
    const body = {
      client_id: process.env.APP_ID,
      client_secret: process.env.APP_SECRET,
      token: accessToken
    }
    const response = await fetchData.fetchPost(
      `${BASE_URL}/oauth/revoke`,
      body
    )
    return response
  }

  /**
   *This method maps and formats activity data to the required viewData structure.
   *
   * @param {object} activity - The activity object.
   * @returns {object} The mapped viewData object.
   */
  _mapActivityData (activity) {
    return {
      action_name: activity.action_name,
      created_at: activity.created_at.substring(0, 19).replace('T', ' '),
      target_title: activity.target_title,
      target_type: activity.target_type
    }
  }

  /**
   * Constructs viewData from the API response.
   *
   * @param {object} data - API response data.
   * @returns {object} The viewData object.
   */
  _constructViewData (data) {
    return {
      id: data.id,
      username: data.username,
      name: data.name,
      state: data.state,
      avatar: data.avatar_url,
      bio: data.bio,
      last_activity_on: data.last_activity_on,
      email: data.email
    }
  }
}
