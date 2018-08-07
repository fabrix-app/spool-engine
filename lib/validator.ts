/* eslint no-console: [0] */
'use strict'

const joi = require('joi')
import { engineConfig } from './schemas'

export const Validator = {

  // Validate Engine Config
  validateEngineConfig (config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, engineConfig, (err, value) => {
        if (err) {
          return reject(new TypeError('config.engine: ' + err))
        }
        return resolve(value)
      })
    })
  }
}
