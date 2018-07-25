import { FabrixService as Service } from '@fabrix/fabrix/dist/common'
import { defaultsDeep, isString, isNumber } from 'lodash'
import { Errors } from '../../'
import { EVENT_SUBSCRIBER_STATUS } from '../../enums'
/**
 * @module EngineService
 * @description Global Proxy Engine Service
 */
export class EngineService extends Service {
  /**
   * Internal method to retrieve model object
   * @param modelName name of the model to retrieve
   * @returns {*} sequelize model object
   */
  getModel(modelName) {
    return this.app.models[modelName] || this.app.spools.sequelize.models[modelName]
  }

  /**
   * Returns just the count of a model and criteria
   * @param modelName
   * @param criteria
   * @param options
   * @returns {*}
   */
  count(modelName, criteria, options) {
    const Model = this.getModel(modelName)
    const modelOptions = defaultsDeep({}, options, this.app.config.get('tapestries.models.options'))
    if (!Model) {
      return Promise.reject(new Errors.ModelError('E_NOT_FOUND', `${modelName} can't be found`, []))
    }
    return Model.count(criteria, modelOptions)
  }

  // TODO handle INSTANCE or GLOBAL events
  /**
   * Publish into engine PubSub
   * @param type
   * @param data
   * @param options
   * @returns {Promise.<T>}
   */
  // TODO Publish event on Commit if transaction is present
  publish(type, data, options: {[key: string]: any} = {}) {
    return new Promise((resolve, reject) => {
      // If this needs to be auto saved, save and continue immediately.
      if (this.app.config.get('engine.auto_save') || options.save) {
        this.resolveEvent(data, { transaction: options.transaction || null})
          .then(resEvent => {
            // Publish the resulting event
            const event = this.app.pubSub.publish(type, resEvent, options)
            return resolve(event)
          })
          .catch(err => {
            // If an error during resolve Event publish what we have
            this.app.log.debug(err)
            const event = this.app.pubSub.publish(type, data, options)
            return resolve(event)
          })
      }
      else {
        const event = this.app.pubSub.publish(type, data, options)
        return resolve(event)
      }
    })
  }

  /**
   * @param name
   * @param type
   * @param func
   * @returns {*}
   */
  // tslint:disable no-shadowed-variable
  subscribe(name, type, func) {
    const self = this
    const tryCatch = function (type, data, options) {
      try {
        func(type, data, options)
      }
      catch (err) {
        console.log('broke', err)
        const event = {
          object: type.split('.')[0],
          type: type,
          data: data
        }
        return self.subscriptionFailure(event, name, err.toString(), options)
      }
    }
    return this.app.pubSub.subscribe(type, tryCatch)
  }

  /**
   *
   * @param event
   * @param name
   * @param err
   * @param options
   * @returns {Promise.<T>}
   */
  subscriptionFailure(event, name, err, options: {[key: string]: any} = {}) {

    let resEvent, resSubscriber
    return this.resolveEvent(event, {transaction: options.transaction || null})
      .then(foundEvent => {
        if (!foundEvent) {
          // TODO throw err
        }
        resEvent = foundEvent
        return this.resolveEventSubscriber({
          event_id: resEvent.id,
          name: name,
          response: err
        }, {
          transaction: options.transaction || null
        })
      })
      .then(eventSubscriber => {
        resSubscriber = eventSubscriber
        return resEvent.hasSubscriber(resSubscriber.id, {transaction: options.transaction || null})
      })
      .then((result) => {
        if (result) {
          resSubscriber.last_attempt = new Date()
          resSubscriber.status = EVENT_SUBSCRIBER_STATUS.PENDING
          return resSubscriber.increment('attempts')
        }
        else {
          return resEvent.addSubscriber(resSubscriber, {transaction: options.transaction || null})
        }
      })
      .then(eventSubcriber => {
        return resSubscriber.reload()
      })
  }

  /**
   *
   * @param token
   * @returns {*}
   */
  unsubscribe(token) {
    return this.app.pubSub.unsubscribe(token)
  }

  /**
   *
   * @param event
   * @param options
   * @returns {Promise.<T>}
   */
  resolveEvent(event, options: {[key: string]: any} = {}) {
    const Event = this.app.models['Event']
    if (event instanceof Event.instance) {
      return Promise.resolve(event)
    }
    return Event.datastore.transaction(t => {
      if (event.id) {
        return Event.findById(event.id, {
          include: [
            {
              model: this.app.models['EventItem'].instance,
              as: 'objects'
            }
          ],
          transaction: options.transaction || t
        })
      }
      else if (event.request && event.request !== '') {
        return Event.findOne({
          where: {
            request: event.request
          },
          include: [
            {
              model: this.app.models['EventItem'].instance,
              as: 'objects'
            }
          ],
          transaction: options.transaction || t
        })
      }
      else if (isNumber(event)) {
        return Event.findById(event, {
          include: [
            {
              model: this.app.models['EventItem'].instance,
              as: 'objects'
            }
          ],
          transaction: options.transaction || t
        })
      }
      else if (isString(event)) {
        return Event.findOne({
          where: {
            request: event
          },
          include: [
            {
              model: this.app.models['EventItem'].instance,
              as: 'objects'
            }
          ],
          transaction: options.transaction || t
        })
      }
      else {
        // Transform objects
        const items = event.objects || []
        event.objects = items.map(item => {
          const model = Object.keys(item)[0]
          if (item.object_id && item.object) {
            return item
          }
          else {
            return {
              object_id: item[model],
              object: model
            }
          }
        })
        return Event.create(event, {
          include: [
            {
              model: this.app.models['EventItem'].instance,
              as: 'objects'
            }
          ],
          transaction: options.transaction || t
        })
      }
    })
  }

  /**
   *
   * @param eventSubscriber
   * @param options
   * @returns {Promise.<T>}
   */
  resolveEventSubscriber(eventSubscriber, options: {[key: string]: any} = {}) {
    const EventSubscriber = this.app.models['EventSubscriber']
    if (eventSubscriber instanceof EventSubscriber.instance) {
      return Promise.resolve(eventSubscriber)
    }
    return EventSubscriber.datastore.transaction(t => {
      if (eventSubscriber.id) {
        return EventSubscriber.findById(eventSubscriber.id, {
          transaction: options.transaction || t
        })
      }
      else if (eventSubscriber.event_id && eventSubscriber.name) {
        return EventSubscriber.findOne({
          where: {
            event_id: eventSubscriber.event_id,
            name: eventSubscriber.name
          },
          transaction: options.transaction || t
        })
          .then(resSubscriber => {
            if (!resSubscriber) {
              return EventSubscriber.create(eventSubscriber, {transaction: options.transaction || t})
            }
            return resSubscriber
          })
      }
      else {
        const err = new Error('Event Subscriber not able to resolve')
        return Promise.reject(err)
      }
    })

  }

  /**
   *
   * @param event
   * @param options
   * @returns {Promise.<T>}
   */
  destroyEvent(event, options: {[key: string]: any} = {}) {
    options = options || {}
    const Event = this.app.models['Event']
    return Event.destroy({
      where: {
        id: event.id
      },
      transaction: options.transaction || null
    })
  }
}

