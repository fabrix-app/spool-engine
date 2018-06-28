/**
 * Engine Configuration
 *
 * @see {@link http://
 */
export const engine = {
  /**
   * If transactions are production
   */
  live_mode: process.env.LIVE_MODE || true,

  /**
   * If every event should be saved automatically in the database
   */
  auto_save: process.env.AUTO_SAVE || false,

  /**
   * Set profile to subscribe to crons, events, or tasks in the matching profile (engine.<type>.profiles).
   * If process.env.PROFILE does not match a profile, the application will not subscribe to any crons, events, or tasks
   */
  profile: process.env.ENGINE_PROFILE,

  /**
   * The config for cron workers
   */
  crons_config: {
    /**
     * Whether to run the schedule method on every Cron Class
     */
    auto_schedule: true,
    /**
     * Delay when crons will start running.
     */
    uptime_delay: process.env.CRON_UPTIME_DELAY || 0,
    /**
     * Define worker profiles. Each profile of a given type listens for the
     * "crons" defined in its profile below. The cron names represent a Cron
     * defined in api.crons.
     * You can set these per environment in config/env
     * engine: { crons_config: { profiles: ... } }
     */
    profiles: {}
  },

  /**
   * The config for event workers
   */
  events_config: {
    /**
     * Whether to run the subscribe method on every Event class
     */
    auto_subscribe: true,
    /**
     * Define worker profiles. Each profile of a given type listens for the
     * "events" defined in its profile below. The event names represent an Event
     * defined in api.events.
     * You can set these per environment in config/env
     * engine: { events_config: { profiles: ... } }
     */
    profiles: {}
  },

  /**
   * The config for task workers
   */
  tasks_config: {
    /**
     * Whether to run the que method on Every Task class
     */
    auto_que: true,
    /**
     * Define worker profiles. Each profile of a given type listens for the
     * "tasks" defined in its profile below. The task names represent a Task
     * defined in api.tasks.
     * You can set these per environment in config/env
     * engine: { tasks_config: { profiles: ... } }
     */
    profiles: {},
    /**
     * Deine the connection for RabbitMQ
     */
    connection: {
      exchange: process.env.TASK_EXCHANGE, // optional, defaults to `tasks-work-x`
      work_queue_name: process.env.TASK_WORK_QUEUE, // optional, defaults to `tasks-work-q`
      interrupt_queue_name: process.env.TASK_INTERRUPT_QUEUE, // optional, defaults to `tasks-interrupt-q`

      /**
       * The RabbitMQ connection information.
       * See: https://www.rabbitmq.com/uri-spec.html
       */
      host: process.env.TASK_RMQ_HOST,
      user: process.env.TASK_RMQ_USER,
      pass: process.env.TASK_RMQ_PASS,
      port: process.env.TASK_RMQ_PORT,
      vhost: process.env.TASK_RMQ_VHOST,

      /**
       * Connection information could also be passed via uri
       */
      uri: process.env.RMQ_URI,

      /**
       * Additional, optional connection options (default values shown)
       */
      heartbeat: 30,
      timeout: null, // this is the connection timeout (in milliseconds, per connection attempt), and there is no default
      failAfter: 60, // limits how long rabbot will attempt to connect (in seconds, across all connection attempts). Defaults to 60
      retryLimit: 3, // limits number of consecutive failed attempts
    }
  }
}
