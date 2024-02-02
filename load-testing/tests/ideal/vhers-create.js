/* eslint-disable no-undef */
/*
	You must install the k6 binary on your local machine for this to work (brew install k6)
	You will also need to run the server and include all environment variables with the '-e' flag
	Sample command (execute from this folder):
		k6 run -e URL='server url here' -e VHERS_CREATE_ENDPOINT='vhers-create endpoint name here' -e API_KEY='key here'
		 -e CREATE_IDEAL_TARGET=200 -e CREATE_IDEAL_VUS=100 -e CREATE_IDEAL_MAX_DURATION='180' -e CREATE_IDEAL_SLEEP=2
		 -e dt='date time string' vhers-create.js
*/

import http from 'k6/http';
import { sleep, check } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export let options = {
    discardResponseBodies: true,
    scenarios: {
        ideal: {
            executor: 'shared-iterations',
            vus: __ENV.CREATE_IDEAL_VUS,
            iterations: __ENV.CREATE_IDEAL_TARGET,
            maxDuration: __ENV.CREATE_IDEAL_MAX_DURATION + 's',
            gracefulStop: '60s',
        },
    },
};

export function handleSummary(data) {
    const summaryPath = `../../results/summary/${__ENV.dt}/vhers-create-ideal.html`;
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
        __ENV.URL + __ENV.VHERS_CREATE_ENDPOINT,
        JSON.stringify(body),
        { headers: headers },
    );
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
    sleep(parseInt(__ENV.CREATE_IDEAL_SLEEP)); // let each VU sleep before sending another request
}
