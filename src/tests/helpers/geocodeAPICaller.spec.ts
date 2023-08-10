import axios from 'axios';
import GeocodeAPICaller from '../../helpers/GeocodeAPICaller';
import { AxiosError } from 'axios';

// API Responses to mock (sorry, this is a real response and it's long)
const geocodeResponse = {
    data: {
        type: 'FeatureCollection',
        queryAddress: '525 Superior Street, Victoria, BC',
        searchTimestamp: '2023-08-09 08:25:04',
        executionTime: 2.942,
        version: '4.2.2-RELEASE',
        baseDataDate: '2022-09-09',
        crs: {
            type: 'EPSG',
            properties: {
                code: 4326,
            },
        },
        interpolation: 'adaptive',
        echo: 'true',
        locationDescriptor: 'any',
        setBack: 0,
        minScore: 50,
        maxResults: 101,
        disclaimer:
            'https://www2.gov.bc.ca/gov/content?id=79F93E018712422FBC8E674A67A70535',
        privacyStatement:
            'https://www2.gov.bc.ca/gov/content?id=9E890E16955E4FF4BF3B0E07B4722932',
        copyrightNotice:
            'Copyright �� 2023 Province of British Columbia - Open Government License',
        copyrightLicense:
            'https://www2.gov.bc.ca/gov/content?id=A519A56BC2BF44E4A008B33FCF527F61',
        features: [
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    crs: {
                        type: 'EPSG',
                        properties: {
                            code: 4326,
                        },
                    },
                    coordinates: [-123.3708218, 48.4176982],
                },
                properties: {
                    fullAddress: '525 Superior St, Victoria, BC',
                    score: 100,
                    matchPrecision: 'CIVIC_NUMBER',
                    precisionPoints: 100,
                    faults: [],
                    siteName: '',
                    unitDesignator: '',
                    unitNumber: '',
                    unitNumberSuffix: '',
                    civicNumber: 525,
                    civicNumberSuffix: '',
                    streetName: 'Superior',
                    streetType: 'St',
                    isStreetTypePrefix: 'false',
                    streetDirection: '',
                    isStreetDirectionPrefix: '',
                    streetQualifier: '',
                    localityName: 'Victoria',
                    localityType: 'City',
                    electoralArea: '',
                    provinceCode: 'BC',
                    locationPositionalAccuracy: 'high',
                    locationDescriptor: 'parcelPoint',
                    siteID: 'dc9357ba-7f40-4395-9eda-219ca5f475c0',
                    blockID: 296337,
                    fullSiteDescriptor: '',
                    accessNotes: '',
                    siteStatus: 'active',
                    siteRetireDate: '9999-12-31',
                    changeDate: '2022-09-10',
                    isOfficial: 'true',
                },
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    crs: {
                        type: 'EPSG',
                        properties: {
                            code: 4326,
                        },
                    },
                    coordinates: [-123.3742438, 48.4187548],
                },
                properties: {
                    fullAddress: 'Superior St, Victoria, BC',
                    score: 77,
                    matchPrecision: 'STREET',
                    precisionPoints: 78,
                    faults: [
                        {
                            value: 525,
                            element: 'CIVIC_NUMBER',
                            fault: 'notInAnyBlock',
                            penalty: 1,
                        },
                    ],
                    siteName: '',
                    unitDesignator: '',
                    unitNumber: '',
                    unitNumberSuffix: '',
                    civicNumber: '',
                    civicNumberSuffix: '',
                    streetName: 'Superior',
                    streetType: 'St',
                    isStreetTypePrefix: 'false',
                    streetDirection: '',
                    isStreetDirectionPrefix: '',
                    streetQualifier: '',
                    localityName: 'Victoria',
                    localityType: 'City',
                    electoralArea: '',
                    provinceCode: 'BC',
                    locationPositionalAccuracy: 'coarse',
                    locationDescriptor: 'streetPoint',
                    siteID: '',
                    blockID: '',
                    fullSiteDescriptor: '',
                    accessNotes: '',
                    siteStatus: '',
                    siteRetireDate: '',
                    changeDate: '',
                    isOfficial: 'true',
                },
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    crs: {
                        type: 'EPSG',
                        properties: {
                            code: 4326,
                        },
                    },
                    coordinates: [-123.3644444, 48.4280556],
                },
                properties: {
                    fullAddress: 'Victoria, BC',
                    score: 56,
                    matchPrecision: 'LOCALITY',
                    precisionPoints: 68,
                    faults: [
                        {
                            value: 'SUPERIOR STREET',
                            element: 'STREET_NAME',
                            fault: 'notMatched',
                            penalty: 12,
                        },
                    ],
                    siteName: '',
                    unitDesignator: '',
                    unitNumber: '',
                    unitNumberSuffix: '',
                    civicNumber: '',
                    civicNumberSuffix: '',
                    streetName: '',
                    streetType: '',
                    isStreetTypePrefix: '',
                    streetDirection: '',
                    isStreetDirectionPrefix: '',
                    streetQualifier: '',
                    localityName: 'Victoria',
                    localityType: 'City',
                    electoralArea: '',
                    provinceCode: 'BC',
                    locationPositionalAccuracy: 'coarse',
                    locationDescriptor: 'localityPoint',
                    siteID: '',
                    blockID: '',
                    fullSiteDescriptor: '',
                    accessNotes: '',
                    siteStatus: '',
                    siteRetireDate: '',
                    changeDate: '',
                    isOfficial: 'true',
                },
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    crs: {
                        type: 'EPSG',
                        properties: {
                            code: 4326,
                        },
                    },
                    coordinates: [-123.0591667, 49.0302778],
                },
                properties: {
                    fullAddress: 'Beach Grove in Delta, BC',
                    score: 50,
                    matchPrecision: 'LOCALITY',
                    precisionPoints: 68,
                    faults: [
                        {
                            value: 'SUPERIOR STREET VICTORIA',
                            element: 'STREET_NAME',
                            fault: 'notMatched',
                            penalty: 12,
                        },
                        {
                            value: '',
                            element: 'PROVINCE',
                            fault: 'missing',
                            penalty: 1,
                        },
                        {
                            value: 'BC',
                            element: 'ADDRESS',
                            fault: 'autoCompleted',
                            penalty: 5,
                        },
                    ],
                    siteName: '',
                    unitDesignator: '',
                    unitNumber: '',
                    unitNumberSuffix: '',
                    civicNumber: '',
                    civicNumberSuffix: '',
                    streetName: '',
                    streetType: '',
                    isStreetTypePrefix: '',
                    streetDirection: '',
                    isStreetDirectionPrefix: '',
                    streetQualifier: '',
                    localityName: 'Beach Grove in Delta',
                    localityType: 'Community',
                    electoralArea: '',
                    provinceCode: 'BC',
                    locationPositionalAccuracy: 'coarse',
                    locationDescriptor: 'localityPoint',
                    siteID: '',
                    blockID: '',
                    fullSiteDescriptor: '',
                    accessNotes: '',
                    siteStatus: '',
                    siteRetireDate: '',
                    changeDate: '',
                    isOfficial: 'true',
                },
            },
        ],
    },
};

