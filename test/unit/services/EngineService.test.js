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
  it('should do stringify sort', (done) => {
    const sort = [['created_at','ASC']]
    const s = global.app.services.EngineService.sortToString(sort)
    console.log('STRING', s)
    done()
  })
  it('should do stringify a bad sort', (done) => {
    const sort = []
    const s = global.app.services.EngineService.sortToString(sort)
    console.log('STRING', s)
    done()
  })
  it('should merge includes', (done) => {
    const newOptions = global.app.services.EngineService.mergeOptionDefaults({
      include: [{ model: 'hello' }]
    }, {
      include: [{ model: 'world'}]
    })
    assert.equal(newOptions.include.length, 2)
    assert.equal(newOptions.include[0].model, 'hello')
    assert.equal(newOptions.include[1].model, 'world')
    done()
  })
  it('should merge duplicate includes', (done) => {
    const newOptions = global.app.services.EngineService.mergeOptionDefaults({
      include: [{ model: 'hello', as: 'world' }]
    }, {
      include: [{ model: 'hello', as: 'world' }]
    })
    assert.equal(newOptions.include.length, 1)
    assert.equal(newOptions.include[0].model, 'hello')
    done()
  })
  it('should merge includes with same model', (done) => {
    const newOptions = global.app.services.EngineService.mergeOptionDefaults({
      include: [{ model: 'hello', as: 'world' }]
    }, {
      include: [{ model: 'hello', as: 'planet' }]
    })
    assert.equal(newOptions.include.length, 2)
    assert.equal(newOptions.include[0].model, 'hello')
    assert.equal(newOptions.include[1].model, 'hello')
    done()
  })
  it('should merge order and fix incorrect instances', (done) => {
    const newOptions = global.app.services.EngineService.mergeOptionDefaults({
      order: [['created_at','ASC']]
    }, {
      order: 'updated_at DESC'
    })
    assert.equal(newOptions.order.length, 2)
    done()
  })
  it('should merge wheres', (done) => {
    const newOptions = global.app.services.EngineService.mergeOptionDefaults({
      where: { name: 'hello'}
    }, {
      where: { created_at: 'now' }
    })
    assert.equal(newOptions.where.name, 'hello')
    assert.equal(newOptions.where.created_at, 'now')
    done()
  })
  it('should merge limit', (done) => {
    const newOptions = global.app.services.EngineService.mergeOptionDefaults({
      limit: null
    }, {
      limit: 10
    })
    assert.equal(newOptions.limit, 10)
    done()
  })
  it('should merge offset', (done) => {
    const newOptions = global.app.services.EngineService.mergeOptionDefaults({
      offset: null
    }, {
      offset: 10
    })
    assert.equal(newOptions.offset, 10)
    done()
  })
  it('should merge with unknown variables', (done) => {
    const newOptions = global.app.services.EngineService.mergeOptionDefaults({
      hello: 'world'
    }, {})
    assert.equal(newOptions.hello, 'world')
    done()
  })
})
