import { FabrixApp } from '@fabrix/fabrix'
import { remove, find } from 'lodash'

export const Utils = {
  /**
   * Get the profile for the current process
   * The profile contains a list that this process can work on
   * If there is no profile (ie the current process is not a worker process), this returns undefined
   */
  getWorkerProfile: (profileName, typeConfig) => {
    if (!profileName || !typeConfig.profiles[profileName]) {
      return []
    }

    return typeConfig.profiles[profileName]
  },

  /**
   * This function mutates the taskerConfig object
   * Declare the exchanges and queues, and bind them appropriately
   * Define the relevant routing keys
   * @returns {object} - taskerConfig
   */
  configureExchangesAndQueues: (profile, taskerConfig) => {
    const exchangeName = taskerConfig.exchange || 'tasker-work-x'
    const workQueueName = taskerConfig.work_queue_name || 'tasker-work-q'
    const interruptQueueName = taskerConfig.interrupt_queue_name || 'tasker-interrupt-q'

    taskerConfig.exchangeName = exchangeName

    taskerConfig.exchanges = [{
      name: exchangeName,
      type: 'topic',
      autoDelete: false
    }]

    taskerConfig.queues = [{
      name: workQueueName,
      autoDelete: false,
      subscribe: true
    }, {
      name: interruptQueueName,
      autoDelete: false,
      subscribe: true
    }]

    taskerConfig.bindings = [{
      exchange: exchangeName,
      target: workQueueName,
      keys: profile
    }, {
      exchange: exchangeName,
      target: interruptQueueName,
      keys: profile.map(task => task + '.interrupt')
    }]

    return taskerConfig
  },

  registerTasks: (profile, app: FabrixApp, rabbit) => {
    profile.forEach(taskName => {
      app.tasker.active_tasks.set(taskName, [])
      Utils.registerRun(taskName, app, rabbit)
      Utils.registerInterrupt(taskName, app, rabbit)
    })
  },

  /**
   * Removes the handlers from Client.active_tasks
   */
  clearHandler: (activeTasks, task) => {
    // remove the task from the taskerClient handlers list
    remove(activeTasks, activeTask => {
      return task.id = activeTask.id
    })
  },

  registerInterrupt: (taskName, app: FabrixApp, rabbit) => {
    rabbit.handle(`${taskName}.interrupt`, message => {
      const taskId = message.body.taskId
      const activeTasks = app.tasker.active_tasks.get(taskName) || []
      const task = find(activeTasks, activeTask => {
        return activeTask.id = taskId
      })

      if (!task) {
        app.log.info('Failed to interrupt task, no active handler found for task ' +
          taskName + ' and id ' + taskId)
        return message.reject()
      }

      return task.interrupt(message)
    })
  },

  registerRun: (taskName, app: FabrixApp, rabbit) => {
    const taskerClient = app.tasker
    // set up the task handler
    //
    rabbit.handle(taskName, message => {
      if (!app.api.tasks[taskName]) {
        app.log.error(`No task defined for task name: ${taskName}. Message body was:` +
          `${JSON.stringify(message.body)}`)
        return message.reject()
      }

      const task = new app.api.tasks[taskName](app, message)
      // add the current task type into the list of active tasks,
      // so we know who should handle an interrupt call
      taskerClient.active_tasks.get(taskName).push(task)

      return Promise.resolve()
        .then(() => {
          return task.run()
        })
        .catch(err => {
          app.log.info(`Error in task.run() for task ${taskName}`, err)
          return task.reject()
        })
        .then(() => {
          return task.finalize()
            .then(() => {
              return Utils.clearHandler(taskerClient.active_tasks.get(taskName), task)
            })
            .catch(() => {
              return Utils.clearHandler(taskerClient.active_tasks.get(taskName), task)
            })
        })
    })
  }
}
