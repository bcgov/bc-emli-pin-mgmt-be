--- Inserting entries into each table to give us a timestamp of what to delete
INSERT INTO public.active_pin
(live_pin_id, pin, pids, title_number, land_title_district, title_status, last_name_1, address_line_1, city, province_abbreviation, postal_code, created_at)
VALUES('abcd0000-0000-0000-0000-000000000000', '!!!!!!!!', '000000000', '1234', 'ab', 'R', 'loadteststart', '123 MAIN ST', 'PENTICTON', 'BC', 'A1A1A1', now());
--- This creates a pin_audit_log entry
UPDATE public.active_pin
SET pin='!!!!!!!!' 
WHERE live_pin_id='abcd0000-0000-0000-0000-000000000000';
INSERT INTO public.vhers_audit_log
(log_id, response_time_ms, endpoint_name, status_code, created_at)
VALUES(uuid_generate_v4(), 0, 'loadteststart', 0, now());
--- COPY in the csv table to active pin
\COPY public.active_pin(live_pin_id,pids,title_number,land_title_district,title_status,last_name_1) FROM 'load-test-insert.csv' DELIMITER ',' CSV HEADER;
