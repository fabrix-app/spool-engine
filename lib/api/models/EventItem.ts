import { FabrixApp } from '@fabrix/fabrix'
import { FabrixModel as Model } from '@fabrix/fabrix/dist/common'

/**
 * @module EventItem
 * @description Event Item Join Table
 */
export class EventItem extends Model {

  static config (app: FabrixApp, Sequelize?): {[key: string]: any} {
    return {
      options: {
        underscored: true
      }
    }
  }

  static schema (app: FabrixApp, Sequelize?): {[key: string]: any} {
    return {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      event_id: {
        type: Sequelize.INTEGER,
        unique: 'event_object',
        notNull: true
      },
      object: {
        type: Sequelize.STRING,
        unique: 'event_object'
      },
      object_id: {
        type: Sequelize.INTEGER,
        unique: 'event_object',
        notNull: true,
        references: null
      }
    }
  }

  /**
   * Associate the Model
   * @param models
   */
  associate (models) {
    models.EventItem.belongsTo(models.Event, {

    })
  }
}