// These are partial responses because they're long and we don't use a lot of the data
const emptyResponse = {
    data: {
        type: 'FeatureCollection',
        queryAddress: 'this address does not exist',
        searchTimestamp: '2023-08-09 08:25:04',
        executionTime: 2.942,
        version: '4.2.2-RELEASE',
        baseDataDate: '2022-09-09',
        crs: {
            type: 'EPSG',
            properties: {
                code: 4326,
            },
        },
        interpolation: 'adaptive',
        echo: 'true',
        locationDescriptor: 'any',
        setBack: 0,
        minScore: 50,
        maxResults: 101,
        disclaimer:
            'https://www2.gov.bc.ca/gov/content?id=79F93E018712422FBC8E674A67A70535',
        privacyStatement:
            'https://www2.gov.bc.ca/gov/content?id=9E890E16955E4FF4BF3B0E07B4722932',
        copyrightNotice:
            'Copyright �� 2023 Province of British Columbia - Open Government License',
        copyrightLicense:
            'https://www2.gov.bc.ca/gov/content?id=A519A56BC2BF44E4A008B33FCF527F61',
        features: [],
    },
};

const unsortedResponse = {
    data: {
        features: [
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    crs: {
                        type: 'EPSG',
                        properties: {
                            code: 4326,
                        },
                    },
                    coordinates: [-119.5933012, 49.5016805],
                },
                properties: {
                    fullAddress: '100 Main St, Penticton, BC',
                    score: 89,
                    matchPrecision: 'CIVIC_NUMBER',
                    precisionPoints: 100,
                    faults: [
                        {
                            value: '',
                            element: 'LOCALITY',
                            fault: 'missing',
                            penalty: 10,
                        },
                        {
                            value: '',
                            element: 'PROVINCE',
                            fault: 'missing',
                            penalty: 1,
                        },
                    ],
                    siteName: '',
                    unitDesignator: '',
                    unitNumber: '',
                    unitNumberSuffix: '',
                    civicNumber: 100,
                    civicNumberSuffix: '',
                    streetName: 'Main',
                    streetType: 'St',
                    isStreetTypePrefix: 'false',
                    streetDirection: '',
                    isStreetDirectionPrefix: '',
                    streetQualifier: '',
                    localityName: 'Penticton',
                    localityType: 'City',
                    electoralArea: '',
                    provinceCode: 'BC',
                    locationPositionalAccuracy: 'high',
                    locationDescriptor: 'parcelPoint',
                    siteID: '514be83a-8446-4af3-9f82-2ed71d4a1916',
                    blockID: 2566070,
                    fullSiteDescriptor: '',
                    accessNotes: '',
                    siteStatus: 'active',
                    siteRetireDate: '9999-12-31',
                    changeDate: '2022-09-10',
                    isOfficial: 'true',
                },
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    crs: {
                        type: 'EPSG',
                        properties: {
                            code: 4326,
                        },
                    },
                    coordinates: [-125.5457424, 48.9434871],
                },
                properties: {
                    fullAddress: '100 Main St, Ucluelet, BC',
                    score: 88,
                    matchPrecision: 'BLOCK',
                    precisionPoints: 99,
                    faults: [
                        {
                            value: '',
                            element: 'LOCALITY',
                            fault: 'missing',
                            penalty: 10,
                        },
                        {
                            value: '',
                            element: 'PROVINCE',
                            fault: 'missing',
                            penalty: 1,
                        },
                    ],
                    siteName: '',
                    unitDesignator: '',
                    unitNumber: '',
                    unitNumberSuffix: '',
                    civicNumber: 100,
                    civicNumberSuffix: '',
                    streetName: 'Main',
                    streetType: 'St',
                    isStreetTypePrefix: 'false',
                    streetDirection: '',
                    isStreetDirectionPrefix: '',
                    streetQualifier: '',
                    localityName: 'Ucluelet',
                    localityType: 'District Municipality',
                    electoralArea: '',
                    provinceCode: 'BC',
                    locationPositionalAccuracy: 'low',
                    locationDescriptor: 'accessPoint',
                    siteID: 'abcdefghijkl;',
                    blockID: 368172,
                    fullSiteDescriptor: '',
                    accessNotes: '',
                    siteStatus: '',
                    siteRetireDate: '',
                    changeDate: '',
                    isOfficial: 'true',
                },
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    crs: {
                        type: 'EPSG',
                        properties: {
                            code: 4326,
                        },
                    },
                    coordinates: [-121.9229129, 50.707886],
                },
                properties: {
                    fullAddress: '100 Main St, Lillooet, BC',
                    score: 90,
                    matchPrecision: 'CIVIC_NUMBER',
                    precisionPoints: 100,
                    faults: [
                        {
                            value: '',
                            element: 'LOCALITY',
                            fault: 'missing',
                            penalty: 10,
                        },
                        {
                            value: '',
                            element: 'PROVINCE',
                            fault: 'missing',
                            penalty: 1,
                        },
                    ],
                    siteName: '',
                    unitDesignator: '',
                    unitNumber: '',
                    unitNumberSuffix: '',
                    civicNumber: 100,
                    civicNumberSuffix: '',
                    streetName: 'Main',
                    streetType: 'St',
                    isStreetTypePrefix: 'false',
                    streetDirection: '',
                    isStreetDirectionPrefix: '',
                    streetQualifier: '',
                    localityName: 'Lillooet',
                    localityType: 'District Municipality',
                    electoralArea: '',
                    provinceCode: 'BC',
                    locationPositionalAccuracy: 'high',
                    locationDescriptor: 'parcelPoint',
                    siteID: '9a7b69d1-521a-47c3-bbbd-6bf7a1a73a9a',
                    blockID: 366132,
                    fullSiteDescriptor: '',
                    accessNotes: '',
                    siteStatus: 'active',
                    siteRetireDate: '9999-12-31',
                    changeDate: '2022-09-10',
                    isOfficial: 'true',
                },
            },
        ],
    },
};

