import { ExtensionSpool } from '@fabrix/fabrix/dist/common/spools/extension'
import * as schedule from 'node-schedule'
const pubSub = require('./pubSub')

import { Engine } from './Engine'
import { Validator } from './validator'

import * as config from './config/index'
import * as pkg from '../package.json'
import * as api  from './api/index'

export class EngineSpool extends ExtensionSpool {
  private _scheduler
  private _pubSub

  constructor(app) {
    super(app, {
      config: config,
      pkg: pkg,
      api: api
    })

    this._scheduler = schedule
    this._pubSub = pubSub

    this.extensions = {
      scheduler : {
        get: () => {
          return this.scheduler
        },
        set: (newScheduler) => {
          throw new Error('scheduler can not be set through FabrixApp, check spool-engine instead')
        },
        enumerable: true,
        configurable: true
      },
      pubSub : {
        get: () => {
          return this.pubSub
        },
        set: (newPubSub) => {
          throw new Error('pubSub can not be set through FabrixApp, check spool-engine instead')
        },
        enumerable: true,
        configurable: true
      }
    }
  }

  get scheduler () {
    return this._scheduler
  }

  get pubSub () {
    return this._pubSub
  }

  /**
   * Validate Configuration
   */
  async validate () {
    const requiredSpools = ['express', 'sequelize', 'router']
    const spools = Object.keys(this.app.spools)

    if (!spools.some(v => requiredSpools.indexOf(v) >= 0)) {
      return Promise.reject(new Error(`spool-engine requires spools: ${ requiredSpools.join(', ') }!`))
    }

    if (!this.app.config.get('engine')) {
      return Promise.reject(new Error('No configuration found at config.engine!'))
    }

    return Promise.all([
      Validator.validateEngineConfig(this.app.config.get('engine'))
    ])
  }

  /**
   * Adds Routes, Policies, and Agenda
   */
  async configure () {
    return Promise.all([
      Engine.configure(this.app),
      Engine.copyDefaults(this.app)
    ])
  }

  /**
   * TODO document method
   */
  async initialize () {
    return Promise.all([
      // Engine.init(this.app),
      // Engine.streamSequelize(this.app),
      Engine.addCrons(this.app),
      Engine.addEvents(this.app),
      Engine.addTasks(this.app)
    ])
  }

  /**
   * clear subscriptions
   */
  async unload() {
    return Promise.all([
      Engine.cancelPubSub(this.app),
      Engine.cancelCrons(this.app)
    ])
  }
}
