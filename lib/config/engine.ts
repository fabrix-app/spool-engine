/**
 * Engine Configuration
 *
 * @see {@link http://
 */
export const engine = {
  prefix: null,
  live_mode: true,
  auto_save: false,
  profile: process.env.ENGINE_PROFILE || null,
  crons_config: {
    enabled: true,
    auto_schedule: true,
    uptime_delay: process.env.ENGINE_CRON_UPTIME_DELAY || 0,
    profiles: {}
  },
  events_config: {
    enabled: true,
    auto_subscribe: true,
    profiles: {}
  },
  tasks_config: {
    enabled: true,
    auto_queue: true,
    connection: {
      // optional, defaults to `tasks-work-x`
      exchange: process.env.ENGINE_TASK_EXCHANGE,
      // optional, defaults to `tasks-work-q`
      work_queue_name: process.env.ENGINE_TASK_WORK_QUEUE,
      // optional, defaults to `tasks-interrupt-q`
      interrupt_queue_name: process.env.ENGINE_TASK_INTERRUPT_QUEUE,

      /**
       * The RabbitMQ connection information.
       * See: https://www.rabbitmq.com/uri-spec.html
       */
      host: process.env.ENGINE_TASK_RMQ_HOST,
      user: process.env.ENGINE_TASK_RMQ_USER,
      pass: process.env.ENGINE_TASK_RMQ_PASS,
      port: process.env.ENGINE_TASK_RMQ_PORT,
      vhost: process.env.ENGINE_TASK_RMQ_VHOST,

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
    },
    profiles: {}
  }
}
