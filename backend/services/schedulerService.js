const cron = require('node-cron');
const cartAbandonmentService = require('./cartAbandonmentService');
const emailService = require('./emailService');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  startAllSchedulers() {
    console.log('Starting all scheduled jobs...');
    
    // Cart abandonment email scheduler - runs every 6 hours
    this.startCartAbandonmentScheduler();
    
    // Cleanup scheduler - runs daily at 2 AM
    this.startCleanupScheduler();
    
    // Email service health check - runs every hour
    this.startEmailHealthCheck();
    
    console.log('All schedulers started successfully');
  }

  startCartAbandonmentScheduler() {
    const job = cron.schedule('0 */6 * * *', async () => {
      try {
        console.log('Running cart abandonment email job...');
        const processedCount = await cartAbandonmentService.processAbandonedCarts();
        console.log(`Cart abandonment job completed. Processed ${processedCount} carts.`);
      } catch (error) {
        console.error('Cart abandonment scheduler error:', error);
      }
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    this.jobs.set('cartAbandonment', job);
    job.start();
    console.log('Cart abandonment scheduler started (every 6 hours)');
  }

  startCleanupScheduler() {
    const job = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('Running cleanup job...');
        const cleanedCount = await cartAbandonmentService.cleanupOldRecords();
        console.log(`Cleanup job completed. Cleaned ${cleanedCount} records.`);
      } catch (error) {
        console.error('Cleanup scheduler error:', error);
      }
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    this.jobs.set('cleanup', job);
    job.start();
    console.log('Cleanup scheduler started (daily at 2 AM UTC)');
  }

  startEmailHealthCheck() {
    const job = cron.schedule('0 * * * *', async () => {
      try {
        console.log('Running email service health check...');
        const isHealthy = await emailService.testConnection();
        if (!isHealthy) {
          console.warn('Email service health check failed');
        } else {
          console.log('Email service is healthy');
        }
      } catch (error) {
        console.error('Email health check error:', error);
      }
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    this.jobs.set('emailHealthCheck', job);
    job.start();
    console.log('Email health check scheduler started (every hour)');
  }

  stopScheduler(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      console.log(`Scheduler '${jobName}' stopped`);
    } else {
      console.warn(`Scheduler '${jobName}' not found`);
    }
  }

  stopAllSchedulers() {
    console.log('Stopping all schedulers...');
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`Stopped scheduler: ${name}`);
    }
    this.jobs.clear();
    console.log('All schedulers stopped');
  }

  getSchedulerStatus() {
    const status = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    }
    return status;
  }

  // Manual trigger methods for testing
  async triggerCartAbandonmentCheck() {
    try {
      console.log('Manually triggering cart abandonment check...');
      const processedCount = await cartAbandonmentService.processAbandonedCarts();
      console.log(`Manual cart abandonment check completed. Processed ${processedCount} carts.`);
      return processedCount;
    } catch (error) {
      console.error('Manual cart abandonment check error:', error);
      throw error;
    }
  }

  async triggerCleanup() {
    try {
      console.log('Manually triggering cleanup...');
      const cleanedCount = await cartAbandonmentService.cleanupOldRecords();
      console.log(`Manual cleanup completed. Cleaned ${cleanedCount} records.`);
      return cleanedCount;
    } catch (error) {
      console.error('Manual cleanup error:', error);
      throw error;
    }
  }
}

module.exports = new SchedulerService();
