import {
    createPinRequestBody,
    gcNotifyError,
    serviceBCCreateRequestBody,
} from '../helpers/types';

// API Responses to mock (sorry, this is a real response and it's long)
export const geocodeAddressAPIResponse = {
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
export const emptyAddressAPIResponse = {
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

export const unsortedAddressAPIResponse = {
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

export const geocodeParcelAPIResponse_1 = {
    data: { siteID: '785d65a0-3562-4ba7-a078-e088a7aada7c', pids: '030317304' },
};

export const geocodeParcelAPIResponse_2 = {
    data: { siteID: '785d65a0-3562-4ba7-a078-e088a7aada7c', pids: '123456789' },
};

export const ActivePINResponse = {
    livePinId: '92acf45b-09ce-4565-a358-895f36bb7383',
    pin: null,
    pids: '9765107',
    titleNumber: '123',
    landTitleDistrict: 'AB',
    titleStatus: 'R',
    fromTitleNumber: null,
    fromLandTitleDistrict: null,
    givenName: 'Name',
    lastName_1: 'Name',
    lastName_2: null,
    incorporationNumber: null,
    addressLine_1: '123 Main Street',
    addressLine_2: null,
    city: 'Vancouver',
    provinceAbbreviation: 'BC',
    provinceLong: null,
    country: 'Canada',
    postalCode: 'A1B2C3',
    createdAt: '2023-08-10T20:50:46.450Z',
    updatedAt: null,
};

export const ActivePINResponseWithPIN = {
    livePinId: '92acf45b-09ce-4565-a358-895f36bb7383',
    pin: 'ABCD1234',
    pids: '9765107',
    titleNumber: '123',
    landTitleDistrict: 'AB',
    titleStatus: 'R',
    fromTitleNumber: null,
    fromLandTitleDistrict: null,
    givenName: 'Name',
    lastName_1: 'Name',
    lastName_2: null,
    incorporationNumber: null,
    addressLine_1: '123 Main Street',
    addressLine_2: null,
    city: 'Vancouver',
    provinceAbbreviation: 'BC',
    provinceLong: null,
    country: 'Canada',
    postalCode: 'A1B2C3',
    createdAt: '2023-08-10T20:50:46.450Z',
    updatedAt: null,
};

export const ActivePINResponseNoPIN = {
    livePinId: '92acf45b-09ce-4565-a358-895f36bb7383',
    pids: '9765107',
    titleNumber: '123',
    landTitleDistrict: 'AB',
    titleStatus: 'R',
    fromTitleNumber: null,
    fromLandTitleDistrict: null,
    givenName: 'Name',
    lastName_1: 'Name',
    lastName_2: null,
    incorporationNumber: null,
    addressLine_1: '123 Main Street',
    addressLine_2: null,
    city: 'Vancouver',
    provinceAbbreviation: 'BC',
    provinceLong: null,
    country: 'Canada',
    postalCode: 'A1B2C3',
    createdAt: '2023-08-10T20:50:46.450Z',
    updatedAt: null,
};

export const ActivePINMultiResponse = [
    {
        livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
        pin: 'abcdefgh',
        pids: '1234',
        titleNumber: '1234agsj',
        landTitleDistrict: 'bc',
        titleStatus: 'R',
        fromTitleNumber: null,
        fromLandTitleDistrict: null,
        givenName: null,
        lastName_1: null,
        lastName_2: null,
        incorporationNumber: null,
        addressLine_1: '123 main st',
        addressLine_2: null,
        city: 'penticton',
        provinceAbbreviation: null,
        provinceLong: null,
        country: 'canada',
        postalCode: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
    },

    {
        livePinId: '5df6bad9-09bc-4d50-8f76-19cf503b41ab',
        pin: 'hgfedcba',
        pids: '4321',
        titleNumber: '1867rbcd',
        landTitleDistrict: 'bc',
        titleStatus: 'R',
        fromTitleNumber: null,
        fromLandTitleDistrict: null,
        givenName: null,
        lastName_1: null,
        lastName_2: null,
        incorporationNumber: null,
        addressLine_1: '123 main st',
        addressLine_2: null,
        city: 'golden',
        provinceAbbreviation: null,
        provinceLong: null,
        country: 'canada',
        postalCode: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
    },
];

export const validCreatePinBodyInc: createPinRequestBody = {
    phoneNumber: '19021234567',
    email: 'example@example.com',
    lastName_1: 'None',
    pids: '1234|5678',
    incorporationNumber: '91011',
    addressLine_1: '123 example st',
    city: 'Vancouver',
    provinceAbbreviation: 'BC',
    country: 'Canada',
    postalCode: 'V1V1V1',
    numberOfOwners: 1,
};

export const validCreatePinBodyIncServiceBC: serviceBCCreateRequestBody = {
    phoneNumber: '19021234567',
    email: 'example@example.com',
    livePinId: 'cf430240-e5b6-4224-bd71-a02e098cc6e8',
    propertyAddress: '123 example st, Vancouver, BC, Canada, V1V1V1',
};

export const validCreatePinBodyName: createPinRequestBody = {
    phoneNumber: '19021234567',
    email: 'example@example.com',
    pids: '1234|5678',
    givenName: 'John',
    lastName_1: 'Smith',
    addressLine_1: '123 example st',
    city: 'Vancouver',
    provinceAbbreviation: 'BC',
    country: 'Canada',
    postalCode: 'V1V1V1',
    numberOfOwners: 1,
};

export const validCreatePinBodySinglePid: createPinRequestBody = {
    phoneNumber: '19021234567',
    lastName_1: 'None',
    email: 'example@example.com',
    pids: '1234',
    incorporationNumber: '91011',
    addressLine_1: '123 example st',
    city: 'Vancouver',
    provinceAbbreviation: 'BC',
    country: 'Canada',
    postalCode: 'V1V1V1',
    numberOfOwners: 1,
};

export const invalidCreatePinBodySinglePid: createPinRequestBody = {
    phoneNumber: '19021234567',
    lastName_1: 'None',
    email: 'example@example.com',
    pids: '1234',
    incorporationNumber: '91011',
    addressLine_1: '123 example st',
    city: 'Vancouver',
    provinceAbbreviation: 'BC',
    country: 'Canada',
    postalCode: 'V1V1V1',
    numberOfOwners: 7,
};

export const validCreatePinBodySinglePidServiceBC: serviceBCCreateRequestBody =
    {
        phoneNumber: '19021234567',
        email: 'example@example.com',
        livePinId: 'cf430240-e5b6-4224-bd71-a02e098cc6e8',
        propertyAddress: '123 example st, Vancouver, BC, Canada, V1V1V1',
    };

export const validCreatePinBodyNameAddLineProvLong: createPinRequestBody = {
    phoneNumber: '19021234567',
    email: 'example@example.com',
    pids: '1234|5678',
    givenName: 'John',
    lastName_1: 'Smith',
    addressLine_1: '123 example st',
    addressLine_2: 'Unit 100A',
    city: 'Vancouver',
    country: 'Canada',
    numberOfOwners: 1,
};

export const validCreatePinBodyNameAddLineCountry: createPinRequestBody = {
    phoneNumber: '19021234567',
    email: 'example@example.com',
    pids: '1234|5678',
    givenName: 'John',
    lastName_1: 'Smith',
    addressLine_1: '123 example st',
    addressLine_2: 'Unit 100A',
    country: 'Canada',
    numberOfOwners: 1,
};

export const validCreatePinBodyNameAddLinePostalCode: createPinRequestBody = {
    phoneNumber: '19021234567',
    email: 'example@example.com',
    pids: '1234|5678',
    givenName: 'John',
    lastName_1: 'Smith',
    addressLine_1: '123 example st',
    addressLine_2: 'Unit 100A',
    postalCode: 'V1V1V1',
    numberOfOwners: 1,
};

export const validCreatePinBodyNameAddLineProvLongOnly: createPinRequestBody = {
    phoneNumber: '19021234567',
    email: 'example@example.com',
    pids: '1234|5678',
    givenName: 'John',
    lastName_1: 'Smith',
    addressLine_1: '123 example st',
    addressLine_2: 'Unit 100A',
    country: 'Canada',
    numberOfOwners: 1,
};

export const validCreatePinBodyNameAddLineProvAbbrev: createPinRequestBody = {
    phoneNumber: '19021234567',
    email: 'example@example.com',
    pids: '1234|5678',
    givenName: 'John',
    lastName_1: 'Smith',
    addressLine_1: '123 example st',
    addressLine_2: 'Unit 100A',
    provinceAbbreviation: 'BZ',
    country: 'Canada',
    numberOfOwners: 1,
};

export const validCreatePinBodyNameAddLineProvAbbrevLong: createPinRequestBody =
    {
        phoneNumber: '19021234567',
        email: 'example@example.com',
        pids: '1234|5678',
        givenName: 'John',
        lastName_1: 'Smith',
        addressLine_1: '123 example st',
        addressLine_2: 'Unit 100A',
        provinceAbbreviation: 'BZ',
        country: 'Canada',
        numberOfOwners: 1,
    };

export const invalidCreatePinBodyWrongPhone: createPinRequestBody = {
    phoneNumber: '88234',
    email: 'example@example.com',
    pids: '1234|5678',
    incorporationNumber: '91011',
    givenName: 'John',
    lastName_1: 'Smith',
    addressLine_1: '123 example st',
    city: 'Vancouver',
    provinceAbbreviation: 'BC',
    country: 'Canada',
    postalCode: 'V1V1V1',
    numberOfOwners: 1,
};

export const invalidCreatePinBodyWrongPhoneServiceBC: serviceBCCreateRequestBody =
    {
        phoneNumber: '88234',
        email: 'example@example.com',
        livePinId: 'cf430240-e5b6-4224-bd71-a02e098cc6e8',
        propertyAddress: '123 example st, Vancouver, BC, Canada, V1V1V1',
    };

export const invalidCreatePinBodyNoPhoneEmail: createPinRequestBody = {
    pids: '1234|5678',
    lastName_1: 'None',
    incorporationNumber: '91011',
    addressLine_1: '123 example st',
    city: 'Vancouver',
    provinceAbbreviation: 'BC',
    country: 'Canada',
    postalCode: 'V1V1V1',
    numberOfOwners: 1,
};

export const invalidCreatePinBodyIncorrectPhone: createPinRequestBody = {
    phoneNumber: '+81334335111',
    lastName_1: 'None',
    pids: '1234|5678',
    incorporationNumber: '91011',
    addressLine_1: '123 example st',
    city: 'Vancouver',
    provinceAbbreviation: 'BC',
    country: 'Canada',
    postalCode: 'V1V1V1',
    numberOfOwners: 1,
};

export const invalidCreatePinBodyPinLength: createPinRequestBody = {
    pinLength: 0,
    allowedChars: 'A',
    phoneNumber: '19021234567',
    email: 'example@example.com',
    pids: '1234',
    givenName: 'John',
    lastName_1: 'Smith',
    addressLine_1: '123 example st',
    city: 'Vancouver',
    provinceAbbreviation: 'BC',
    country: 'Canada',
    postalCode: 'V1V1V1',
    numberOfOwners: 1,
};

export const invalidCreatePinBodyPinLengthServiceBC: serviceBCCreateRequestBody =
    {
        pinLength: 0,
        allowedChars: 'A',
        phoneNumber: '19021234567',
        email: 'example@example.com',
        livePinId: 'cf430240-e5b6-4224-bd71-a02e098cc6e8',
        propertyAddress: '123 example st, Vancouver, BC, Canada, V1V1V1',
    };

export const invalidCreatePinBodyWrongLastName1: createPinRequestBody = {
    phoneNumber: '19021234567',
    email: 'example@example.com',
    lastName_1: 'None',
    pids: '1234|5678',
    addressLine_1: '123 example st',
    city: 'Vancouver',
    provinceAbbreviation: 'BC',
    country: 'Canada',
    postalCode: 'V1V1V1',
    numberOfOwners: 1,
};

export const invalidCreatePinBodyNoCountry: createPinRequestBody = {
    phoneNumber: '19021234567',
    email: 'example@example.com',
    lastName_1: 'None',
    pids: '1234|5678',
    addressLine_1: '123 example st',
    city: 'Vancouver',
    provinceAbbreviation: 'BC',
    postalCode: 'V1V1V1',
    numberOfOwners: 1,
};

export const AuditLogMultiResponse = [
    {
        logId: 'd452065c-d756-4877-8ba3-ab6e6042f422',
        expiredAt: '2023-08-25T15:12:59.810Z',
        expirationReason: 'OR',
        sentToEmail: null,
        sentToPhone: '19021234567',
        pinCreatedAt: '2023-08-24T15:01:59.488Z',
        updatedAt: '2023-08-25T15:12:59.810Z',
        alteredByUsername: 'self',
        livePinId: '31be8df8-3284-4b05-bb2b-f11b7e77cba0',
        action: 'R',
        logCreatedAt: '2023-08-25T15:12:59.810Z',
        titleNumber: undefined,
        landTitleDistrict: undefined,
        fromTitleNumber: undefined,
        fromLandTitleDistrict: undefined,
        titleStatus: undefined,
    },
    {
        logId: '82dc08e5-cbca-40c2-9d35-a4d1407d5f8d',
        expiredAt: null,
        expirationReason: null,
        sentToEmail: null,
        sentToPhone: '19021234567',
        pinCreatedAt: '2023-08-24T15:01:49.628Z',
        updatedAt: '2023-08-24T15:06:27.269Z',
        alteredByUsername: 'self',
        livePinId: '31be8df8-3284-4b05-bb2b-f11b7e77cba0',
        action: 'C',
        logCreatedAt: '2023-08-24T15:06:27.269Z',
        titleNumber: undefined,
        landTitleDistrict: undefined,
        fromTitleNumber: undefined,
        fromLandTitleDistrict: undefined,
        titleStatus: undefined,
    },
];

export const GCNotifyEmailSuccessResponse = {
    status: 200,
    data: {
        id: '73307f99-4bba-4a24-a8dd-e270d07509a0',
        reference: null,
        uri: 'https://api.notification.canada.ca/v2/notifications/73307f99-4bba-4a24-a8dd-e270d07509a0',
        template: {
            id: 'cf430240-e5b6-4224-bd71-a02e098cc6e8', // this isn't one of our actual template ids, I've edited the response
            version: 1,
            uri: 'https://api.notification.canada.ca/services/bf3f9c9f-fcfe-45e3-aea9-bae75f93d741/templates/cf430240-e5b6-4224-bd71-a02e098cc6e8',
        },
        scheduled_for: null,
        content: {
            from_email: 'noreply_hers@notification.canada.ca',
            body: 'This is a test.\r\n' + 'This should work',
            subject: 'BC VHERS Create PIN',
        },
    },
};

export const GCNotifyEmailErrorResponse: gcNotifyError = {
    response: {
        status: 400,
        statusText: 'Bad Request',
        data: {
            status_code: 400,
            errors: [
                { error: 'BadRequestError', message: 'Template not found' },
            ],
        },
    },
};

export const GCNotifyPhoneSuccessResponse = {
    status: 200,
    data: {
        id: '73307f99-4bba-4a24-a8dd-e270d07509a0',
        reference: null,
        uri: 'https://api.notification.canada.ca/v2/notifications/73307f99-4bba-4a24-a8dd-e270d07509a0',
        template: {
            id: 'cf430240-e5b6-4224-bd71-a02e098cc6e8', // this isn't one of our actual template ids, I've edited the response
            version: 1,
            uri: 'https://api.notification.canada.ca/services/bf3f9c9f-fcfe-45e3-aea9-bae75f93d741/templates/cf430240-e5b6-4224-bd71-a02e098cc6e8',
        },
        scheduled_for: null,
        content: {
            from_email: '+11234567890',
            body: 'This is a test.\r\n' + 'This should work',
        },
    },
};
