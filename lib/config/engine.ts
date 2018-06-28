/**
 * Engine Configuration
 *
 * @see {@link http://
 */
export const engine = {
  live_mode: true,
  auto_save: false,
  profile: process.env.ENGINE_PROFILE || null,
  crons_config: {
    auto_schedule: true,
    uptime_delay: process.env.CRON_UPTIME_DELAY || 0
  },
  events_config: {
    auto_subscribe: true
  },
  tasks_config: {
    auto_que: true,
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
