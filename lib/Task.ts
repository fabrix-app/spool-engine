export class Task {
  private app
  public message
  public id
  public isAcknowledged

  constructor (app, message) {
    Object.defineProperty(this, 'app', {
      enumerable: false,
      value: app
    })

    this.message = message || { body: { taskId: null }}
    this.id = this.message.body.taskId
    this.isAcknowledged = false
  }

  // /**
  //  * Return the id of this cron
  //  */
  // get id () {
  //   return this.constructor.name.replace(/(\w+)Task/, '$1').toLowerCase()
  // }

  /**
   * Get's the name of the task class
   */
  get name() {
    return this.constructor.name
  }

  async ack() {
    if (!this.isAcknowledged) {
      this.isAcknowledged = true
      return this.message.ack()
    }
    else {
      this.app.log.warn(`${this.name} attempting to ack a message that already responded`)
    }
  }

  async nack() {
    if (!this.isAcknowledged) {
      this.isAcknowledged = true
      return this.message.nack()
    }
    else {
      this.app.log.warn(`${this.name} attempting to nack a message that already responded`)
    }
  }

  async reject() {
    if (!this.isAcknowledged) {
      this.isAcknowledged = true
      return this.message.reject()
    }
    else {
      this.app.log.warn(`${this.name} attempting to reject a message that already responded`)
    }
  }

  async run () {
    throw new Error('Subclasses must override Task.run')
  }

  async interrupt (msg) {
    this.app.log.debug(`${this.name} Interrupt:`, msg)
  }

  async finalize (results) {
    this.app.log.debug(`${this.name} Finalize:`, results)
  }
}
