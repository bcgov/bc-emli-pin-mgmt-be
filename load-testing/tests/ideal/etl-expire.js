/* eslint-disable no-undef */
/*
	You must install the k6 binary on your local machine for this to work (brew install k6)
	You will also need to run the server and include all environment variables with the '-e' flag
	Sample command (execute from this folder):
		k6 run -e URL='server url here' -e EXPIRE_ENDPOINT='expire endpoint name here' -e API_KEY='key here' 
		-e EXPIRE_IDEAL_MAX_DURATION='360' -e EXPIRE_IDEAL_SLEEP_FRACTION=0.015 etl-expire.js
*/
import exec from 'k6/execution';
import { SharedArray } from 'k6/data';
import http from 'k6/http';
import { sleep, check } from 'k6';

// Get the ids for the tests
const livePinId = new SharedArray('pinIds', function () {
    const file = JSON.parse(open('../../data/ids.json'));
    return file.livePinId.slice(0, 20000); // we only want the first 20,000 entries for this test
});

export let options = {
    discardResponseBodies: true,
    // The VUs need to equal iterations here so that each VU can use a different ID
    scenarios: {
        ideal: {
            executor: 'shared-iterations',
            vus: livePinId.length,
            iterations: livePinId.length,
            maxDuration: __ENV.EXPIRE_IDEAL_MAX_DURATION + 's',
            gracefulStop: '60s',
        },
    },
};

export default function () {
    sleep(
        exec.scenario.iterationInTest *
            parseFloat(__ENV.EXPIRE_IDEAL_SLEEP_FRACTION),
    );
    /* 
	Sleep each iteration in a staggred fashion before beginning so that all iterations don't go at once.
	This is realistic because the etl job has to execute these calls consecutively anyway.
	*/

    let headers = {
        'Content-Type': 'application/json',
        'x-api-key': __ENV.API_KEY,
    };
    let body = {
        livePinId: livePinId[exec.scenario.iterationInTest],
        expirationReason: 'CO',
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let res = http.post(
        __ENV.URL + __ENV.EXPIRE_ENDPOINT,
        JSON.stringify(body),
        { headers: headers },
    );
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
}
