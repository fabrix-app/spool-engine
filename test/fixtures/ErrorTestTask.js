'use strict'

const Task = require('../../dist/index').Task

module.exports = class ErrorTestTask extends Task {

  constructor (app, message) {
    super(app, message)
  }

  async run () {
    this.app.log.info('error test task run')
    this.app.testValue = this.message.body.testValue

    if (!this.app.callCount) {
      this.app.callCount = 1
    }
    else {
      this.app.callCount++
    }

    throw new Error('Error in ErrorTestTask')
  }

  async finalize () {
    this.app.log.info('error test task finalize')
    if (!this.app.finalizeCount) {
      this.app.finalizeCount = 1
    }
    else {
      this.app.finalizeCount++
    }
    return Promise.resolve()
  }

}
