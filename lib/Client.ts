import * as uuid from 'uuid'

export class Client  {
  app
  messenger
  exchange_name
  active_types

  constructor (app, messenger, exchangeName) {
    this.app = app
    this.messenger = messenger
    this.exchange_name = exchangeName
    this.active_types = new Map()
  }

  publish (routingKey, data) {
    const taskId = uuid.v1()
    data.taskId = taskId
    return this.messenger.publish(this.exchange_name, routingKey, data)
      .then(() => {
        return taskId
      })
  }

  cancel (typeName, typeId) {
    this.app.log.info('cancelling type', typeName, typeId, this.exchange_name)

    return this.messenger.publish(this.exchange_name, `${typeName}.interrupt`, {
      typeId
    })
  }

}
