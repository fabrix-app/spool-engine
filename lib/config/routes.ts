import * as joi from 'joi'
export const routes = [
  {
    method: ['GET'],
    path: '/events',
    handler: 'EventController.findAll',
    config: {
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
  {
    method: ['POST'],
    path: '/event',
    handler: 'EventController.create',
    config: {
      app: {
        permissions: {
          resource_name: 'apiPostEventRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/event/:id',
    handler: 'EventController.findOne',
    config: {
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
]
