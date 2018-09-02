export class Event {
  public app
  public pubSub
  public methods

  constructor (app) {
    Object.defineProperties(this, {
      app: {
        enumerable: false,
        value: app
      },
      pubSub: {
        enumerable: false,
        value: app.pubSub
      }
    })
  }

  /**
   * Return the id of this event class
   */
  get id () {
    return this.constructor.name.replace(/(\w+)Event/, '$1').toLowerCase()
  }

  /**
   * Get's the name of the cron class
   */
  get name() {
    return this.constructor.name
  }

  /**
   * Get a list of eligible event listeners on this event class
   * @returns {Array}
   */
  get events() {
    const notAllowed = ['subscribe']
    const events = []
    if (this.methods) {
      this.methods.forEach(method => {
        if (notAllowed.indexOf(method) === -1) {
          events.push(`${this.name}.${method}`)
        }
      })
    }
    return events
  }

  /**
   * Get a list of subscribable event listeners on this class
   * @returns {Array}
   */
  get subscribers() {
    const subscribers = []
    if (this.pubSub && this.methods) {
      const messages = Object.keys(this.pubSub.getMessages())
      messages.forEach(message => {
        if (this.methods.indexOf(message) > -1) {
          subscribers.push(`${this.name}.${message}`)
        }
      })
    }
    return subscribers
  }

  /**
   * Get a list of subscribed event listeners on this class
   * @returns {Array}
   */
  // TODO
  get subscribed() {
    const subscribed = []
    if (this.pubSub && this.methods) {
      const messages = Object.keys(this.pubSub.getMessages())
      messages.forEach(message => {
        if (this.methods.indexOf(message) > -1) {
          subscribed.push(`${this.name}.${message}`)
        }
      })
    }
    return subscribed
  }
}
