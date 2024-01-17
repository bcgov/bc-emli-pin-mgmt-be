# Load testing instructions

WARNING: This load test requires loading and subsequently deleting database records. As a result, you should ensure that no one is actively using your system during the load test, as any entries creating during the testing period in the active_pin, pin_audit_log and vhers_audit_log tables will be deleted!

The load test consists of three seperate shell scripts, used for different scenarios. The scripts are as follows:

| Script name  |  Description |
|---|---|
|`run-with-post-clean.sh`  | The standard script. Use this to load the database with data, execute the test files in a sequential order and then delete any created data and logs in the db. The load test summaries and detailed info will not be deleted |
| `run-no-post-clean.sh` |  Debug script. Use this to load the databse and execute the test files, but leave changes to the db intact. Useful for debugging, but you will have to manually run the next script to clean up afterwards. |
| `clean-only.sh`  | Cleans the database only. The load test summaries and detailed info will not be deleted. Use after the debug script mentioned above. |

Thes scripts can be run by simply typing `sh <script-name>` in your terminal. The load test scripts create a summary report in html format for each test, as well as detailed reports in csv format in a timestamped subdirectory of the /results folder.

Before running any of these scripts, you will need to ensure a few things:

1. If not installed already, install postgresql and [k6](https://k6.io/docs/get-started/installation/). Note that on MacOS, you may need to [install Postgres.app and export the PATH variable](https://postgresapp.com/documentation/install.html) to run the psql command. To check if you have the oath variable configured, just try to run `psql` from your terminal. If the command is not found, follow the steps at the above link.
2. If running against a local instance, ensure that both the backend and the virus scan are running, as both of them are hit by these tests
3. As mentioned above, make sure that no one is using either server for the duration of the load test. Not only will it skew the test results, any changes they made may be deleted by the clean up script!
4. If using a server depending on a non-local instance of the database, make sure you port forward the database to an appropriate port using the `oc port-forward` command
5. You must configure the shell variables mentioned at the top of each file you wish to run. For the clean script, all variables must be configured.

The variables that can be configured are as follows. Note that only the variables up to 'VIRUS_API_KEY' are required to be configured to run the test with defaults.

| Variable name | Default value | Description |
|---|---|---|
| DB_NAME|'your-db-name' | Your database name   |
| DB_USERNAME|'username' | Database username. Note that since the load script uses the COPY command, this requires superuser privileges   |
| DB_PORT|11111 | Database port   |
| DB_PASSWORD|'password' | Database password   |
| VIRUS_SCAN_URL|'virus scan url here'  |  URL for the virus scan server you wish to test against  |
| URL|'be server url here' | URL for the backend server you wish to test against   |
| API_KEY|'key here' |  API key for the backend server  |
| VIRUS_API_KEY |'virus scan api key here'| API key for the virus scan server|
| VERIFY_ENDPOINT|'/pins/verify' | Path for the verify pins endpoint   |
| VERIFY_IDEAL_TARGET|20  | Target number of total iterations for the verify ideal test   |
| VERIFY_IDEAL_VUS|20 |  Target number of total vus (concurrent users) for the verify ideal test  |
| VERIFY_IDEAL_MAX_DURATION|'60' |  Maximum amount of time to run the verify ideal test for in seconds, excluding a 60 second graceful stop  |
| VERIFY_IDEAL_SLEEP|0.5 | Amount of time for each vu to 'sleep' in seconds between making requests in the verify ideal test after a previous request was fulfilled   |
| VERIFY_SPIKE_TARGET|100 | Target number of total iterations for the verify spike test   |
| VERIFY_SPIKE_VUS|20 | Target number of total vus (concurrent users) for the verify spike test |
| VERIFY_SPIKE_MAX_DURATION|'30' | Maximum amount of time to run the verify spike test for in seconds, excluding a 60 second graceful stop   |
| VERIFY_SPIKE_SLEEP|0.5 | Amount of time for each vu to 'sleep' in seconds between making requests in the verify spike test after a previous request was fulfilled    |
| VHERS_CREATE_ENDPOINT|'/pins/vhers-create' | Path for the vhers create endpoint   |
| CREATE_IDEAL_TARGET|100 | Target number of total iterations for the vhers create ideal test   |
| CREATE_IDEAL_VUS|50 | Target number of total vus (concurrent users) for the vhers create ideal test |
| CREATE_IDEAL_MAX_DURATION|'180' | Maximum amount of time to run the vhers create ideal test for in seconds, excluding a 60 second graceful stop |
| CREATE_IDEAL_SLEEP|2 | Amount of time for each vu to 'sleep' in seconds between making requests in the vhers create ideal test after a previous request was fulfilled |
| CREATE_SPIKE_TARGET|210 | Target number of total iterations for the vhers create spike test   |
| CREATE_SPIKE_VUS|70 | Target number of total vus (concurrent users) for the vhers create spike test   |
| CREATE_SPIKE_MAX_DURATION|'180' | Maximum amount of time to run the vhers create spike test for in seconds, excluding a 60 second graceful stop  |
| CREATE_SPIKE_SLEEP|2 | Amount of time for each vu to 'sleep' in seconds between making requests in the vhers create spike test after a previous request was fulfilled |
| VHERS_REGENERATE_ENDPOINT|'/pins/vhers-create' | Path for the vhers regenerate endpoint   |
| REGENERATE_IDEAL_TARGET|20 | Target number of total iterations for the vhers regenerate ideal test   |
| REGENERATE_IDEAL_VUS|10 | Target number of total vus (concurrent users) for the vhers regenerate ideal test   |
| REGENERATE_IDEAL_MAX_DURATION|'180' | Maximum amount of time to run the vhers regenerate ideal test for in seconds, excluding a 60 second graceful stop   |
| REGENERATE_IDEAL_SLEEP|2 | Amount of time for each vu to 'sleep' in seconds between making requests in the vhers regenerate ideal test after a previous request was fulfilled   |
| REGENERATE_SPIKE_TARGET|100 | Target number of total iterations for the vhers regenerate spike test   |
| REGENERATE_SPIKE_VUS|10 | Target number of total vus (concurrent users) for the vhers regenerate spike test   |
| REGENERATE_SPIKE_MAX_DURATION|'180' | Maximum amount of time to run the vhers regenerate spike test for in seconds, excluding a 60 second graceful stop   |
| REGENERATE_SPIKE_SLEEP|2 |  Amount of time for each vu to 'sleep' in seconds between making requests in the vhers regenerate spike test after a previous request was fulfilled   |
| VIRUS_SCAN_ENDPOINT|'/virus-scan' | Path for the virus scan endpoint   |
| VIRUS_SCAN_IDEAL_TARGET|50  | Target number of total iterations for the virus scan ideal test    |
| VIRUS_SCAN_IDEAL_VUS|10 | Target number of total vus (concurrent users) for the virus scan ideal test   |
| VIRUS_SCAN_IDEAL_MAX_DURATION|'60'  | Maximum amount of time to run the virus scan ideal test for in seconds, excluding a 60 second graceful stop |
| VIRUS_SCAN_SPIKE_TARGET|500  | Target number of total iterations for the virus scan spike test   |
| VIRUS_SCAN_SPIKE_VUS|100 | Target number of total vus (concurrent users) for the virus scan spike test    |
| VIRUS_SCAN_SPIKE_MAX_DURATION|'60'  | Maximum amount of time to run the virus scan spike test for in seconds, excluding a 60 second graceful stop   |
| VIRUS_SCAN_SLEEP|0.5 | Amount of time for each vu to 'sleep' in seconds between making requests in the virus scan tests (both ideal and spike) after a previous request was fulfilled  |
| EXPIRE_ENDPOINT|'/pins/etl-expire' | Path for the etl expire endpoint   |
| EXPIRE_IDEAL_MAX_DURATION|'360'  | Maximum amount of time to run the etl expire ideal test for in seconds, excluding a 60 second graceful stop    |
| EXPIRE_IDEAL_SLEEP_FRACTION|0.015 | The fraction of a second at which to stagger each request in the etl expire ideal test (so all 20,000 requests don't send simultaneously). For instance, 0.015 would send the first request 0.015 seconds into the test, then 0.03 seconds, then 0.045, etc.  |
| EXPIRE_SPIKE_MAX_DURATION|'600'  | Maximum amount of time to run the etl expire spike test for in seconds, excluding a 60 second graceful stop   |
| EXPIRE_SPIKE_SLEEP_FRACTION|0.007 | The fraction of a second at which to stagger each request in the etl expire ideal test (so all 70,000 requests don't send simultaneously). For instance, 0.007 would send the first request 0.007 seconds into the test, then 0.014 seconds, then 0.021, etc.   |

Note that for the etl-expire endpoint, the number of iterations and vus are already set at 20,000 and 70,000 for ideal spike respectively. This is due to requiring the data to be uniqu for each iteration, so each vu executes one iteration with unique data