/* eslint-disable no-undef */
/*
	You must install the k6 binary on your local machine for this to work (brew install k6)
	You will also need to run the server and include all environment variables with the '-e' flag
	Sample command (execute from this folder):
		k6 run -e URL='server url here' -e VHERS_CREATE_ENDPOINT='vhers-create endpoint name here' -e API_KEY='key here' -e OWNER_NUMBER=1
		 -e CREATE_SPIKE_TARGET=120 -e CREATE_SPIKE_VUS=100 -e CREATE_SPIKE_MAX_DURATION='30' -e CREATE_SPIKE_SLEEP=2 vhers-create.js
*/

import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    discardResponseBodies: true,
    scenarios: {
        spike: {
            executor: 'shared-iterations',
            vus: __ENV.CREATE_SPIKE_VUS,
            iterations: __ENV.CREATE_SPIKE_TARGET,
            maxDuration: __ENV.CREATE_SPIKE_MAX_DURATION + 's',
            gracefulStop: '60s',
        },
    },
};

export default function () {
    let headers = {
        'Content-Type': 'application/json',
        'x-api-key': __ENV.API_KEY,
    };
    let body = {
        numberOfOwners: parseInt(__ENV.OWNER_NUMBER),
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
    sleep(parseInt(__ENV.CREATE_SPIKE_SLEEP));
}
