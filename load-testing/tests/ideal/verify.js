/* eslint-disable no-undef */
/*
	You must install the k6 binary on your local machine for this to work (brew install k6)
	You will also need to run the server and include all environment varaibles with the '-e' flag
	Sample command (execute from this folder):
		k6 run -e URL='server url here' -e VERIFY_ENDPOINT='verify endpoint name here' -e API_KEY='key here' 
		-e PIN='valid pin in db' -e VERIFY_PIDS='matching pid in db' -e VERIFY_IDEAL_TARGET=20 verify.js
*/

import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    discardResponseBodies: true,
    scenarios: {
        ideal: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                // Ramp-up to target VUs in 20s
                { duration: '20s', target: __ENV.VERIFY_IDEAL_TARGET },
                // Stay at rest on target VUs for 20s
                { duration: '20s', target: __ENV.VERIFY_IDEAL_TARGET },
                // Ramp-down to 0 VUs for 20s
                { duration: '20s', target: 0 },
            ],
            gracefulRampDown: '60s',
        },
    },
};

export default function () {
    let headers = {
        'Content-Type': 'application/json',
        'x-api-key': __ENV.API_KEY,
    };
    let body = { pin: __ENV.PIN, pids: __ENV.VERIFY_PIDS };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let res = http.post(
        __ENV.URL + __ENV.VERIFY_ENDPOINT,
        JSON.stringify(body),
        { headers: headers },
    );
    sleep(2); // let each VU sleep for 2 seconds before sending another request
}
