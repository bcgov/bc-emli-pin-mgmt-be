/* eslint-disable no-undef */
/*
	You must install the k6 binary on your local machine for this to work (brew install k6)
	You will also need to run the server and include all environment variables with the '-e' flag
	Sample command (execute from this folder):
		k6 run -e URL='server url here' -e VERIFY_ENDPOINT='verify endpoint name here' -e API_KEY='key here' 
		-e PIN='valid pin in db' -e VERIFY_PIDS='matching pid in db' -e VERIFY_IDEAL_TARGET=20 
		-e VERIFY_IDEAL_VUS=100 -e VERIFY_IDEAL_MAX_DURATION='60' -e VERIFY_IDEAL_SLEEP=0.5 verify.js
*/

import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    discardResponseBodies: true,
    scenarios: {
        ideal: {
            executor: 'shared-iterations',
            vus: __ENV.VERIFY_IDEAL_VUS,
            iterations: __ENV.VERIFY_IDEAL_TARGET,
            maxDuration: __ENV.VERIFY_IDEAL_MAX_DURATION + 's',
            gracefulStop: '60s',
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
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
    sleep(parseInt(__ENV.VERIFY_IDEAL_SLEEP)); // let each VU sleep for 0.5 seconds before sending another request
}
