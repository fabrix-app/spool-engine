// tslint:disable no-shadowed-variable
/*
 Copyright (c) 2010,2011,2012,2013,2014 Morgan Roderick http://roderick.dk
 License: MIT - http://mrgnrdrck.mit-license.org
 https://github.com/mroderick/PubSubJS
 Modified for Engine by Scott Wyatt
 */
(function (root, factory) {

  const PubSub = {}
  root.PubSub = PubSub
  factory(PubSub)

  if (typeof exports === 'object') {
    if (module !== undefined && module.exports) {
      exports = module.exports = PubSub // Node.js specific `module.exports`
    }
    exports.PubSub = PubSub // CommonJS module 1.1.1 spec
    module.exports = exports = PubSub // CommonJS
  }

}(this, function (PubSub) {
  'use strict'

  let messages = {},
    lastUid = -1

  function hasKeys(obj) {
    let key

    for (key in obj) {
      if ( obj.hasOwnProperty(key)) {
        return true
      }
    }
    return false
  }

  /**
   *	Returns a function that throws the passed exception, for use as argument for setTimeout
   *	@param { Object } ex An Error object
   */
  function throwException( ex ) {
    return function reThrowException() {
      throw ex
    }
  }

  function callSubscriberWithDelayedExceptions( subscriber, message, data, options ) {
    try {
      subscriber( message, data, options )
    }
    catch ( ex ) {
      setTimeout( throwException( ex ), 0)
    }
  }

  function callSubscriberWithImmediateExceptions( subscriber, message, data, options ) {
    subscriber( message, data, options )
  }

  function deliverMessage( originalMessage, matchedMessage, data, options, immediateExceptions ) {
    let subscribers = messages[matchedMessage],
      callSubscriber = immediateExceptions ? callSubscriberWithImmediateExceptions : callSubscriberWithDelayedExceptions,
      s

    if ( !messages.hasOwnProperty( matchedMessage ) ) {
      return
    }

    for (s in subscribers) {
      if ( subscribers.hasOwnProperty(s)) {
        callSubscriber( subscribers[s], originalMessage, data, options )
      }
    }
  }

  function createDeliveryFunction( message, data, options, immediateExceptions ) {
    return function deliverNamespaced() {
      let topic = String( message ),
        position = topic.lastIndexOf( '.' )

      // deliver the message as it is now
      deliverMessage(message, message, data, options, immediateExceptions )

      // trim the hierarchy and deliver message to each level
      while ( position !== -1 ) {
        topic = topic.substr( 0, position )
        position = topic.lastIndexOf('.')
        deliverMessage( message, topic, data, options, immediateExceptions )
      }
    }
  }

  function messageHasSubscribers( message ) {
    let topic = String( message ),
      found = Boolean(messages.hasOwnProperty( topic ) && hasKeys(messages[topic])),
      position = topic.lastIndexOf( '.' )

    while ( !found && position !== -1 ) {
      topic = topic.substr( 0, position )
      position = topic.lastIndexOf( '.' )
      found = Boolean(messages.hasOwnProperty( topic ) && hasKeys(messages[topic]))
    }

    return found
  }

  function publish( message, data, options, sync, immediateExceptions ) {
    let deliver = createDeliveryFunction( message, data, options, immediateExceptions ),
      hasSubscribers = messageHasSubscribers( message )

    if ( !hasSubscribers ) {
      return false
    }

    if ( sync === true ) {
      deliver()
    }
    else {
      setTimeout( deliver, 0 )
    }
    return true
  }

  /**
   *	PubSub.publish( message[, data, options] ) -> Boolean
   *  - message (String): The message to publish
   *  - data: The data to pass to subscribers
   *  - options: the options to pass
   *	Publishes the the message, passing the data to it's subscribers
   **/
  PubSub.publish = function( message, data, options ) {
    options = options || {}
    return publish( message, data, options, false, PubSub.immediateExceptions )
  }

  /**
   *	PubSub.publishSync( message[, data] ) -> Boolean
   *	- message (String): The message to publish
   *	- data: The data to pass to subscribers
   *	Publishes the the message synchronously, passing the data to it's subscribers
   **/
  PubSub.publishSync = function( message, data, options ) {
    options = options || {}
    return publish( message, data, options, true, PubSub.immediateExceptions )
  }

  /**
   *	PubSub.subscribe( message, func ) -> String
   *	- message (String): The message to subscribe to
   *	- func (Function): The function to call when a new message is published
   *	Subscribes the passed function to the passed message. Every returned token is unique and should be stored if
   *	you need to unsubscribe
   **/
  PubSub.subscribe = function( message, func ) {
    if ( typeof func !== 'function') {
      return false
    }

    // message is not registered yet
    if ( !messages.hasOwnProperty( message ) ) {
      messages[message] = {}
    }

    // forcing token as String, to allow for future expansions without breaking usage
    // and allow for easy use as key names for the 'messages' object
    const token = 'uid_' + String(++lastUid)
    messages[message][token] = func

    // return token for unsubscribing
    return token
  }

  /* Public: Clears all subscriptions
   */
  PubSub.clearAllSubscriptions = function clearAllSubscriptions() {
    messages = {}
  }

  PubSub.getMessages = function getMessages() {
    return messages
  }

  /*Public: Clear subscriptions by the topic
   */
  PubSub.clearSubscriptions = function clearSubscriptions(topic) {
    for (const m in messages) {
      if (messages.hasOwnProperty(m) && m.indexOf(topic) === 0) {
        delete messages[m]
      }
    }
  }

  /* Public: removes subscriptions.
   * When passed a token, removes a specific subscription.
   * When passed a function, removes all subscriptions for that function
   * When passed a topic, removes all subscriptions for that topic (hierarchy)
   *
   * value - A token, function or topic to unsubscribe.
   *
   * Examples
   *
   *		// Example 1 - unsubscribing with a token
   *		var token = PubSub.subscribe('mytopic', myFunc);
   *		PubSub.unsubscribe(token);
   *
   *		// Example 2 - unsubscribing with a function
   *		PubSub.unsubscribe(myFunc);
   *
   *		// Example 3 - unsubscribing a topic
   *		PubSub.unsubscribe('mytopic');
   */

  PubSub.unsubscribe = function(value) {
    let descendantTopicExists = function(topic) {
        let m
        for (m in messages ) {
          if ( messages.hasOwnProperty(m) && m.indexOf(topic) === 0 ) {
            // a descendant of the topic exists:
            return true
          }
        }
        return false
      },
      isTopic    = typeof value === 'string' && ( messages.hasOwnProperty(value) || descendantTopicExists(value) ),
      isToken    = !isTopic && typeof value === 'string',
      isFunction = typeof value === 'function',
      result = false,
      m, message, t

    if (isTopic) {
      PubSub.clearSubscriptions(value)
      return
    }

    for ( m in messages ) {
      if ( messages.hasOwnProperty( m ) ) {
        message = messages[m]

        if ( isToken && message[value] ) {
          delete message[value]
          result = value
          // tokens are unique, so we can just stop here
          break
        }

        if (isFunction) {
          for ( t in message ) {
            if (message.hasOwnProperty(t) && message[t] === value) {
              delete message[t]
              result = true
            }
          }
        }
      }
    }

    return result
  }
}))
