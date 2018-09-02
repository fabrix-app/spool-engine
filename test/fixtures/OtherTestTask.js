
'use strict'

const Task = require('../../dist/index').Task

module.exports = class OtherTestTask extends Task {

  constructor (app, message) {
    super(app, message)
  }

  async run () {

    this.app.log.info('in other test task')

    this.app.testValue = this.message.body.testValue

    if (!this.app.callCount) {
      this.app.callCount = 1
    }
    else {
      this.app.callCount++
    }
    return this.ack()
  }

}
