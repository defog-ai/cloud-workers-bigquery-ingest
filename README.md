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
Create a table with the following fields
- `clientId`: TYPE:String
- `urlPath`: TYPE:String
- `uuid`: TYPE:String
- `sessionId`: TYPE:String
- `curTime`: TYPE:Timestamp
- `uaString`: TYPE:String
- `deviceType`: TYPE:String
- `device`: TYPE:String
- `browser`: TYPE:String
- `browserVersion`: TYPE:String
- `referrer`: TYPE:String
- `referrerHost`: TYPE:String
- `sessionReferrer`: TYPE:String
- `os`: TYPE:String
- `osVersion`: TYPE:String
- `ip`: TYPE:String
- `latitude`: TYPE:Float
- `longitude`: TYPE:Float
- `city`: TYPE:String
- `country`: TYPE:String
- `timeSpent`: TYPE:Float
- `maxDepth`: TYPE:Float
- `firstEverSession`: TYPE:Boolean
- `firstEverPageview`: TYPE:Boolean
- `sessionHitNum`: TYPE:Int
- `activeLast24Hrs`: TYPE:Boolean
- `activeLast7Days`: TYPE:Boolean
- `screenResolution`: TYPE:String
- `numLifetimeSessions`: TYPE:Integer
- `numLifetimePageviews`: TYPE:Integer
- `pageId`: TYPE:String

## Usage
Get your URL after setting this up on Cloudflare workers. Then, replace the `serverURL` in the [frontend JS file](https://github.com/Full-Stack-Data/browser-analytics-capture-js/blob/main/ingest.js) with your URL. After this, the pageview and engagement data will be stored in your BigQuery table

## Roadmap
- [Done] Create a front-end JS script for capturing data
- [Done] Create a serverless function for capturing pageviews data
- [Todo] Add capture of custom event data to the front-end JS script and the serverless function
