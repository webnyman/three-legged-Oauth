/**
 * Home controller.
 *
 * @author Björn Nyman
 * @version 1.0.0
 */

/**
 * Encapsulates a controller.
 */
export class HomeController {
/**
 * Renders a view and sends the rendered HTML string as an HTTP response.
 * index GET.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
  index (req, res, next) {
    if (req.session && req.session.loggedIn) {
      res.locals.isLoggedIn = true
    } else {
      // Explicitly set to false to make it clear in the template
      res.locals.isLoggedIn = false
    }
    res.render('home/index')
  }
}
