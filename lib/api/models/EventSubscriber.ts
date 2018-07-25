import { FabrixApp } from '@fabrix/fabrix'
import { FabrixModel as Model } from '@fabrix/fabrix/dist/common'
import { SequelizeResolver } from '@fabrix/spool-sequelize'

import * as _ from 'lodash'
import { EVENT_SUBSCRIBER_STATUS } from '../../enums/index'

/**
 * @module EventSubscriber
 * @description Event Subscriber
 */
export class EventSubscriber extends Model {

  static config (app, Sequelize?): {[key: string]: any} {
    return {
      options: {
        underscored: true
      }
    }
  }

  static schema (app, Sequelize?): {[key: string]: any} {
    return {
      // The event ID this is bound too.
      // event_id: {
      //   type: Sequelize.INTEGER,
      //   // references: {
      //   //   model: 'Event',
      //   //   key: 'id'
      //   // },
      //   unique: 'subscriberUniqueKey'
      // },
      request: {
        type: Sequelize.STRING,
        // references: {
        //   model: 'Event',
        //   key: 'request'
        // },
        unique: 'subscriberUniqueKey'
      },
      // The name of the subscriber in dot syntax eg. proxyCart.subscribers.new.customer
      name: {
        type: Sequelize.STRING,
        notNull: false,
        unique: 'subscriberUniqueKey'
      },
      // The response from the the subscriber
      response: {
        type: Sequelize.TEXT
      },
      // The amount of attempts made by the event subscriber
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // The last attempt timestamp for the event subscriber
      last_attempt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      // The current status of the event subscriber
      status: {
        type: Sequelize.ENUM,
        values: _.values(EVENT_SUBSCRIBER_STATUS),
        defaultValue: EVENT_SUBSCRIBER_STATUS.PENDING
      }
    }
  }

  public static get resolver () {
    return SequelizeResolver
  }

  /**
   * Associate the Model
   * @param models
   */
  public static associate (models) {
    models.EventSubscriber.belongsTo(models.Event, {
      // onDelete: 'CASCADE'
      // unique: 'subscriberUniqueKey'
    })
  }
}
