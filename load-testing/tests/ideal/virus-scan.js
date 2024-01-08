/* eslint-disable no-undef */
/*
	You must install the k6 binary on your local machine for this to work (brew install k6)
	You will also need to run the server and include all environment variables with the '-e' flag
	Sample command (execute from this folder):
		k6 run -e VIRUS_SCAN_URL='virus scan server url here' -e VIRUS_SCAN_ENDPOINT='virus scan endpoint name here' -e API_KEY='key here' 
		-e VIRUS_SCAN_IDEAL_TARGET=5000 -e VIRUS_SCAN_IDEAL_VUS=100 -e VIRUS_SCAN_IDEAL_MAX_DURATION='60' -e VIRUS_SCAN_SLEEP=0.5 virus-scan.js
*/

import http from 'k6/http';
import { sleep, check } from 'k6';
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';

const testFile = open('./test-file.pdf');
const fd = new FormData();
fd.append('energuide', http.file(testFile, 'test-file.pdf', 'application/pdf'));

export let options = {
    discardResponseBodies: true,
    scenarios: {
        ideal: {
            executor: 'shared-iterations',
            vus: __ENV.VIRUS_SCAN_IDEAL_VUS,
            iterations: __ENV.VIRUS_SCAN_IDEAL_TARGET,
            maxDuration: __ENV.VIRUS_SCAN_IDEAL_MAX_DURATION + 's',
            gracefulStop: '60s',
        },
    },
};

export default function () {
    let headers = {
        headers: {
            'Content-Type': 'multipart/form-data; boundary=' + fd.boundary,
            'x-api-key': __ENV.API_KEY,
        },
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const res = http.post(
        __ENV.VIRUS_SCAN_URL + __ENV.VIRUS_SCAN_ENDPOINT,
        fd.body(),
        headers,
    );
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
    sleep(parseInt(__ENV.VIRUS_SCAN_SLEEP));
}
