import morgan from 'morgan';
import { CloudWatchLogs } from 'aws-sdk';

const cloudWatchLogs = new CloudWatchLogs({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const LOG_GROUP = process.env.CLOUDWATCH_LOG_GROUP || 'spoken';
const LOG_STREAM = process.env.CLOUDWATCH_LOG_STREAM || 'app-logs';

class CloudWatchLogger {
  private buffer: any[] = [];
  private sequenceToken?: string;

  constructor() {
    this.initializeLogGroup();
    // Flush logs every 5 seconds
    setInterval(() => this.flush(), 5000);
  }

  private async initializeLogGroup() {
    try {
      // Create log group if it doesn't exist
      await cloudWatchLogs.createLogGroup({ logGroupName: LOG_GROUP }).promise();
    } catch (error: any) {
      if (error.code !== 'ResourceAlreadyExistsException') {
        console.error('Error creating log group:', error);
      }
    }

    try {
      // Create log stream if it doesn't exist
      await cloudWatchLogs.createLogStream({
        logGroupName: LOG_GROUP,
        logStreamName: LOG_STREAM,
      }).promise();
    } catch (error: any) {
      if (error.code !== 'ResourceAlreadyExistsException') {
        console.error('Error creating log stream:', error);
      }
    }

    // Get initial sequence token
    try {
      const result = await cloudWatchLogs.describeLogStreams({
        logGroupName: LOG_GROUP,
        logStreamNamePrefix: LOG_STREAM,
      }).promise();

      if (result.logStreams && result.logStreams[0]) {
        this.sequenceToken = result.logStreams[0].uploadSequenceToken;
      }
    } catch (error) {
      console.error('Error getting sequence token:', error);
    }
  }

  log(level: string, message: string, meta?: any) {
    const logEvent = {
      timestamp: Date.now(),
      message: JSON.stringify({
        level,
        message,
        meta,
        timestamp: new Date().toISOString(),
      }),
    };

    this.buffer.push(logEvent);

    // Flush immediately for errors
    if (level === 'error') {
      this.flush();
    }
  }

  private async flush() {
    if (this.buffer.length === 0) return;

    const events = [...this.buffer];
    this.buffer = [];

    try {
      const params: any = {
        logGroupName: LOG_GROUP,
        logStreamName: LOG_STREAM,
        logEvents: events,
      };

      if (this.sequenceToken) {
        params.sequenceToken = this.sequenceToken;
      }

      const result = await cloudWatchLogs.putLogEvents(params).promise();
      this.sequenceToken = result.nextSequenceToken;
    } catch (error) {
      console.error('Error sending logs to CloudWatch:', error);
      // Put events back in buffer to retry
      this.buffer = [...events, ...this.buffer];
    }
  }
}

const logger = new CloudWatchLogger();

export const morganMiddleware = morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.log('info', message.trim(), { source: 'morgan' });
    },
  },
});

export const log = {
  info: (message: string, meta?: any) => {
    console.log(message, meta);
    logger.log('info', message, meta);
  },
  warn: (message: string, meta?: any) => {
    console.warn(message, meta);
    logger.log('warn', message, meta);
  },
  error: (message: string, meta?: any) => {
    console.error(message, meta);
    logger.log('error', message, meta);
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(message, meta);
    }
    logger.log('debug', message, meta);
  },
};

export default logger;