'use strict'

const Task = require('../../dist/index').Task

module.exports = class TestTask extends Task {

  constructor (app, message) {
    super(app, message)
  }

  async run () {
    // console.log('BRK RUN!', this.message, this.id)
    this.app.testValue = this.message.body.testValue

    if (!this.app.callCount) {
      this.app.callCount = 1
    }
    else {
      this.app.callCount++
    }
    this.ack()
  }

  async finalize () {
    // console.log('BRK FINALIZE!', this.message, this.id)
    if (!this.app.finalizeCount) {
      this.app.finalizeCount = 1
    }
    else {
      this.app.finalizeCount++
    }
  }

}
