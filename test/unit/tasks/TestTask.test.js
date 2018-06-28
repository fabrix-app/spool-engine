'use strict'
/* global describe, it */
const assert = require('assert')

describe('Task', () => {
  it.skip('should exist', () => {
    assert(global.app.api.tasks)
    assert(global.app.tasks)
  })
})
