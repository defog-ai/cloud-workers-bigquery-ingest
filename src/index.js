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
    eventCounts,
    eventNames,
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
  // const clientEvents = await CLIENT_EVENTS.get("ingestion_events_" + clientId, "json");
  const clientEvents = {
    "generic": {
      "click_dropdown": 1,
      "click_button": 2,
      "click_sort_toggle": 3
    }
  }

  let event1Values, event2Values, event3Values, event4Values, event5Values, event6Values, event7Values, event8Values, event9Values, event10Values;

  let eventsMap;
  if (clientEvents != null) {
    if (urlPath in clientEvents) {
      eventsMap = clientEvents[urlPath];
    } else {
      eventsMap = clientEvents["generic"];
    }

    // Then, get event names
    for (const givenEvent in eventNames) {
      if (givenEvent in eventsMap) {
        const eventsList = eventNames[givenEvent].join("||");
        if(eventsMap[givenEvent] === 1) {
          event1Values = eventsList;
        } else if(eventsMap[givenEvent] === 2) {
          event2Values = eventsList;
        } else if(eventsMap[givenEvent] === 3) {
          event3Values = eventsList;
        } else if(eventsMap[givenEvent] === 4) {
          event4Values = eventsList;
        } else if(eventsMap[givenEvent] === 5) {
          event5Values = eventsList;
        } else if(eventsMap[givenEvent] === 6) {
          event6Values = eventsList;
        } else if(eventsMap[givenEvent] === 7) {
          event7Values = eventsList;
        } else if(eventsMap[givenEvent] === 8) {
          event8Values = eventsList;
        } else if(eventsMap[givenEvent] === 9) {
          event9Values = eventsList;
        } else if(eventsMap[givenEvent] === 10) {
          event10Values = eventsList;
        }
      }
    }
  }

  // Take the data and format it
  const row = {
    'client_id': clientId,
    'url_path': urlPath,
    'uuid': uuid,
    'session_id': sessionId,
    'cur_time': t_now.toISOString(),
    'ua_string': uastring,
    'device_type': deviceType,
    'device': device,
    'browser': browser,
    'browser_version': browserVersion,
    'os': os,
    'os_version': osVersion,
    'referrer': referrer,
    'referrer_host': referrerHost,
    'session_referrer': sessionReferrer,
    'ip': ip,
    'latitude': latitude,
    'longitude': longitude,
    'city': city,
    'province': region,
    'country': country,
    'pincode': postalCode,
    'asn': asn,
    'colo': colo,
    'timezone': timezone,
    'time_spent': parseInt(timeSpent),
    'max_depth': parseInt(100*maxDepth),
    'first_ever_session': firstEverSession,
    'first_ever_pageview': firstEverPageview,
    'session_hit_num': sessionHitNum,
    'active_last_24hrs': activeLast24Hrs,
    'active_last_7days': activeLast7Days,
    'page_id': pageId,
    'screen_resolution': resolution,
    'num_lifetime_pageviews': numLifetimePageviews,
    'num_lifetime_sessions': numLifetimeSessions,
    'source': source,
    'campaign': campaign,
    'medium': medium,
    'event10_count': event10Count,
    'event1_values': event1Values,
    'event2_values': event2Values,
    'event3_values': event3Values,
    'event4_values': event4Values,
    'event5_values': event5Values,
    'event6_values': event6Values,
    'event7_values': event7Values,
    'event8_values': event8Values,
    'event9_values': event9Values,
    'event10_values': event10Values
  };
  
  const payload = {
    "kind": "bigquery#tableDataInsertAllResponse",
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

  // const respData  = await bqResp.text();
  // console.log(respData);

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
