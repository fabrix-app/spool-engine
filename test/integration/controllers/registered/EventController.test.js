'use strict'
/* global describe, it */
const assert = require('assert')

describe('EventController', () => {
  it('should exist', () => {
    assert(global.app.api.controllers['EventController'])
  })
})
