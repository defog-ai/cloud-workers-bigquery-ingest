# BigQuery Data Ingestion with Cloudflare Workers

## Overview
This validates, cleans, and augments analytics data sent from a browser request, and then stores it into a BigQuery table. You can then use the data to do product and content analytics + create dashboards.

An analytics library that you can use to capture data in the browser has also been open-sourced [here](https://github.com/Full-Stack-Data/browser-analytics-capture-js).

## Variables to change
To create your Cloudflare Worker, change the following variables in [index.js](src/index.js). Then build, test, and deploy on Cloudflare Workers using `wrangler`. Additionally, you will have to change the Cloudflare Workers specific variables in `wrangler.toml`

- `serviceAccountJSON`: add your Service Worker JSON key here (note: this is sub-optimal, as you would preferably have this as an environment variable. But this is the only way for now as Cloudflare Workers have a 1kb limit on enviroment variable size)
- `projectName`: replace with your GCP project name
- `datasetName`: replace with your BigQuery dataset name
- `tableName`: replace with your BigQuery table name

## Contact
Just reach out on Twitter [@rishdotblog](https://twitter.com/rishdotblog) for queries or help debugging

## BigQuery table setup
Create a table in BigQuery with the following command

```
CREATE TABLE IF NOT EXISTS PROJECT_NAME.TABLE_NAME (
  clientId STRING NOT NULL,
  pageId STRING NOT NULL,
  urlPath STRING NOT NULL,
  uuid STRING NOT NULL,
  sessionId STRING,
  curTime TIMESTAMP NOT NULL,
  uaString STRING,
  deviceType STRING,
  device STRING,
  browser STRING,
  browserVersion STRING,
  referrer STRING,
  referrerHost STRING,
  sessionReferrer STRING,
  os STRING,
  ip STRING,
  latitude FLOAT64,
  longitude FLOAT64,
  geoLatitude FLOAT64,
  geoLongitude FLOAT64,
  city STRING,
  province STRING,
  country STRING,
  firstEverSession BOOLEAN,
  firstEverPageview BOOLEAN,
  sessionHitNum INT64,
  activeLast24Hrs BOOLEAN,
  activeLast7Days BOOLEAN,
  screenResolution STRING,
  numLifetimeSessions INT64,
  numLifetimePageviews INT64,
  timespent INT64,
  maxDepth INT64,
  source STRING,
  campaign STRING,
  medium STRING,
  event1Count INT64,
  event2Count INT64,
  event3Count INT64,
  event4Count INT64,
  event5Count INT64,
  event6Count INT64,
  event7Count INT64,
  event8Count INT64,
  event9Count INT64,
  event10Count INT64,
  event1Values STRING,
  event2Values STRING,
  event3Values STRING,
  event4Values STRING,
  event5Values STRING,
  event6Values STRING,
  event7Values STRING,
  event8Values STRING,
  event9Values STRING,
  event10Values STRING
);
```

## Usage
Get your URL after setting this up on Cloudflare workers. Then, replace the `serverURL` in the [frontend JS file](https://github.com/Full-Stack-Data/browser-analytics-capture-js/blob/main/ingest.js) with your URL. After this, the pageview and engagement data will be stored in your BigQuery table

## Roadmap
- [Done] Create a front-end JS script for capturing data
- [Done] Create a serverless function for capturing pageviews data
- [Todo] Add capture of custom event data to the front-end JS script and the serverless function
