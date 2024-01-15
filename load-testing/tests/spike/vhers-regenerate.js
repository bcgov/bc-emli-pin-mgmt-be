/* eslint-disable no-undef */
/*
	You must install the k6 binary on your local machine for this to work (brew install k6)
	You will also need to run the server and include all environment variables with the '-e' flag
	Sample command (execute from this folder):
		k6 run -e URL='server url here' -e VHERS_REGENERATE_ENDPOINT='vhers-regenerate endpoint name here' -e API_KEY='key here'
		 -e REGENERATE_SPIKE_TARGET=100 -e REGENERATE_SPIKE_VUS=100 -e REGENERATE_SPIKE_MAX_DURATION='30' -e REGENERATE_SPIKE_SLEEP=2 
		 -e dt='date time string' vhers-create.js
*/

import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    discardResponseBodies: true,
    scenarios: {
        spike: {
            executor: 'shared-iterations',
            vus: __ENV.REGENERATE_SPIKE_VUS,
            iterations: __ENV.REGENERATE_SPIKE_TARGET,
            maxDuration: __ENV.REGENERATE_SPIKE_MAX_DURATION + 's',
            gracefulStop: '60s',
        },
    },
};

export function handleSummary(data) {
    const summaryPath = `../results/summary/vhers-regenerate-spike-${__ENV.dt}.html`;
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
    let body = {
        numberOfOwners: 1,
        email: 'simulate-delivered@notification.canada.ca',
        pids: '000000000',
        lastName_1: 'loadteststart',
        addressLine_1: '123 MAIN ST',
        city: 'PENTICTON',
        provinceAbbreviation: 'BC',
        postalCode: 'A1A1A1',
        propertyAddress: '123 EXAMPLE ST',
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let res = http.post(
        __ENV.URL + __ENV.VHERS_REGENERATE_ENDPOINT,
        JSON.stringify(body),
        { headers: headers },
    );
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
    sleep(parseInt(__ENV.REGENERATE_SPIKE_SLEEP));
}
