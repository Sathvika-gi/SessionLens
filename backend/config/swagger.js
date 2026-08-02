const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SessionLens API',
      description: 'AI-powered browser activity monitoring and session intelligence API.',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      }
    ],
    components: {
      schemas: {
        BrowserEvent: {
          type: 'object',
          required: ['url', 'title', 'timestamp', 'eventType'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique database identifier of the browser event',
              example: '6a6f7dfbed4fc57872cc0235'
            },
            url: {
              type: 'string',
              description: 'The URL of the webpage visited',
              example: 'https://react.dev/reference/react/useEffect'
            },
            title: {
              type: 'string',
              description: 'The title of the webpage',
              example: 'useEffect Reference Documentation - React Docs'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the event was recorded',
              example: '2026-08-02T16:57:23.317Z'
            },
            eventType: {
              type: 'string',
              description: 'The nature of the action event (e.g. url_updated, tab_activated)',
              example: 'url_updated'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-08-02T16:57:24.120Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-08-02T16:57:24.120Z'
            }
          }
        },
        Session: {
          type: 'object',
          required: ['sessionTitle', 'category', 'summary', 'startTime', 'endTime', 'duration'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique database identifier of the session',
              example: '6a6f7dffed4fc57872cc023b'
            },
            sessionTitle: {
              type: 'string',
              description: 'AI-generated session title capturing the core task',
              example: 'Learning React Hooks'
            },
            category: {
              type: 'string',
              description: 'AI-classified activity category',
              enum: ['Coding', 'Learning', 'Documentation', 'Research', 'Shopping', 'Entertainment', 'Meetings', 'Social Media', 'News', 'Other'],
              example: 'Coding'
            },
            summary: {
              type: 'string',
              description: 'A 1-2 sentence AI-generated summary of the session',
              example: 'The user explored React Hooks using documentation, GitHub, and ChatGPT.'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'AI-extracted keyword tags',
              example: ['React', 'Hooks', 'JavaScript']
            },
            relatedEvents: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'ObjectIDs of raw browser events clustered under this session',
              example: ['6a6f7dfbed4fc57872cc0235', '6a6f7dfbed4fc57872cc0237']
            },
            websitesVisited: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of unique domains visited during the session',
              example: ['react.dev', 'github.com', 'chatgpt.com']
            },
            startTime: {
              type: 'string',
              format: 'date-time',
              description: 'Start timestamp of the session',
              example: '2026-08-02T16:57:23.317Z'
            },
            endTime: {
              type: 'string',
              format: 'date-time',
              description: 'End timestamp of the session',
              example: '2026-08-02T17:07:23.317Z'
            },
            duration: {
              type: 'integer',
              description: 'Total session duration in milliseconds',
              example: 600000
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-08-02T17:27:27.277Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-08-02T17:27:27.277Z'
            }
          }
        },
        AISessionRequest: {
          type: 'object',
          required: ['events'],
          properties: {
            events: {
              type: 'array',
              items: {
                type: 'object',
                required: ['url', 'title', 'timestamp'],
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL of the browser event',
                    example: 'https://react.dev'
                  },
                  title: {
                    type: 'string',
                    description: 'Title of the webpage',
                    example: 'React Hooks'
                  },
                  timestamp: {
                    type: 'string',
                    format: 'date-time',
                    description: 'ISO-8601 Timestamp',
                    example: '2026-08-02T16:57:23.317Z'
                  },
                  eventType: {
                    type: 'string',
                    description: 'Type of event (tab_activated, url_updated, etc.)',
                    example: 'url_updated'
                  }
                }
              }
            }
          }
        },
        AISessionResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              $ref: '#/components/schemas/Session'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error description message',
              example: 'Resource not found'
            },
            error: {
              type: 'string',
              description: 'Internal system error trace details',
              example: 'Details of the exception error'
            }
          }
        }
      }
    }
  },
  apis: ['./config/swagger.js']
};

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Log a new browser activity event
 *     description: Stores a raw browser tab event (navigation, tab switch, tab creation) in the events database.
 *     tags:
 *       - Browser Events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - timestamp
 *               - eventType
 *             properties:
 *               url:
 *                 type: string
 *                 description: The URL of the webpage visited
 *                 example: https://react.dev
 *               title:
 *                 type: string
 *                 description: The title of the webpage
 *                 example: React Hooks
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: ISO-8601 Timestamp when event occurred
 *                 example: 2026-08-02T16:57:23.317Z
 *               eventType:
 *                 type: string
 *                 description: Action event identifier (tab_activated, url_updated, tab_closed)
 *                 example: url_updated
 *     responses:
 *       201:
 *         description: Event logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BrowserEvent'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 *   get:
 *     summary: Retrieve chronological list of browser events
 *     description: Returns a list of recently logged browser events, sorted with the newest events first.
 *     tags:
 *       - Browser Events
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of events to return
 *     responses:
 *       200:
 *         description: Successful retrieval of events list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BrowserEvent'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Retrieve chronological list of AI sessions
 *     description: Returns all structured browsing sessions generated by the AI processing layer, sorted by start time descending.
 *     tags:
 *       - Sessions
 *     responses:
 *       200:
 *         description: Successful retrieval of sessions list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *       550:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/sessions/{id}:
 *   get:
 *     summary: Retrieve details of a specific AI session
 *     description: Fetches a structured AI browsing session by its unique database ObjectID.
 *     tags:
 *       - Sessions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ObjectID of the session
 *     responses:
 *       200:
 *         description: Session details found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/ai/analyze-session:
 *   post:
 *     summary: Process browser events and generate AI session
 *     description: Receives a list of raw browser events, passes them to Google Gemini for classification, structures the timing metrics, and stores the resulting Session record in MongoDB.
 *     tags:
 *       - AI Sessionizer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AISessionRequest'
 *     responses:
 *       201:
 *         description: Session created and saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AISessionResponse'
 *       400:
 *         description: Missing or empty events array
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       502:
 *         description: Gemini API communication error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

const specs = swaggerJsdoc(options);
module.exports = specs;
