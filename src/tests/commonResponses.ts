import { AccessRequest } from '../entity/AccessRequest';
import { Users } from '../entity/Users';
import {
    accessRequestResponseBody,
    accessRequestUpdateRequestBody,
    createPinRequestBody,
    gcNotifyError,
    requestStatusType,
    serviceBCCreateRequestBody,
    userDeactivateRequestBody,
    userUpdateRequestBody,
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
    propertyAddress: '123 example street',
};

export const validCreatePinBodyIncServiceBC: serviceBCCreateRequestBody = {
    phoneNumber: '14162345678',
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
    propertyAddress: '123 example street',
};

export const validCreatePinBodySinglePid: createPinRequestBody = {
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
    propertyAddress: '123 example street',
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
    propertyAddress: '123 example street',
};

export const validCreatePinBodySinglePidServiceBC: serviceBCCreateRequestBody =
    {
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
    propertyAddress: '123 example street',
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
    propertyAddress: '123 example street',
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
    propertyAddress: '123 example street',
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
    propertyAddress: '123 example street',
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
    propertyAddress: '123 example street',
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
        propertyAddress: '123 example street',
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
    propertyAddress: '123 example street',
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
    propertyAddress: '123 example street',
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
    propertyAddress: '123 example street',
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
    propertyAddress: '123 example street',
};

