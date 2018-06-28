export class Task {
  app
  message
  id
  isAcknowledged

  constructor (app, message) {
    Object.defineProperty(this, 'app', {
      enumerable: false,
      value: app
    })

    this.message = message
    this.id = message.body.taskId
    this.isAcknowledged = false
  }

  ack() {
    if (!this.isAcknowledged) {
      this.isAcknowledged = true
      this.message.ack()
    }
    else {
      this.app.log.warn('Attempting to ack a message that already responded')
    }
  }

  nack() {
    if (!this.isAcknowledged) {
      this.isAcknowledged = true
      this.message.nack()
    }
    else {
      this.app.log.warn('Attempting to nack a message that already responded')
    }
  }

  reject() {
    if (!this.isAcknowledged) {
      this.isAcknowledged = true
      this.message.reject()
    }
    else {
      this.app.log.warn('Attempting to reject a message that already responded')
    }
  }

  run () {
    throw new Error('Subclasses must override Task.run')
  }

  interrupt (msg) {
    this.app.log.debug('Task Interrupt:', msg)
  }

  finalize (results) {
    this.app.log.debug('Task Finalize:', results)
  }
}
