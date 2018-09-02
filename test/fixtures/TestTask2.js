'use strict'

const Task = require('../../dist/index').Task

module.exports = class TestTask2 extends Task {

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
  }

}