export const invalidCreatePinBodyPinLengthServiceBC: serviceBCCreateRequestBody =
    {
        pinLength: 0,
        allowedChars: 'A',
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
    propertyAddress: '123 example street',
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
    propertyAddress: '123 example street',
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

export const createOrRecreatePinServiceBCSuccessResponse = [
    {
        pin: 'ABCD1234',
        pids: '1234|5678',
        livePinId: 'cf430240-e5b6-4224-bd71-a02e098cc6e8',
    },
];

export const createOrRecreatePinServiceBCSuccessResponseSinglePid = [
    {
        pin: 'ABCD1234',
        pids: '1234',
        livePinId: 'cf430240-e5b6-4224-bd71-a02e098cc6e8',
    },
];

export const createOrRecreatePinServiceBCFailureResponse = {
    message: 'Error(s) occured in batchUpdatePin: ',
    faults: [
        'An error occured while updating updatedPins[0] in batchUpdatePin: unknown error',
    ],
};

export const AccessRequestBody: accessRequestResponseBody = {
    userGuid: '82dc08e5-cbca-40c2-9d35-a4d1407d5f8d',
    identityType: 'idir',
    requestedRole: 'Admin',
    organization: 'Bc Service',
    email: 'abc@gov.ca',
    userName: 'johndoe',
    givenName: 'John',
    lastName: 'Doe',
    requestReason: 'To get access to site',
};

export const AccessRequestUpdateRequestBody: accessRequestUpdateRequestBody = {
    requestedRoles: ['Admin'],
    emails: ['abc@gov.ca'],
    givenNames: ['John'],
    lastNames: ['Doe'],
    rejectionReason: 'Not allowed access',
    requestIds: ['123'],
    action: requestStatusType.Rejected,
};

export const UserDeactivateRequestBody: userDeactivateRequestBody = {
    emails: ['abc@gov.ca'],
    givenNames: ['John'],
    lastNames: ['Doe'],
    deactivationReason: 'Not allowed access',
    userIds: ['123'],
};

export const UserUpdateRequestBody: userUpdateRequestBody = {
    email: 'abc@gov.ca',
    givenName: 'John',
    lastName: 'Doe',
    role: 'Admin',
    userId: '123',
    userName: 'JohnDoe',
    organization: 'BC Government',
};

export const UsersMultiResponse = [
    {
        userID: 'd452065c-d756-4877-8ba3-ab6e6042f422',
        userGuid: '82dc08e5-cbca-40c2-9d35-a4d1407d5f8d',
        identityType: 'idir',
        role: 'Admin',
        email: 'abc@gov.ca',
        givenName: 'John',
        lastName: 'Doe',
        isActive: true,
    },
    {
        userID: '037544f5-f95a-4169-961b-f229ec1f5c19',
        userGuid: '88e8c8c3-419b-4902-92fa-4ffbddcd548c',
        identityType: 'idir',
        role: 'Admin',
        email: 'def@gov.ca',
        givenName: 'Jane',
        lastName: 'White',
        isActive: true,
    },
];

export const AdminPermissionResponse = [
    { permission: 'USER_ACCESS' },
    { permission: 'PROPERTY_SEARCH' },
    { permission: 'ACCESS_REQUEST' },
];

export const SampleSuperAdminTokenPayload = {
    identity_provider: 'idir',
    sid: 'f2291e4e-ea0b-4eb4-bc35-06a9bb7d1eb4',
    idir_user_guid: '12FC98EA15007D2F704B95DEFC3D2DDF',
    idir_username: 'EXAMPLE',
    username: 'EXAMPLE',
    preferred_username: '12fc98ea15007d2f704b95defc3d2ddf@idir',
    given_name: 'Test',
    display_name: 'Test User',
    family_name: 'User',
    email: 'example@test.com',
    role: 'SuperAdmin',
    permissions: [
        'USER_ACCESS',
        'VIEW_PIN',
        'PROPERTY_SEARCH',
        'ACCESS_REQUEST',
    ],
};

export const NamelessTokenPayload = {
    identity_provider: 'idir',
    sid: 'f2291e4e-ea0b-4eb4-bc35-06a9bb7d1eb4',
    idir_user_guid: '12FC98EA15007D2F704B95DEFC3D2DDF',
    idir_username: '',
    username: '',
    given_name: '',
    family_name: '',
    preferred_username: '12fc98ea15007d2f704b95defc3d2ddf@idir',
    email: 'example@test.com',
    role: 'SuperAdmin',
    permissions: [
        'USER_ACCESS',
        'VIEW_PIN',
        'PROPERTY_SEARCH',
        'ACCESS_REQUEST',
    ],
};

export const LastNameOnlyTokenPayload = {
    identity_provider: 'idir',
    sid: 'f2291e4e-ea0b-4eb4-bc35-06a9bb7d1eb4',
    idir_user_guid: '12FC98EA15007D2F704B95DEFC3D2DDF',
    preferred_username: '12fc98ea15007d2f704b95defc3d2ddf@idir',
    email: 'example@test.com',
    role: 'SuperAdmin',
    family_name: 'abcd',
    permissions: [
        'USER_ACCESS',
        'VIEW_PIN',
        'PROPERTY_SEARCH',
        'ACCESS_REQUEST',
    ],
};

export const NoPropertySearchTokenPayload = {
    identity_provider: 'idir',
    sid: 'f2291e4e-ea0b-4eb4-bc35-06a9bb7d1eb4',
    idir_user_guid: '12FC98EA15007D2F704B95DEFC3D2DDF',
    preferred_username: '12fc98ea15007d2f704b95defc3d2ddf@idir',
    email: 'example@test.com',
    username: 'abc',
    role: 'SuperAdmin',
    family_name: 'abcd',
    permissions: [],
};

export const SampleBCEIDBUsinessAdminTokenPayload = {
    identity_provider: 'bceidbusiness',
    sid: 'f2291e4e-ea0b-4eb4-bc35-06a9bb7d1eb4',
    bceid_user_guid: '12FC98EA15007D2F704B95DEFC3D2DDF',
    bceid_username: 'Example',
    username: 'Example',
    preferred_username: '12fc98ea15007d2f704b95defc3d2ddf@idir',
    given_name: 'Example User',
    display_name: '',
    family_name: '',
    email: 'example@test.com',
    role: 'Admin',
    permissions: ['USER_ACCESS', 'PROPERTY_SEARCH', 'ACCESS_REQUEST'],
};

export const DeletePINSuccessResponse = {
    livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
    pin: '12345678',
    pids: '1213',
    titleNumber: '123',
    landTitleDistrict: '12',
    titleStatus: 'R',
    fromTitleNumber: null,
    fromLandTitleDistrict: null,
    givenName: 'Jane',
    lastName_1: 'Purple',
    lastName_2: null,
    incorporationNumber: null,
    addressLine_1: '123 example street',
    addressLine_2: null,
    city: 'Vancouver',
    provinceAbbreviation: 'BC',
    provinceLong: null,
    country: 'Canada',
    postalCode: null,
};

export const validFindUserResponse: Users[] = [
    {
        userId: '618ac8f9-07ce-4615-8388-b0396ebe7e1d',
        userGuid: 'A84D1AB221334298956C47A7B623E983',
        identityType: 'idir',
        role: 'SuperAdmin',
        organization: 'abc',
        email: 'example@test.com',
        userName: 'Example',
        givenName: 'Test',
        lastName: 'User',
        isActive: true,
        updatedAt: null,
        createdAt: new Date(Date.now()),
        updatedBy: null,
        deactivationReason: null,
    },
];

export const weightsThresholds = {
    thresholds: {
        overallThreshold: 1,
        borderlineThreshold: 0,
        givenNameThreshold: 0.95,
        lastNamesThreshold: 0.95,
        incorporationNumberThreshold: 1,
        ownerNumberThreshold: 1,
        streetAddressThreshold: 0.85,
        cityThreshold: 0.8,
        provinceAbbreviationThreshold: 0.95,
        countryThreshold: 0.8,
        postalCodeThreshold: 1,
    },
    weights: {
        givenNameWeight: 0.2,
        lastNamesWeight: 0.2,
        incorporationNumberWeight: 0.2,
        ownerNumberWeight: 0.125,
        streetAddressWeight: 0.125,
        cityWeight: 0.02,
        provinceAbbreviationWeight: 0.01,
        countryWeight: 0.01,
        postalCodeWeight: 0.31,
    },
    fuzzinessCoefficients: {
        givenNameFuzzyCoefficient: 0.95,
        lastNamesFuzzyCoefficient: 0.95,
        incorporationNumberFuzzyCoefficient: 0,
        streetAddressFuzzyCoefficient: 0.95,
        cityFuzzyCoefficient: 0.95,
        provinceAbbreviationFuzzyCoefficient: 0.95,
        countryFuzzyCoefficient: 0.95,
        postalCodeFuzzyCoefficient: 0,
    },
    streetAddressLooseMatchReductionCoefficient: 0.25,
};

export const AccessRequestValidBody = {
    userGuid: '82dc08e5-cbca-40c2-9d35-a4d1407d5f8d',
    identityType: 'idir',
    requestedRole: 'Admin',
    organization: 'Bc Service',
    email: 'abc@gov.ca',
    userName: 'johndoe',
    givenName: 'John',
    lastName: 'Doe',
    requestReason: 'To get access to site',
};

export const AccessRequestPostNoOrgIdir = {
    userGuid: '82dc08e5-cbca-40c2-9d35-a4d1407d5f8d',
    identityType: 'idir',
    requestedRole: 'Admin',
    organization: '',
    email: 'abc@gov.ca',
    userName: 'johndoe',
    givenName: 'John',
    lastName: 'Doe',
    requestReason: 'To get access to site',
};

export const AccessRequestPostNoReason = {
    userGuid: '82dc08e5-cbca-40c2-9d35-a4d1407d5f8d',
    identityType: 'idir',
    requestedRole: 'Admin',
    organization: 'abcd',
    email: 'abc@gov.ca',
    userName: 'johndoe',
    givenName: 'John',
    lastName: 'Doe',
    requestReason: '',
};

export const UserRequestPendingResponse: AccessRequest[] = [
    {
        requestId: '82dc08e5-cbca-40c2-9d35-a4d1407d5f8d',
        userGuid: 'A84D1AB221334298956C47A7B623E983',
        identityType: 'idir',
        requestedRole: 'Standard',
        organization: 'org',
        email: 'abc@gov.ca',
        userName: 'user',
        givenName: 'User',
        lastName: 'Name',
        requestReason: 'To get access to site',
        requestStatus: 'NotGranted',
        rejectionReason: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
        updatedBy: null,
    },
];

export const UserRequestCompletedResponse: AccessRequest[] = [
    {
        requestId: '82dc08e5-cbca-40c2-9d35-a4d1407d5f8d',
        userGuid: 'A84D1AB221334298956C47A7B623E983',
        identityType: 'idir',
        requestedRole: 'Standard',
        organization: 'org',
        email: 'abc@gov.ca',
        userName: 'user',
        givenName: 'User',
        lastName: 'Name',
        requestReason: 'To get access to site',
        requestStatus: 'Granted',
        rejectionReason: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
        updatedBy: null,
    },
];

export const ValidUpdateAccessRequestBody: accessRequestUpdateRequestBody = {
    action: requestStatusType.Granted,
    requestIds: [
        '82dc08e5-cbca-40c2-9d35-a4d1407d5f8d',
        '82dc08e5-cbca-40c2-9d35-a4d1407d5f8e',
    ],
    emails: ['abc@gov.ca', 'def@gov.ca'],
    givenNames: ['John', 'Jane'],
    lastNames: ['Smith', 'Smith'],
    requestedRoles: ['Admin', 'Admin'],
};

export const UpdateAccessRequestBodyNoReason: accessRequestUpdateRequestBody = {
    action: requestStatusType.Rejected,
    requestIds: [
        '82dc08e5-cbca-40c2-9d35-a4d1407d5f8d',
        '82dc08e5-cbca-40c2-9d35-a4d1407d5f8e',
    ],
    emails: ['abc@gov.ca', 'def@gov.ca'],
    givenNames: ['John', 'Jane'],
    lastNames: ['Smith', 'Smith'],
    requestedRoles: ['Admin', 'Admin'],
};

export const UpdateAccessRequestBodyNoIds = {
    action: requestStatusType.Granted,
    requestIds: [],
    emails: ['abc@gov.ca', 'def@gov.ca'],
    givenNames: ['John', 'Jane'],
    lastNames: ['Smith', 'Smith'],
    requestedRoles: ['Admin', 'Admin'],
};
