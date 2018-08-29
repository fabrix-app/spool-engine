import { FabrixApp } from '@fabrix/fabrix'

const CronProxyHandler = {

  get (target, key, args) {
    // Methods that extend the Cron Class
    const allowedMethods = target.methods ? target.methods : []
    const unallowedMethods = [
      'cancel',
      'cancelNext',
      'freeze',
      'findJobByName',
      'nextInvocation',
      'reschedule',
      'unfreeze',
      ...target.unallowedMethods
    ]
    if (
      target.immutable === true
      && target.timeTilStart > 0
      && allowedMethods.indexOf(key) > -1
      // Methods that are reserved
      && unallowedMethods.indexOf(key) === -1
    ) {
      // Log to debug that the cron is being delayed
      target.app.log.debug(`Cron ${target.name}.${key} start delayed by ${ target.timeTilStart / 1000} seconds`)

      return function() {
        return setTimeout(function () {
          // Log to debug that the cron has now started
          target.app.log.debug(`Cron ${target.name}.${key} started`)
          return target[key](args)
        }, target.timeTilStart)
      }
    }
    else {
      return target[key]
    }
  }
}

export class Cron {
  public app
  public scheduler
  private _uptime_delay
  private _uptime

  public unallowedMethods: string[] = [

  ]

  constructor (app: FabrixApp) {
    Object.defineProperties(this, {
      app: {
        enumerable: false,
        value: app
      },
      scheduler: {
        enumerable: false,
        value: app.scheduler
      },
      _uptime: {
        enumerable: false,
        value: process.uptime(),
        writable: false
      },
      _uptime_delay: {
        enumerable: false,
        value: app.config.get('engine.crons_config.uptime_delay') || 0,
        writable: false
      },
      /**
       * Cancels a job
       * @param job
       */
      cancel: {
        enumerable: false,
        value: function(job) {
          if (typeof job === 'string') {
            job = this.findJobByName(job)
            return job.cancel()
          }
          else {
            return job.cancel()
          }
        },
        writable: true
      },
      /**
       * Cancels the next run of a job
       * @param job
       * @param reschedule
       */
      cancelNext: {
        enumerable: false,
        value: function(job, reschedule) {
          if (typeof job === 'string') {
            job = this.findJobByName(job)
            return job.cancelNext(reschedule)
          }
          else {
            return job.cancelNext(reschedule)
          }
        },
        writable: true
      },
      /**
       * Reschedules a job
       * @param job
       * @param spec
       */
      reschedule: {
        enumerable: false,
        value: function(job, spec) {
          if (typeof job === 'string') {
            job = this.findJobByName(job)
            return job.reschedule(spec)
          }
          else {
            return job.reschedule(spec)
          }
        },
        writable: true
      },
      /**
       * Get the next time a job will be run
       * @param job
       */
      nextInvocation: {
        enumerable: false,
        value: function(job) {
          if (typeof job === 'string') {
            job = this.findJobByName(job)
            return job.nextInvocation()
          }
          else {
            return job.nextInvocation()
          }
        },
        writable: true
      },
      /**
       * If the Cron is now immutable
       */
      immutable: {
        enumerable: false,
        value: false,
        writable: true
      },
      /**
       * Freezes the immutability of the cron
       */
      freeze: {
        enumerable: false,
        value: function() {
          this.immutable = true
        },
        writable: true
      },
      /**
       * Unfreezes the immutability of the cron
       */
      unfreeze: {
        enumerable: false,
        value: function() {
          this.immutable = false
        },
        writable: true
      },
      /**
       * Finds a job by name
       * @param name
       */
      findJobByName: {
        enumerable: false,
        value: function (name) {
          return this.scheduledJobs.find(job => job.name === name)
        },
        writable: true
      }
    })

    return new Proxy(this, CronProxyHandler)
  }

  /**
   * Return the id of this cron
   */
  get id () {
    return this.constructor.name.replace(/(\w+)Cron/, '$1').toLowerCase()
  }

  /**
   * Get's the name of the cron class
   */
  get name() {
    return this.constructor.name
  }

  /**
   * Get's the scheduled jobs of this cron class
   * @returns {Array}
   */
  get scheduledJobs() {
    const jobs = []
    if (this.scheduler) {
      for (const j in this.scheduler.scheduledJobs) {
        if (this.scheduler.scheduledJobs.hasOwnProperty(j)) {
          const job = this.scheduler.scheduledJobs[j]
          if (job.name && job.name.includes(this.name)) {
            jobs.push(job)
          }
        }
      }
    }
    return jobs
  }

  /**
   * returns milliseconds before cron jobs are allowed to start running.
   * @returns {number}
   */
  get timeTilStart() {
    return Math.max(0, (this._uptime_delay * 1000) - (this._uptime * 1000))
  }
}
