'use strict'

const Task = require('../../dist/index').Task

module.exports = class MultiAckTest extends Task {

  constructor (app, message) {
    super(app, message)
  }

  async run () {
    this.app.testValue = this.message.body.testValue

    if (!this.app.callCount) {
      this.app.callCount = 1
    }
    else {
      this.app.callCount++
    }
    this.ack()
    // simulate more than one ack/nack/reject
    this.ack()
    this.nack()
    this.reject()
    this.ack()
  }

  async finalize () {
    if (!this.app.finalizeCount) {
      this.app.finalizeCount = 1
    }
    else {
      this.app.finalizeCount++
    }
  }

}
