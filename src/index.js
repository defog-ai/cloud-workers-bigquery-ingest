'use strict';
import { parse } from 'useragent';
import { getTokenFromGCPServiceAccount } from '@sagi.io/workers-jwt'

addEventListener('fetch', event => {
  const request = event.request;
  if (request.method === "OPTIONS") {
    //handle CORS
    event.respondWith(handleOptions(request));
  } else if(request.method === "POST") {
    // Handle requests for Auth
    event.respondWith(handleRequest(request));
  } else {
    event.respondWith(
      new Response(null, {status: 405, statusText: "Method Not Allowed"}),
    )
  }
})

async function handleRequest(request) {
  const serviceAccountJSON = AUTH_JSON; //copy-paste your Service Worker JSON key here. It's not ideal from a security perspective, but cloudflare current environment variables limits are just 1kb – smaller than the key size

  const aud = 'https://bigquery.googleapis.com/';

  const projectName = "YOUR_PROJECT_NAME"; //replace with your own
  const datasetName = "YOUR_DATASET_NAME"; //replace with your own
  const tableName = "YOUR_TABLE_NAME"; //replace with your own
  
  const token = await getTokenFromGCPServiceAccount({ serviceAccountJSON, aud} );
  
  const t_now = new Date;
  const reqBody = await request.text();
  const reqCf = request.cf;
  
  const {
    clientId,
    urlPath,
    uuid,
    sessionId,
    referrer,
    referrerHost,
    sessionReferrer,
    timeSpent,
    maxDepth,
    firstEverSession,
    firstEverPageview,
    sessionHitNum,
    activeLast24Hrs,
    activeLast7Days,
    pageId,
    resolution,
    numLifetimePageviews,
    numLifetimeSessions,
    isMobile,
    events,
    source,
    campaign,
    medium
  } = JSON.parse(reqBody);

  const uastring = request.headers.get("User-Agent");
  const ip = request.headers.get("CF-Connecting-IP");

  const agent = parse(uastring);
  const browser = agent.family;
  const browserVersion = agent.major;
  const os = agent.os.toString().split(" ").slice(0,-1).join(" ");
  const osVersion = agent.os.toVersion();
  const device = agent.device.toString().split(" ").slice(0,-1).join(" ");
  let deviceType;
  if (isMobile === true) {
    deviceType = 'mobile'
  } else {
    deviceType = 'desktop'
  }

  const {
    asn, //ASN of the incoming request, e.g. 395747.
    colo, //3-letter IATA airport code data center hit
    country, //Country of incoming request
    city, //City of incoming request -- where available
    latitude, //Latitude of incoming request -- where available
    longitude, //Longitude of incoming request -- where available
    postalCode, //Postal Code of incoming request -- where available
    region, //region/state of incoming request
    timezone //Timezone of the incoming request, e.g. "America/Chicago".
  } = reqCf;

  // Format events data propertly by checking in with pre-stored events in CF Workers
  const clientEvents = await CLIENT_EVENTS.get("ingestion_events_" + clientId, "json");
  let event1Val, event2Val, event3Val, event4Val, event5Val, event6Val, event7Val, event8Val, event9Val, event10Val, eventsMap;
  if (clientEvents != null) {
    if (urlPath in clientEvents) {
      eventsMap = clientEvents[urlPath];
    } else {
      eventsMap = clientEvents["generic"];
    }
    
    for (const givenEvent in events) {
      if (givenEvent in eventsMap) {
        const eventValue = events[givenEvent]
        if(eventsMap[givenEvent] === 1) {
          event1Val = eventValue;
        } else if(eventsMap[givenEvent] === 2) {
          event2Val = eventValue;
        } else if(eventsMap[givenEvent] === 3) {
          event3Val = eventValue;
        } else if(eventsMap[givenEvent] === 4) {
          event4Val = eventValue;
        } else if(eventsMap[givenEvent] === 5) {
          event5Val = eventValue;
        } else if(eventsMap[givenEvent] === 6) {
          event6Val = eventValue;
        } else if(eventsMap[givenEvent] === 7) {
          event7Val = eventValue;
        } else if(eventsMap[givenEvent] === 8) {
          event8Val = eventValue;
        } else if(eventsMap[givenEvent] === 9) {
          event9Val = eventValue;
        } else if(eventsMap[givenEvent] === 10) {
          event10Val = eventValue;
        }
      }
    }
  }

  // Take the data and format it
  const row = {
    'clientId': clientId,
    'urlPath': urlPath,
    'uuid': uuid,
    'sessionId': sessionId,
    'curTime': t_now.toISOString(),
    'uaString': uastring,
    'deviceType': deviceType,
    'device': device,
    'browser': browser,
    'browserVersion': browserVersion,
    'os': os,
    'osVersion': osVersion,
    'referrer': referrer,
    'referrerHost': referrerHost,
    'sessionReferrer': sessionReferrer,
    'ip': ip,
    'latitude': latitude,
    'longitude': longitude,
    'city': city,
    'country': country,
    'timeSpent': timeSpent,
    'maxDepth': maxDepth,
    'firstEverSession': firstEverSession,
    'firstEverPageview': firstEverPageview,
    'sessionHitNum': sessionHitNum,
    'activeLast24Hrs': activeLast24Hrs,
    'activeLast7Days': activeLast7Days,
    'pageId': pageId,
    'screenResolution': resolution,
    'numLifetimePageviews': numLifetimePageviews,
    'numLifetimeSessions': numLifetimeSessions,
    'source': source,
    'campaign': campaign,
    'medium': medium,
    'event1Val': event1Val,
    'event2Val': event2Val,
    'event3Val': event3Val,
    'event4Val': event4Val,
    'event5Val': event5Val,
    'event6Val': event6Val,
    'event7Val': event7Val,
    'event8Val': event8Val,
    'event9Val': event9Val,
    'event10Val': event10Val
  };

  const payload = {
    "kind": "bigquery#tableDataInsertAllResponse",
    // "skipInvalidRows": true,
    // "ignoreUnknownValues": true,
    "rows": [
      {
        "insertId": row['pageId'],
        "json": row
      }
    ]
  };
  
  const insertUrl = "https://bigquery.googleapis.com/bigquery/v2/projects/" + projectName + "/datasets/" + datasetName + "/tables/" + tableName + "/insertAll";

  const bqResp = await fetch(insertUrl, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "Authorization": "Bearer " + token
    }
  });

  return new Response("success", {status: 200, headers: {'Content-Type': "application/json", 'Access-Control-Allow-Origin': '*'}});
}

async function handleOptions(request) {
  let headers = request.headers;
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ) {
    let respHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers"),
    }

    return new Response(null, {
      headers: respHeaders,
    })
  }
  else {
    return new Response(null, {
      headers: {
        "Allow": "POST, OPTIONS",
      },
    })
  }
}
