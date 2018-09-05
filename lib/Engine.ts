import { clone } from 'lodash'
import * as sequelizeStream from 'sequelize-stream'
import * as schedule from 'node-schedule'

const pubSub = require('./pubSub')
import { Utils } from './utils'

import { Client } from './Client'
import { FabrixApp } from '@fabrix/fabrix'

// RabbitMQ TODO make this a generic instead of hardcode
const rabbit = require('rabbot')
// automatically nack exceptions in handlers
rabbit.nackOnError()

export const Engine = {

  /**
   * configure - Configure the Engine
   * @param app
   */
  configure: (app) => {
    // // Load Defaults for api: crons, events, tasks
    // app.api.crons = app.api.crons || {}
    // app.api.events = app.api.events || {}
    // app.api.tasks = app.api.tasks || {}
    //
    // // app.api.models.hooks = app.api.models.hooks || {}
    //
    // const taskConfig = app.config.get('engine.tasks_config')
    //
    // // Define New properties on app
    // Object.defineProperties(app, {
    //   engine: {
    //     enumerable: true,
    //     writable: false,
    //     value: {
    //       pubSub: pubSub,
    //       scheduler: schedule
    //     }
    //   },
    //   events: {
    //     enumerable: true,
    //     writable: false,
    //     value: { }
    //   },
    //   tasks: {
    //     enumerable: true,
    //     writable: false,
    //     value: new Client(app, rabbit, taskConfig.exchange_name)
    //   },
    //   crons: {
    //     enumerable: true,
    //     writable: false,
    //     value: { }
    //   }
    // })
    //
    // // Bind the Methods
    // //Object.assign(app.engine, fabrixCore.bindMethods(app, 'engine'))
    // Object.assign(app.events, fabrixCore.bindMethods(app, 'events'))
    // Object.assign(app.tasks, fabrixCore.bindMethods(app, 'tasks'))
    // Object.assign(app.crons, fabrixCore.bindMethods(app, 'crons'))

    return
  },
  /**
   *
   * @param app
   */
  streamSequelize: (app: FabrixApp ) => {
    const stream = sequelizeStream(app.models['Event'].sequelize)
    // Make past tense
    const METHODS = {
      'create': 'created',
      'update': 'updated',
      'destroy': 'destroyed'
    }
    stream.on('data', (instance, event) => {
      if (instance && instance.$modelOptions && instance.$modelOptions.tableName !== 'event') {
        const object = instance.$modelOptions.tableName
        const data = instance.toJSON()
        const newEvent = {
          object: object,
          object_id: data.id,
          type: `${object}.${METHODS[event]}`,
          data: data
        }
        app.services.EngineService.publish(newEvent.type, newEvent, { save: instance.$modelOptions.autoSave })
      }
    })
  },
  /**
   *
   * @param app
   * @returns {Promise.<T>}
   */
  cancelPubSub: (app: FabrixApp) => {
    app.pubSub.clearAllSubscriptions()
    return Promise.resolve()
  },
  /**
   *
   * @param app
   * @returns {Promise.<T>}
   */
  cancelCrons: (app: FabrixApp) => {
    for (const j in app.scheduler.scheduledJobs) {
      if (app.scheduler.scheduledJobs.hasOwnProperty(j)) {
        const job = app.scheduler.scheduledJobs[j]
        job.cancel()
      }
    }
    return Promise.resolve()
  },

  /**
   * copyDefaults - Copies the default configuration so that it can be restored later
   * @param app
   * @returns {Promise.<{}>}
   */
  copyDefaults: (app: FabrixApp) => {
    app.config.set('engineDefaults', clone(app.config.get('engine')))
    return Promise.resolve({})
  },
  // /**
  //  * Add Cron Jobs to Engine
  //  * @param app
  //  * @returns {Promise.<{}>}
  //  */
  addCrons: (app: FabrixApp) => {
    // Schedule the cron jobs
    // Then, allow the profile follow it's own pattern
    Object.keys(app.crons || {}).forEach(function(key) {
      const cron = app.crons[key]
      // Crons are now immutable
      cron.freeze()

      // Schedule the cron
      if (
        cron.methods && cron.methods.indexOf('schedule') > -1
        && app.config.get('engine.crons_config.auto_schedule') !== false
      ) {
        cron.schedule()
        app.log.debug(`Engine auto scheduled ${ cron.name }: ${ cron.scheduledJobs.length } jobs`)
      }

      const profile = app.config.get('engine.profile')

      if (
        app.config.get('engine.crons_config.profiles')
        && app.config.get('engine.crons_config.profiles')[profile]
      ) {
        app.config.get('engine.crons_config.profiles')[profile].forEach(allowed => {
          const allowedCron = allowed.split('.')[0]
          const allowedMethod = allowed.split('.')[1]
          if (allowedCron === key && cron.methods.indexOf(allowedMethod) > -1) {
            cron[allowedMethod]()
          }
        })
      }
    })

    return
  },
  // /**
  //  * Add Events to Engine
  //  * @param app
  //  * @returns {Promise.<{}>}
  //  */
  addEvents: (app: FabrixApp) => {
    // Subscribe to Events using the Subscribe method provided in each event
    // Then, allow the profile follow it's own pattern
    Object.keys(app.events || {}).forEach(function(key) {
      const event = app.events[key]
      if (
        event.methods && event.methods.indexOf('subscribe') > -1
        && app.config.get('engine.events_config.auto_subscribe') !== false
      ) {
        event.subscribe()
        app.log.debug(`Engine auto subscribed ${ event.name }: ${event.subscribers.length} subscribers`)
      }
      // Load profile
      const profile = app.config.get('engine.profile')
      if (
        app.config.get('engine.events_config.profiles')
        && app.config.get('engine.events_config.profiles')[profile]
      ) {
        app.config.get('engine.events_config.profiles')[profile].forEach(allowed => {
          const allowedEvent = allowed.split('.')[0]
          const allowedMethod = allowed.split('.')[1]
          if (
            allowedEvent === key
            && allowedMethod
            && event.methods.indexOf(allowedMethod) > -1
          ) {
            app.services.EngineService.subscribe(allowed, allowedMethod, event[allowedMethod])
          }
        })
      }
    })

    return
  },

  /**
   * Build Tasker
   */
  buildTasker: (app: FabrixApp) => {
    let taskerConfig = app.config.get('engine.tasks_config')

    if (taskerConfig.enabled === false) {
      return Promise.resolve()
    }

    const profileName = app.config.get('engine.profile')
    const profile = Utils.getWorkerProfile(profileName, taskerConfig)
    taskerConfig = Utils.configureExchangesAndQueues(profile, taskerConfig)

    app.spools.engine.tasker = new Client(app, rabbit, taskerConfig.exchangeName)

    return Utils.registerTasks(profile, app, rabbit)
  },

  /**
   * Add Tasks to Rabbit
   */
  addTasks: (app: FabrixApp) => {
    let taskerConfig = app.config.get('engine.tasks_config')

    if (taskerConfig.enabled === false) {
      return Promise.resolve()
    }

    rabbit.configure(taskerConfig)
    return Promise.resolve()
  },

  /**
   * Shutdown Tasker
   */
  shutdownTasker: (app: FabrixApp) => {
    return Promise.resolve(rabbit.shutdown())
  }
}
