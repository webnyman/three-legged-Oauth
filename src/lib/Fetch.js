/**
 * Module for the FetchUtil.
 *
 * @author Björn Nyman <bn222eg@student.lnu.se>
 * @version 1.0.0
 */

import fetch from 'node-fetch'
import { GraphQLClient } from 'graphql-request'
import { currentUserQuery } from '../graphql/queries/currentUserQuery.js'

/**
 * Encapsulates a util.
 */
export class Fetch {
  /**
   * Private method to perform fetch operations.
   *
   * @param {string} uri - URI to fetch from.
   * @param {object} options - Fetch options including method, headers, and body.
   * @returns {Promise<object>} - The fetch response.
   */
  async _performFetch (uri, options) {
    const response = await fetch(uri, options)
    return response
  }

  /**
   * Fetches using GET method.
   *
   * @param {string} uri - URI to fetch from.
   * @param {string} token - Authorization token.
   * @returns {Promise<object>} - Returning JSON data.
   */
  async fetchGet (uri, token) {
    return this._performFetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
  }

  /**
   * Fetches using POST method.
   *
   * @param {string} uri - URI to fetch from.
   * @param {object} body - Object with data.
   * @returns {Promise<object>} - Returning JSON data.
   */
  async fetchPost (uri, body) {
    return this._performFetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }

  /**
   * Fetches GraphQL.
   *
   * @param {string} endpoint - URI to fetch from.
   * @param {string} token - Authorization token.
   * @returns {object} - Returning JSON data.
   */
  async fetchGraphql (endpoint, token) {
    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    const response = await graphQLClient.request(currentUserQuery)

    return response
  }
}
