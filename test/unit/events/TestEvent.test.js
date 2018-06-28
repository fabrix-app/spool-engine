'use strict'
/* global describe, it */
const assert = require('assert')

describe('Event', () => {
  it('should exist', () => {
    assert(global.app.api.events)
    assert(global.app.events)
  })
  it('should have the events from profile testProfile', done => {
    assert(global.app.api.events.onAutoTestEvent)
    assert(global.app.api.events.onTestEvent)
    assert(global.app.api.events.onNotTestEvent)

    assert.equal(typeof global.app.events.onAutoTestEvent.test, 'function')
    assert.equal(typeof global.app.events.onAutoTestEvent.test2, 'function')

    assert.equal(typeof global.app.events.onTestEvent.test3, 'function')
    assert.equal(typeof global.app.events.onTestEvent.test4, 'function')

    assert.equal(typeof global.app.events.onNotTestEvent.test5, 'function')
    assert.equal(typeof global.app.events.onNotTestEvent.test6, 'function')

    done()
  })
  it('should get events onAutoTestEvent', done => {
    assert.equal(global.app.events.onAutoTestEvent.events.length, 2)
    done()
  })
  it('should get subscribers onAutoTestEvent', done => {
    assert.equal(global.app.events.onAutoTestEvent.subscribers.length, 2)
    done()
  })
  it('should get subscribed listeners onAutoTestEvent', done => {
    assert.equal(global.app.events.onAutoTestEvent.subscribed.length, 2)
    done()
  })
  it('should get events onTestEvent', done => {
    assert.equal(global.app.events.onTestEvent.events.length, 2)
    done()
  })
  it('should get subscribers onTestEvent', done => {
    assert.equal(global.app.events.onTestEvent.subscribers.length, 2)
    done()
  })
  it('should get subscribed listeners onTestEvent', done => {
    assert.equal(global.app.events.onTestEvent.subscribed.length, 2)
    done()
  })
  it('should get events onNotTestEvent', done => {
    assert.equal(global.app.events.onNotTestEvent.events.length, 2)
    done()
  })
  it('should get subscribers onNotTestEvent', done => {
    assert.equal(global.app.events.onNotTestEvent.subscribers.length, 0)
    done()
  })
  it('should get subscribed listeners onNotTestEvent', done => {
    assert.equal(global.app.events.onNotTestEvent.subscribed.length, 0)
    done()
  })
  it('should publish an event to onAutoTestEvent.test', done => {
    try {
      global.app.services.EngineService.publish('test', {test: 'test'}, {done: done})
    }
    catch (err) {
      done(err)
    }
  })
  it('should publish an event to onAutoTestEvent.test2', done => {
    try {
      global.app.services.EngineService.publish('test2', {test: 'test2'}, {done: done})
    }
    catch (err) {
      done(err)
    }
  })
  it('should publish an event to onTestEvent.test3', done => {
    try {
      global.app.services.EngineService.publish('test3', {test: 'test3'}, {done: done})
    }
    catch (err) {
      done(err)
    }
  })
  it('should publish an event to onTestEvent.test4', done => {
    try {
      global.app.services.EngineService.publish('test4', {test: 'test4'}, {done: done})
    }
    catch (err) {
      done(err)
    }
  })
  it('should not publish an event to onNotTestEvent.test5', done => {
    try {
      global.app.services.EngineService.publish('test5', {test: 'test5'}, {done: done})
      done()
    }
    catch (err) {
      done(err)
    }
  })
  it('should not publish an event to onNotTestEvent.test6', done => {
    try {
      global.app.services.EngineService.publish('test6', {test: 'test6'}, {done: done})
      done()
    }
    catch (err) {
      done(err)
    }
  })
})