describe('Geocode API Caller tests', () => {
    test('geocode api caller should return one result', async () => {
        jest.spyOn(axios, 'get').mockResolvedValueOnce(geocodeResponse);
        const caller = new GeocodeAPICaller();
        const res = await caller.getAddress(
            '525 Superior Street, Victoria, BC',
        );
        expect(res.results.length).toBe(1);
        expect(res.results[0].score).toBe(100);
        expect(res.results[0].fullAddress).toBe(
            '525 Superior St, Victoria, BC',
        );
        expect(res.results[0].siteID).toBe(
            'dc9357ba-7f40-4395-9eda-219ca5f475c0',
        );
    });

    test('geocode api caller should sort unsorted results descending', async () => {
        jest.spyOn(axios, 'get').mockResolvedValueOnce(unsortedResponse);
        const caller = new GeocodeAPICaller();
        const res = await caller.getAddress('100 Main St');
        expect(res.results.length).toBe(3);
        expect(res.results[0].score).toBe(90);
        expect(res.results[1].score).toBe(89);
        expect(res.results[2].score).toBe(88);
    });

    test('geocode api caller should throw error on too short search', async () => {
        const caller = new GeocodeAPICaller();
        await expect(caller.getAddress('52')).rejects.toThrow(
            'Search string must be of length 3 or greater',
        );
    });

    test('geocode api caller should throw error with no endpoint provided', async () => {
        process.env.GEOCODER_API_ADDRESSES_ENDPOINT = '';
        process.env.GEOCODER_API_BASE_URL = '';
        const caller = new GeocodeAPICaller();
        await expect(
            caller.getAddress('525 Superior Street, Victoria, BC'),
        ).rejects.toThrow(
            `Geocoder API base URL or 'addresses' endpoint URL is undefined.`,
        );
    });

    test('geocode api caller should throw on axios error', async () => {
        jest.spyOn(axios, 'get').mockImplementationOnce(() => {
            throw new AxiosError('Request failed with status code 404');
        });
        const caller = new GeocodeAPICaller();
        await expect(
            caller.getAddress('525 Superior Street, Victoria, BC'),
        ).rejects.toThrow(`Request failed with status code 404`);
    });

    test('geocode api caller should throw on generic error', async () => {
        jest.spyOn(axios, 'get').mockImplementationOnce(() => {
            throw new Error('An unknown error occurred.');
        });
        const caller = new GeocodeAPICaller();
        await expect(
            caller.getAddress('525 Superior Street, Victoria, BC'),
        ).rejects.toThrow(`An unknown error occurred.`);
    });

    test('geocode api caller should throw on empty response', async () => {
        jest.spyOn(axios, 'get').mockResolvedValueOnce(emptyResponse);
        const caller = new GeocodeAPICaller();
        await expect(
            caller.getAddress('this address does not exist'),
        ).rejects.toThrow(
            `No results found for search string 'this address does not exist'`,
        );
    });

    test('geocode api caller should throw on empty response', async () => {
        jest.spyOn(axios, 'get').mockResolvedValueOnce(emptyResponse);
        const caller = new GeocodeAPICaller();
        await expect(
            caller.getAddress('this address does not exist'),
        ).rejects.toThrow(
            `No results found for search string 'this address does not exist'`,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
        process.env.GEOCODER_API_ADDRESSES_ENDPOINT =
            'https://geocoder.api.gov.bc.ca/';
        process.env.GEOCODER_API_BASE_URL = 'addresses.json';
    });
});
