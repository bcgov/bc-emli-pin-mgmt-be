/* eslint-disable no-undef */
/*
	You must install the k6 binary on your local machine for this to work (brew install k6)
	You will also need to run the server and include all environment varaibles with the '-e' flag
	Sample command (execute from this folder):
		k6 run -e URL='server url here' -e VHERS_CREATE_ENDPOINT='vhers-create endpoint name here' -e API_KEY='key here' -e OWNER_NUMBER=1
		 -e CREATE_PIDS='matching pid in db' -e GIVEN_NAME='name' -e LAST_NAME_1='last name 1' -e LAST_NAME_2='last name 2'
		 -e INC_NUMBER='incorporation number' -e ADDRESS_LINE_1='address line 1' -e ADDRESS_LINE_2='address line 2'
		 -e CITY='city' -e PROVINCE_ABBREV='BC' -e COUNTRY='Canada' -e POSTAL_CODE='postal code'
		 -e CREATE_IDEAL_ITERATIONS=200 -e CREATE_IDEAL_VUS=100 -e CREATE_IDEAL_MAX_DURATION_S=120 -e CREATE_IDEAL_SLEEP=0.2
		 vhers-create.js
*/

import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    discardResponseBodies: true,
    scenarios: {
        ideal: {
            executor: 'shared-iterations',
            vus: parseInt(__ENV.CREATE_IDEAL_VUS),
            iterations: parseInt(__ENV.CREATE_IDEAL_ITERATIONS),
            maxDuration: __ENV.CREATE_IDEAL_MAX_DURATION_S + 's',
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
        pids: __ENV.CREATE_PIDS,
        givenName: __ENV.GIVEN_NAME,
        lastName_1: __ENV.LAST_NAME_1,
        lastName_2: __ENV.LAST_NAME_2,
        incorporationNumber: __ENV.INC_NUMBER,
        addressLine_1: __ENV.ADDRESS_LINE_1,
        addressLine_2: __ENV.ADDRESS_LINE_2,
        city: __ENV.CITY,
        provinceAbbreviation: __ENV.PROVINCE_ABBREV,
        country: __ENV.COUNTRY,
        postalCode: __ENV.POSTAL_CODE,
        propertyAddress: '123 EXAMPLE ST',
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let res = http.post(
        __ENV.URL + __ENV.VHERS_CREATE_ENDPOINT,
        JSON.stringify(body),
        { headers: headers },
    );
    sleep(parseInt(__ENV.CREATE_IDEAL_SLEEP)); // let each VU sleep for half a second before sending another request
}
