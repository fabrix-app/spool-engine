/* eslint new-cap: [0]*/
'use strict'

const _ = require('lodash')
const smokesignals = require('smokesignals')
const fs = require('fs')
const Model = require('@fabrix/fabrix/dist/common').FabrixModel
const Event = require('../../dist/index').Event
const Cron = require('../../dist/index').Cron
const Task = require('../../dist/index').Task
const SequelizeResolver = require('@fabrix/spool-sequelize').SequelizeResolver

const App = {
  api: {
    models: {
      // Event: require('../dist/api/models/Event').Event,
      // EventItem: require('../dist/api/models/EventItem').EventItem,
      // EventSubscriber: require('../dist/api/models/EventSubscriber').EventSubscriber,
      Item: class Item extends Model {
        static config(app, Sequelize) {
          return {
            options: {}
          }
        }
        static schema(app, Sequelize) {
          return {
            name: {
              type: Sequelize.STRING,
              allowNull: false
            }
          }
        }
        static get resolver() {
          return SequelizeResolver
        }
      }
    },
    events: {
      onAutoTestEvent: class onAutoTestEvent extends Event {
        subscribe() {
          console.log('I AM AUTOMATICALLY SUBSCRIBING...', !!this.app)
          this.app.services.EngineService.subscribe('onAutoTestEvent.test','test', this.test)
          this.app.services.EngineService.subscribe('onAutoTestEvent.test2','test2', this.test2)
        }
        test(msg, data, options) {
          console.log('test: I SUBSCRIBED AUTOMATICALLY', msg, data, options)
          return options.done ? options.done() : true
        }
        test2(msg, data, options) {
          console.log('test2: I SUBSCRIBED AUTOMATICALLY TOO', msg, data, options)
          return options.done ? options.done() : true
        }
      },
      onTestEvent: class onTestEvent extends Event {
        test3(msg, data, options) {
          console.log('test: I WAS PROFILE SUBSCRIBED', msg, data, options)
          return options.done ? options.done() : true
        }
        test4(msg, data, options) {
          console.log('test2: I WAS PROFILE SUBSCRIBED TOO', msg, data, options)
          return options.done ? options.done() : true
        }
      },
      onNotTestEvent: class onNotTestEvent extends Event {
        test5(msg, data, options) {
          console.log('I WAS TESTED and should not have been', msg, data, options)
          const err = new Error('I am not subscribed')
          return options.done ? options.done(err) : true
        }
        test6(msg, data, options) {
          console.log('I WAS TESTED TOO and should not have been', msg, data, options)
          const err = new Error('I am not subscribed')
          return options.done ? options.done(err) : true
        }
      }
    },
    crons: {
      onAutoTestCron: class onAutoTestCron extends Cron {
        schedule() {
          console.log('I AM AUTOMATICALLY SCHEDULING...', !!this.app)
          this.test()
          this.test2()
        }

        test() {
          const startTime = new Date(Date.now() + 5000)
          const endTime = new Date(startTime.getTime() + 5000)
          console.log('I HAVE BEEN AUTOMATICALLY SCHEDULED', !!this.app)

          this.scheduler.scheduleJob('onAutoTestCron.test', {
            start: startTime,
            end: endTime,
            rule: '*/1 * * * * *'
          }, () => {
            console.log('Time for tea!')
          })
        }

        test2() {
          const startTime = new Date(Date.now() + 5000)
          const endTime = new Date(startTime.getTime() + 5000)
          console.log('I HAVE BEEN AUTOMATICALLY SCHEDULED', !!this.app)

          this.scheduler.scheduleJob('onAutoTestCron.test2', {
            start: startTime,
            end: endTime,
            rule: '*/1 * * * * *'
          }, () => {
            console.log('Time for tea!')
          })
        }
      },
      onTestCron: class onTestCron extends Cron {
        test() {
          const startTime = new Date(Date.now() + 5000)
          const endTime = new Date(startTime.getTime() + 5000)
          console.log('I HAVE BEEN PROFILE SCHEDULED', !!this.app)

          this.scheduler.scheduleJob('onTestCron.test', {
            start: startTime,
            end: endTime,
            rule: '*/1 * * * * *'
          }, () => {
            console.log('Time for tea!')
          })
        }
        test2() {
          const startTime = new Date(Date.now() + 5000)
          const endTime = new Date(startTime.getTime() + 5000)
          console.log('I HAVE BEEN PROFILE SCHEDULED', !!this.app)

          this.scheduler.scheduleJob('onTestCron.test2', {
            start: startTime,
            end: endTime,
            rule: '*/1 * * * * *'
          }, () => {
            console.log('Time for tea!')
          })
        }
      },
      onNotTestCron: class onNotTestCron extends Cron {
        test() {
          const startTime = new Date(Date.now() + 5000)
          const endTime = new Date(startTime.getTime() + 5000)
          console.log('I HAVE BEEN SCHEDULED AND SHOULD NOT BE', !!this.app)

          this.scheduler.scheduleJob('onNotTestCron.test', {
            start: startTime,
            end: endTime,
            rule: '*/1 * * * * *'
          }, () => {
            console.log('Time for tea!')
          })
        }
        test2() {
          const startTime = new Date(Date.now() + 5000)
          const endTime = new Date(startTime.getTime() + 5000)
          console.log('I HAVE BEEN SCHEDULED AND SHOULD NOT BE', !!this.app)

          this.scheduler.scheduleJob('onNotTestCron.test2',{
            start: startTime,
            end: endTime,
            rule: '*/1 * * * * *'
          }, () => {
            console.log('Time for tea!')
          })
        }
      }
    },
    tasks: {
      TestTask: require('./TestTask'),
      TestTask2: require('./TestTask2'),
      TestTask3: require('./TestTask3'),
      OtherTestTask: require('./OtherTestTask'),
      ErrorTestTask: require('./ErrorTestTask'),
      MultiAckTest: require('./MultiAckTest')
    },
    services: require('../../dist/api/services/index')
  },
  pkg: {
    name: 'spool-engine-test',
    version: '1.0.0'
  },
  config: {
    stores: {
      sequelize: {
        orm: 'sequelize',
        database: 'Sequelize',
        host: '127.0.0.1',
        dialect: 'postgres',
        migrate: 'drop'
      }
    },
    models: {
      defaultStore: 'sequelize',
      migrate: 'drop'
    },
    routes: {},
    main: {
      spools: [
        require('@fabrix/spool-router').RouterSpool,
        require('@fabrix/spool-sequelize').SequelizeSpool,
        require('@fabrix/spool-express').ExpressSpool,
        require('../../dist/index').EngineSpool
      ]
    },
    policies: {},
    log: {
      logger: new smokesignals.Logger('debug')
    },
    web: {
      express: require('express'),
      middlewares: {
        order: [
          'static',
          'addMethods',
          'cookieParser',
          'session',
          'bodyParser',
          'methodOverride',
          'router',
          'www',
          '404',
          '500'
        ],
        static: require('express').static('test/static')
      }
    },
    // Generics
    generics: {},
    // Engine
    engine: {
      live_mode: true,
      auto_save: false,
      profile: 'testProfile',
      crons_config: {
        enabled: true,
        auto_schedule: true,
        uptime_delay: 1,
        profiles: {
          testProfile: [
            'onTestCron.test',
            'onTestCron.test2'
          ],
          otherProfile: ['otherTestCron.test']
        }
      },
      events_config: {
        enabled: true,
        auto_subscribe: true,
        profiles: {
          testProfile: [
            'onTestEvent.test3',
            'onTestEvent.test4'
          ],
          otherProfile: [
            'onTestEvent.test'
          ]
        }
      },
      tasks_config: {
        enabled: true,
        auto_queue: true,
        profiles: {
          testProfile: [
            'TestTask',
            'TestTask2',
            'TestTask3',
            'ErrorTestTask',
            'MultiAckTest'
          ],
          otherProfile: [
            'OtherTestTask'
          ]
        },
        connection: {
        //   exchange: process.env.TASK_EXCHANGE, // optional, defaults to `tasks-work-x`
        //   work_queue_name: process.env.TASK_WORK_QUEUE, // optional, defaults to `tasks-work-q`
        //   interrupt_queue_name: process.env.TASK_INTERRUPT_QUEUE, // optional, defaults to `tasks-interrupt-q`
        //
        //   /**
        //    * The RabbitMQ connection information.
        //    * See: https://www.rabbitmq.com/uri-spec.html
        //    */
        //   // host: process.env.TASK_RMQ_HOST,
        //   // user: process.env.TASK_RMQ_USER,
        //   // pass: process.env.TASK_RMQ_PASS,
        //   // port: process.env.TASK_RMQ_PORT,
        //   // vhost: process.env.TASK_RMQ_VHOST,
        //
        //   /**
        //    * Connection information could also be passed via uri
        //    */
        //   uri: process.env.RMQ_URI || 'amqp://',

          /**
           * Additional, optional connection options (default values shown)
           */
          heartbeat: 30,
          timeout: null, // this is the connection timeout (in milliseconds, per connection attempt), and there is no default
          failAfter: 60, // limits how long rabbot will attempt to connect (in seconds, across all connection attempts). Defaults to 60
          retryLimit: 3 // limits number of consecutive failed attempts
        }
      }
    }
  }
}

_.defaultsDeep(App, smokesignals.FailsafeConfig)
module.exports = App
