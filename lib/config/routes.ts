import * as joi from 'joi'
export const routes = {
  '/events': {
    'GET': 'EventController.findAll',
    config: {
      prefix: 'engine.prefix',
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          where: joi.object(),
          sort: joi.array().items(joi.array()),
        }
      },
      app: {
        permissions: {
          resource_name: 'apiGetEventsRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/event': {
    'POST': 'EventController.create',
    config: {
      prefix: 'engine.prefix',
      app: {
        permissions: {
          resource_name: 'apiPostEventRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/event/:id': {
    'GET': 'EventController.findOne',
    config: {
      prefix: 'engine.prefix',
      validate: {
        params: {
          id: joi.string().required()
        }
      },
      app: {
        permissions: {
          resource_name: 'apiGetEventIdRoute',
          roles: ['admin']
        }
      }
    }
  }
}
