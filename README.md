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
Create a table in BigQuery with the following properties

```
[
  {
    "name": "client_id",
    "type": "STRING",
    "mode": "REQUIRED"
  },
  {
    "name": "page_id",
    "type": "STRING",
    "mode": "REQUIRED"
  },
  {
    "name": "url_path",
    "type": "STRING",
    "mode": "REQUIRED"
  },
  {
    "name": "uuid",
    "type": "STRING",
    "mode": "REQUIRED"
  },
  {
    "name": "session_id",
    "type": "STRING"
  },
  {
    "name": "cur_time",
    "type": "TIMESTAMP",
    "mode": "REQUIRED"
  },
  {
    "name": "ua_string",
    "type": "STRING"
  },
  {
    "name": "device_type",
    "type": "STRING"
  },
  {
    "name": "device",
    "type": "STRING"
  },
  {
    "name": "browser",
    "type": "STRING"
  },
  {
    "name": "browser_version",
    "type": "STRING"
  },
  {
    "name": "referrer",
    "type": "STRING"
  },
  {
    "name": "referrer_host",
    "type": "STRING"
  },
  {
    "name": "session_referrer",
    "type": "STRING"
  },
  {
    "name": "os",
    "type": "STRING"
  },
  {
    "name": "os_version",
    "type": "STRING"
  },
  {
    "name": "ip",
    "type": "STRING"
  },
  {
    "name": "latitude",
    "type": "FLOAT"
  },
  {
    "name": "longitude",
    "type": "FLOAT"
  },
  {
    "name": "geo_latitude",
    "type": "FLOAT"
  },
  {
    "name": "geo_longitude",
    "type": "FLOAT"
  },
  {
    "name": "city",
    "type": "STRING"
  },
  {
    "name": "province",
    "type": "STRING"
  },
  {
    "name": "country",
    "type": "STRING"
  },
  {
    "name": "pincode",
    "type": "STRING"
  },
  {
    "name": "timezone",
    "type": "STRING"
  },
  {
    "name": "asn",
    "type": "STRING"
  },
  {
    "name": "colo",
    "type": "STRING"
  },
  {
    "name": "first_ever_session",
    "type": "BOOLEAN"
  },
  {
    "name": "first_ever_pageview",
    "type": "BOOLEAN"
  },
  {
    "name": "session_hit_num",
    "type": "INTEGER"
  },
  {
    "name": "active_last_24hrs",
    "type": "BOOLEAN"
  },
  {
    "name": "active_last_7days",
    "type": "BOOLEAN"
  },
  {
    "name": "screen_resolution",
    "type": "STRING"
  },
  {
    "name": "screen_height_px",
    "type": "INTEGER"
  },
  {
    "name": "screen_width_px",
    "type": "INTEGER"
  },
  {
    "name": "num_lifetime_sessions",
    "type": "INTEGER"
  },
  {
    "name": "num_lifetime_pageviews",
    "type": "INTEGER"
  },
  {
    "name": "time_spent",
    "type": "INTEGER"
  },
  {
    "name": "max_depth",
    "type": "INTEGER"
  },
  {
    "name": "source",
    "type": "STRING"
  },
  {
    "name": "campaign",
    "type": "STRING"
  },
  {
    "name": "medium",
    "type": "STRING"
  },
  {
    "name": "event1_count",
    "type": "INTEGER"
  },
  {
    "name": "event2_count",
    "type": "INTEGER"
  },
  {
    "name": "event3_count",
    "type": "INTEGER"
  },
  {
    "name": "event4_count",
    "type": "INTEGER"
  },
  {
    "name": "event5_count",
    "type": "INTEGER"
  },
  {
    "name": "event6_count",
    "type": "INTEGER"
  },
  {
    "name": "event7_count",
    "type": "INTEGER"
  },
  {
    "name": "event8_count",
    "type": "INTEGER"
  },
  {
    "name": "event9_count",
    "type": "INTEGER"
  },
  {
    "name": "event10_count",
    "type": "INTEGER"
  },
  {
    "name": "event1_values",
    "type": "STRING"
  },
  {
    "name": "event2_values",
    "type": "STRING"
  },
  {
    "name": "event3_values",
    "type": "STRING"
  },
  {
    "name": "event4_values",
    "type": "STRING"
  },
  {
    "name": "event5_values",
    "type": "STRING"
  },
  {
    "name": "event6_values",
    "type": "STRING"
  },
  {
    "name": "event7_values",
    "type": "STRING"
  },
  {
    "name": "event8_values",
    "type": "STRING"
  },
  {
    "name": "event9_values",
    "type": "STRING"
  },
  {
    "name": "event10_values",
    "type": "STRING"
  }
]
```

## Usage
Get your URL after setting this up on Cloudflare workers. Then, replace the `serverURL` in the [frontend JS file](https://github.com/Full-Stack-Data/browser-analytics-capture-js/blob/main/ingest.js) with your URL. After this, the pageview and engagement data will be stored in your BigQuery table

## Roadmap
- [Done] Create a front-end JS script for capturing data
- [Done] Create a serverless function for capturing pageviews data
- [Done] Add capture of custom event data to the front-end JS script and the serverless function
