\connect postgres

-- USER -------------------------------------------
-- Table Definition ----------------------------------------------

CREATE EXTENSION citext;
CREATE TYPE role_type AS ENUM ('Standard', 'Admin', 'SuperAdmin');

CREATE TABLE IF NOT EXISTS "user" (
    user_id UUID PRIMARY KEY NOT NULL,
    bceid_user_guid VARCHAR(36),
    idir_user_guid VARCHAR(36),
    role role_type NOT NULL, 
    email CITEXT,
    first_name VARCHAR(50),
    last_name VARCHAR(75),
    display_name VARCHAR(125),
    CHECK (bceid_user_guid IS NOT NULL OR idir_user_guid IS NOT NULL)
);

-- ACTIVE PIN -------------------------------------------
-- Table Definition ----------------------------------------------

CREATE TYPE parcel_status_type AS ENUM ('A', 'I');
CREATE TYPE title_status_type AS ENUM ('R', 'C');

CREATE TABLE IF NOT EXISTS "active_pin" (
    live_pin_id UUID PRIMARY KEY NOT NULL,
    pin VARCHAR(8) NOT NULL,
    pid INT NOT NULL,
    parcel_status parcel_status_type NOT NULL,
    title_number VARCHAR(11) NOT NULL,
    land_title_district VARCHAR(2) NOT NULL,
    title_status title_status_type NOT NULL,
    from_title_number VARCHAR(11),
    from_land_title_district VARCHAR(2),
    given_name VARCHAR(50),
    last_name_1 VARCHAR(75),
    last_name_2 VARCHAR(75),
    incorporation_number VARCHAR(12),
    address_line_1 VARCHAR(65) NOT NULL,
    address_line_2 VARCHAR(65),
    city VARCHAR(30) NOT NULL,
    province CHAR(2),
    other_geographic_division VARCHAR(24),
    country VARCHAR(38) NOT NULL,
    postal_code VARCHAR(12),
    created_at DATE NOT NULL,
    updated_at DATE
);
