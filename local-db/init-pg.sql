\connect postgres

-- USER -------------------------------------------
-- Table Definition ----------------------------------------------

CREATE EXTENSION citext;
CREATE TYPE role_type AS ENUM ('Standard', 'Admin', 'SuperAdmin');

CREATE TABLE IF NOT EXISTS "user" (
    user_id UUID PRIMARY KEY NOT NULL,
    user_guid VARCHAR(36) NOT NULL,
    role role_type NOT NULL, 
    organization VARCHAR(50) NOT NULL,
    email CITEXT NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(75) NOT NULL,
    is_active BOOLEAN NOT NULL,
);

-- ACTIVE PIN -------------------------------------------
-- Table Definition ----------------------------------------------

-- PARCEL STATUS TYPES: 
    -- A - Active
    -- I - Inactive (i.e., cancelled)

CREATE TYPE parcel_status_type AS ENUM ('A', 'I');

-- TITLE STATUS TYPES:
    -- R - Registered
    -- C - Cancelled

CREATE TYPE title_status_type AS ENUM ('R', 'C');

CREATE TABLE IF NOT EXISTS "active_pin" (
    live_pin_id UUID PRIMARY KEY NOT NULL,
    pin VARCHAR(8),
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


-- PERMISSION -------------------------------------------
-- Table Definition ----------------------------------------------

CREATE TABLE IF NOT EXISTS "permission" (
    permission_id UUID PRIMARY KEY NOT NULL,
    permission VARCHAR(50) NOT NULL,
    role role_type NOT NULL
);

-- LOG -------------------------------------------
-- Table Definition ----------------------------------------------

-- PIN EXPIRATION REASONS: 
    -- OP - Opt-out
    -- CC - call center pin reset (i.e., forgotten PIN)
    -- OR - online pin reset
    -- CO - change of ownership (title cancelled or parcel inactive)

CREATE TYPE expiration_reason_type AS ENUM ('OP', 'CC', 'OR', 'CO');

CREATE TABLE IF NOT EXISTS "pin_audit_log" (
    log_id UUID PRIMARY KEY NOT NULL,
    pin VARCHAR(8) NOT NULL,
    pid INT NOT NULL,
    parcel_status parcel_status_type NOT NULL,
    title_number VARCHAR(11) NOT NULL, 
    land_title_district VARCHAR(2) NOT NULL,
    fron_title_number VARCHAR(11),
    from_land_title_district VARCHAR(2),
    title_status title_status_type NOT NULL,
    key DATE NOT NULL, 
    expired_at DATE, 
    expiration_reason expiration_reason_type, 
    sent_to_email VARCHAR(100), 
    sent_to_phone VARCHAR(12)
);
