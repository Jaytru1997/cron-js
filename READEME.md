# Simple Cron Job Scheduler

A simple cron job scheduler for Node.js built with `EventEmitter`. This library allows you to schedule tasks based on cron expressions, manage retries, and control job execution in an easy-to-use manner.

## Features

- **Cron Expression Parsing**: Parse cron expressions in the format `second minute hour day month dayOfWeek`.
- **Job Scheduling**: Schedule jobs to run based on cron expressions.
- **Job Execution**: Execute tasks with error handling and retries.
- **Event-driven**: Emit events when the scheduler starts, stops, or when jobs run, succeed, or fail.
- **Retry Mechanism**: Retry failed jobs a defined number of times with a configurable delay.
- **Single and Recurring Jobs**: Support for jobs that run once or recur.

## Installation

```bash
npm install simple-cron
```

## Usage

### Importing the module

```javascript
const cron = require('simple-cron');
```

### Scheduling a Job

```javascript
const jobId = cron.schedule('*/5 * * * * *', async () => {
  console.log('Job executed');
});
```

### Stopping a Job

```javascript
cron.stop(jobId);
```

### Listing All Jobs

```javascript
const jobs = cron.listJobs();
console.log(jobs);
```

### Stopping All Jobs

```javascript
cron.stopAll();
```

### General Usage

```javascript
const cron = require("simple-cron");

// Define a job that runs every 10 seconds
const jobId = cron.schedule("*/10 * * * * *", async () => {
  console.log("Task is running...");
}, {
  maxRetries: 3,
  retryDelay: 5000,
});

// Listen for events
cron.on("job_failed", ({ jobId, error, attempt }) => {
  console.log(`⚠️ Job ${jobId.toString()} failed on attempt ${attempt}: ${error.message}`);
});

cron.on("job_retried", ({ jobId, attempt }) => {
  console.log(`🔄 Retrying job ${jobId.toString()} (attempt ${attempt})...`);
});
```

## Events

cron emits the following events:

- `scheduler_started`: Emitted when the scheduler starts.
- `scheduler_stopped`: Emitted when the scheduler stops.
- `job_scheduled`: Emitted when a job is scheduled.
- `job_started`: Emitted when a job starts executing.
- `job_finished`: Emitted when a job finishes successfully.
- `job_failed`: Emitted when a job fails.
- `job_retried`: Emitted when a job is retried.
- `job_max_retries_reached`: Emitted when a job has reached the maximum retry limit.
- `job_stopped`: Emitted when a job is stopped manually.
- `all_jobs_stopped`: Emitted when all jobs are stopped.

### `LICENSE`

```text
MIT License

Copyright (c) 2025 [Oghenekparobo Onosemuode]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
