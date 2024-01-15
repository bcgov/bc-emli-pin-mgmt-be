/* eslint-disable no-undef */
/*
	You must install the k6 binary on your local machine for this to work (brew install k6)
	You will also need to run the server and include all environment variables with the '-e' flag
	Sample command (execute from this folder):
		k6 run -e URL='server url here' -e VERIFY_ENDPOINT='verify endpoint name here' -e API_KEY='key here' 
		-e VERIFY_SPIKE_TARGET=100 -e VERIFY_SPIKE_VUS=20 -e VERIFY_SPIKE_MAX_DURATION='30' 
		-e VERIFY_SPIKE_SLEEP=0.5 -e dt='date time string' verify.js
*/

import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    discardResponseBodies: true,
    scenarios: {
        spike: {
            executor: 'shared-iterations',
            vus: __ENV.VERIFY_SPIKE_VUS,
            iterations: __ENV.VERIFY_SPIKE_TARGET,
            maxDuration: __ENV.VERIFY_SPIKE_MAX_DURATION + 's',
            gracefulStop: '60s',
        },
    },
};

export function handleSummary(data) {
    const summaryPath = `../results/summary/verify-spike-${__ENV.dt}.html`;
    return {
        stdout: textSummary(data, { indent: '→', enableColors: true }),
        [summaryPath]: htmlReport(data),
    };
}

export default function () {
    let headers = {
        'Content-Type': 'application/json',
        'x-api-key': __ENV.API_KEY,
    };
    let body = { pin: '!!!!!!!!', pids: '000000000' };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let res = http.post(
        __ENV.URL + __ENV.VERIFY_ENDPOINT,
        JSON.stringify(body),
        { headers: headers },
    );
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
    sleep(parseInt(__ENV.VERIFY_SPIKE_SLEEP)); // let each VU sleep before sending another request
}
