const moment = require('moment')

export class RetryRules {
  _current_rule
  _retry_rules

  constructor (app, currentRule) {
    Object.defineProperties(this, {
      app: {
        enumerable: false,
        value: app
      }
    })

    this._current_rule = currentRule
    this._retry_rules = app.config.get('engine.events_config.retry_rules') || []
  }

  decrementCurrentRule () {
    this._current_rule--
    return this._current_rule
  }

  incrementCurrentRule () {
    this._current_rule++
    return this._current_rule
  }

  get currentRule() {
    return this._retry_rules[this._current_rule] || new Date()
  }

  /**
   * Returns a datetime when the next retry should be.
   */
  get nextRetryTime() {
    return moment(this.currentRule).format('YYYY-MM-DD HH:mm:ss')
  }

}
