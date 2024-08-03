// currentUserQuery.js
import { gql } from 'graphql-request'

export const currentUserQuery = gql`
  query {
    currentUser {
      groups(first: 6) {
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          id
          name
          fullPath
          avatarUrl
          path
          projects(first: 10, includeSubgroups: true) {
            nodes {
              id
              name
              fullPath
              avatarUrl
              path
              repository {
                tree {
                  lastCommit {
                    authoredDate
                    author {
                      name
                      username
                      avatarUrl
                    }
                  }
                }
              }
              projectMembers {
                nodes {
                  createdBy {
                    name
                    avatarUrl
                    username
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
