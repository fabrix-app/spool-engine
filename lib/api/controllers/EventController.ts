import { FabrixController as Controller } from '@fabrix/fabrix/dist/common'

/**
 * @module EventController
 * @description Fabrix Controller.
 */
export class EventController extends Controller {
  create(req, res) {
    //
    res.json({})
  }
  findOne(req, res) {
    //
    res.json({})
  }
  findAll(req, res) {
    const Event = this.app.models['Event']
    const limit = Math.max(0, req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = req.jsonCriteria(req.query.where)

    Event.findAndCountAll({
      order: sort,
      offset: offset,
      limit: limit,
      where: where
    })
      .then( events => {
        // Paginate
        res.paginate(events.count, limit, offset, sort)
        return res.json(events.rows)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

