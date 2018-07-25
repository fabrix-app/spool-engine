'use strict'
/* global describe, it */
const assert = require('assert')

describe('EngineService', () => {
  let eventID
  let token
  it('should exist', () => {
    assert(global.app.api.services['EngineService'])
  })
  it('should create event', (done) => {
    global.app.services.EngineService.resolveEvent(
      {
        object: 'user',
        data: {
          email: 'example@example.com'
        },
        message: 'User Created',
        type: 'user.created'
      }
    )
      .then(event => {
        // console.log(event)
        eventID = event.id
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should publish an event', (done) => {
    try {
      global.app.services.EngineService.publish('test1','hello', {hello: 'world'})
      done()
    }
    catch (err) {
      done(err)
    }
  })
  it('should subscribe to an event', (done) => {
    try {
      token = global.app.services.EngineService.subscribe('test2','hello', function( msg, data ){
        console.log('SUBSCRIBED:', msg, data)
        assert.equal(msg,'hello')
        assert.equal(data.hello, 'world')
        done()
      })
      global.app.services.EngineService.publish('hello', {hello: 'world'})
    }
    catch (err) {
      done(err)
    }
  })
  it('should unsubscribe to an event', (done) => {
    try {
      global.app.services.EngineService.unsubscribe(token)
      done()
    }
    catch (err) {
      done(err)
    }
  })
  it('should handle event subscription err', (done) => {
    try {
      token = global.app.services.EngineService.subscribe('test3', 'hello', function( msg, data, options ) {
        console.log('SUBSCRIBED:', msg, data, options)
        assert.equal(msg, 'hello')
        assert.equal(data.hello, 'world')
        assert.equal(options.test, 'test')

        if (msg == 'hello') {
          throw new Error('I broke')
        }
      })
      global.app.services.EngineService.publish('hello', {hello: 'world'}, {test: 'test'})
      setTimeout(function(){
        done()
      }, 50)
    }
    catch (err) {
      done(err)
    }
  })
  it('should do correct pagination page 1', (done) => {
    const count = 100
    const offset = 0
    const limit = 10

    const page = Math.round(((offset + limit) / limit))
    assert.equal(page, 1)
    done()
  })
  it('should do correct pagination page 10', (done) => {
    const count = 100
    const offset = 100
    const limit = 10

    const page = Math.round(((offset + limit) / limit))
    assert.equal(page, 11)
    done()
  })
  it('should do correct pagination page 2', (done) => {
    const count = 100
    const offset = 10
    const limit = 10

    const page = Math.round(((offset + limit) / limit))
    assert.equal(page, 2)
    done()
  })
})
