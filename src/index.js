const EventEmitter = require("events");

class SimpleCron extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
    this.interval = null;
  }

  startScheduler() {
    if (!this.interval) {
      this.interval = setInterval(() => this.runJobs(), 1000);
      this.emit("scheduler_started");
    }
  }

  stopScheduler() {
    if (this.jobs.size === 0 && this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.emit("scheduler_stopped");
    }
  }

  parseCronExpression(cronExpr) {
    const parts = cronExpr.trim().split(" ");
    if (parts.length !== 6)
      throw new Error(
        "Invalid cron format. Use 'second minute hour day month dayOfWeek'"
      );

    return {
      second: parts[0],
      minute: parts[1],
      hour: parts[2],
      day: parts[3],
      month: parts[4],
      dayOfWeek: parts[5],
    };
  }

  matchField(field, value) {
    if (field === "*") return true;
    if (field.includes(","))
      return field.split(",").map(Number).includes(value);
    if (field.includes("-")) {
      const [start, end] = field.split("-").map(Number);
      return value >= start && value <= end;
    }
    if (field.includes("/")) {
      const [_, step] = field.split("/").map(Number);
      return value % step === 0;
    }
    return Number(field) === value;
  }

  shouldRun(cronObj, date) {
    return (
      this.matchField(cronObj.second, date.getSeconds()) &&
      this.matchField(cronObj.minute, date.getMinutes()) &&
      this.matchField(cronObj.hour, date.getHours()) &&
      this.matchField(cronObj.day, date.getDate()) &&
      this.matchField(cronObj.month, date.getMonth() + 1) &&
      this.matchField(cronObj.dayOfWeek, date.getDay())
    );
  }

  runJobs() {
    const now = new Date();
    this.jobs.forEach((job, id) => {
      if (this.shouldRun(job.cronObj, now)) {
        this.executeJob(id);
      }
    });

    this.stopScheduler();
  }

  async executeJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      this.emit("job_started", jobId);
      await job.task();
      this.emit("job_finished", jobId);

      // Reset failure count on success
      job.failures = 0;

      if (job.once) {
        this.stop(jobId);
      }
    } catch (error) {
      job.failures += 1;
      this.emit("job_failed", { jobId, error, attempt: job.failures });

      if (job.failures <= job.maxRetries) {
        this.emit("job_retried", { jobId, attempt: job.failures });
        setTimeout(() => this.executeJob(jobId), job.retryDelay);
      } else {
        this.emit("job_max_retries_reached", { jobId, error });
        this.stop(jobId);
      }
    }
  }

  schedule(
    cronExpr,
    task,
    { once = false, maxRetries = 3, retryDelay = 5000 } = {}
  ) {
    const cronObj = this.parseCronExpression(cronExpr);
    const jobId = Symbol("cronJob");

    this.jobs.set(jobId, {
      cronObj,
      task,
      once,
      maxRetries,
      retryDelay,
      failures: 0,
    });
    this.startScheduler();
    this.emit("job_scheduled", jobId);

    return jobId;
  }

  stop(jobId) {
    if (this.jobs.has(jobId)) {
      this.jobs.delete(jobId);
      this.emit("job_stopped", jobId);
      this.stopScheduler();
    }
  }

  stopAll() {
    this.jobs.clear();
    this.stopScheduler();
    this.emit("all_jobs_stopped");
  }

  listJobs() {
    return Array.from(this.jobs.keys());
  }
}

module.exports = new SimpleCron();
