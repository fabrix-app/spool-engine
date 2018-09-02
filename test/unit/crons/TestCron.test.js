'use strict'
/* global describe, it */
const assert = require('assert')
const _ = require('lodash')

describe('Cron', () => {
  it('should exist', () => {
    assert(global.app.crons)
    assert(global.app.api.crons)
  })
  it('should have the crons from profile testProfile', done => {
    assert(global.app.api.crons.onAutoTestCron)
    assert.equal(global.app.crons.onAutoTestCron.id, 'onautotest')
    assert.equal(_.isNumber(global.app.crons.onAutoTestCron.timeTilStart), true)
    assert(global.app.api.crons.onTestCron)
    assert.equal(global.app.crons.onTestCron.id, 'ontest')
    assert.equal(_.isNumber(global.app.crons.onTestCron.timeTilStart), true)
    assert(global.app.api.crons.onNotTestCron)
    assert.equal(global.app.crons.onNotTestCron.id, 'onnottest')
    assert.equal(_.isNumber(global.app.crons.onNotTestCron.timeTilStart), true)

    assert.equal(typeof global.app.crons.onAutoTestCron.test, 'function')

    assert.equal(typeof global.app.crons.onAutoTestCron.test2, 'function')

    assert.equal(typeof global.app.crons.onTestCron.test, 'function')
    assert.equal(typeof global.app.crons.onTestCron.test2, 'function')

    assert.equal(typeof global.app.crons.onNotTestCron.test, 'function')
    assert.equal(typeof global.app.crons.onNotTestCron.test2, 'function')

    done()
  })
  it('should have time remaining until start', done => {
    // we are giving a 10 millisecond lead time here, because this is short and fast.
    if (global.app.crons.onAutoTestCron.timeTilStart > 100) {
      console.log(
        'TEST HERE WAITING',
        global.app.crons.onAutoTestCron.scheduledJobs.length,
        global.app.crons.onAutoTestCron.timeTilStart
      )
      // assert.equal(global.app.crons.onAutoTestCron.scheduledJobs.length, 0)
    }
    else {
      console.log('TEST HERE DONE', global.app.crons.onAutoTestCron.scheduledJobs.length)
      assert.equal(global.app.crons.onAutoTestCron.scheduledJobs.length, 2)
    }
    done()
  })
  it('should get jobs that are scheduled now', done => {
    // The delay in app.engine.crons_config.uptime_delay is 1 second, so let's wait that long
    setTimeout( function() {
      assert.equal(global.app.crons.onAutoTestCron.scheduledJobs.length, 2)
      done()
    }, 1000)
  })
  it('should find a job by name', done => {
    // assert.notEqual(global.app.crons.onAutoTestCron.scheduledJobs.length, 0)
    const job = global.app.crons.onAutoTestCron.findJobByName('onAutoTestCron.test')
    assert.equal(job.name, 'onAutoTestCron.test')
    done()
  })
  it('should get nextInvocation by Job name', done => {
    const job = global.app.crons.onAutoTestCron.nextInvocation('onAutoTestCron.test')
    assert.ok(job)
    done()
  })
  it('should cancel a job', done => {
    const job = global.app.crons.onAutoTestCron.findJobByName('onAutoTestCron.test')
    assert.equal(job.cancel(), true)
    done()
  })
  it('should cancel a job through class', done => {
    // assert.notEqual(global.app.crons.onAutoTestCron.scheduledJobs.length, 0)
    const job = global.app.crons.onAutoTestCron.findJobByName('onAutoTestCron.test2')
    assert.equal(global.app.crons.onAutoTestCron.cancel(job), true)
    done()
  })
  it('should cancel the next job', done => {
    // assert.notEqual(global.app.crons.onAutoTestCron.scheduledJobs.length, 0)
    const job = global.app.crons.onTestCron.findJobByName('onTestCron.test')
    assert.equal(job.cancelNext(), true)
    done()
  })
  it('should cancel next job through class', done => {
    // assert.notEqual(global.app.crons.onAutoTestCron.scheduledJobs.length, 0)
    const job = global.app.crons.onTestCron.findJobByName('onTestCron.test2')
    assert.equal(global.app.crons.onAutoTestCron.cancelNext(job), true)
    done()
  })
})
