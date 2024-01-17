################################# SHELL VARIABLES ##################################
# Edit these variables with the correct information for your desired test environment
#### The following variables MUST be configured ####
DB_NAME='your-db-name'
DB_USERNAME='username'
DB_PORT=11111
DB_PASSWORD='password'
VIRUS_SCAN_URL='virus scan url here' 
URL='be server url here'
API_KEY='key here'
VIRUS_API_KEY='virus scan api key here'
####################################################

#### The following variables MAY be configured if you wish
#### Note that these are low targets designed for running against a local instance.
#### You may need to adjust the targets accordingly
VERIFY_ENDPOINT='/pins/verify'
VERIFY_IDEAL_TARGET=20 
VERIFY_IDEAL_VUS=20
VERIFY_IDEAL_MAX_DURATION='60'
VERIFY_IDEAL_SLEEP=0.5
VERIFY_SPIKE_TARGET=100 
VERIFY_SPIKE_VUS=20
VERIFY_SPIKE_MAX_DURATION='30'
VERIFY_SPIKE_SLEEP=0.5

VHERS_CREATE_ENDPOINT='/pins/vhers-create'
CREATE_IDEAL_TARGET=100
CREATE_IDEAL_VUS=50
CREATE_IDEAL_MAX_DURATION='180'
CREATE_IDEAL_SLEEP=2
CREATE_SPIKE_TARGET=210
CREATE_SPIKE_VUS=70
CREATE_SPIKE_MAX_DURATION='180'
CREATE_SPIKE_SLEEP=2

VHERS_REGENERATE_ENDPOINT='/pins/vhers-create'
REGENERATE_IDEAL_TARGET=20
REGENERATE_IDEAL_VUS=10
REGENERATE_IDEAL_MAX_DURATION='180'
REGENERATE_IDEAL_SLEEP=2
REGENERATE_SPIKE_TARGET=100
REGENERATE_SPIKE_VUS=10
REGENERATE_SPIKE_MAX_DURATION='180'
REGENERATE_SPIKE_SLEEP=2

VIRUS_SCAN_ENDPOINT='/virus-scan'
VIRUS_SCAN_IDEAL_TARGET=50 
VIRUS_SCAN_IDEAL_VUS=10
VIRUS_SCAN_IDEAL_MAX_DURATION='60' 
VIRUS_SCAN_SPIKE_TARGET=500 
VIRUS_SCAN_SPIKE_VUS=100 
VIRUS_SCAN_SPIKE_MAX_DURATION='60' 
VIRUS_SCAN_SLEEP=0.5

EXPIRE_ENDPOINT='/pins/etl-expire'
EXPIRE_IDEAL_MAX_DURATION='360' 
EXPIRE_IDEAL_SLEEP_FRACTION=0.015
EXPIRE_SPIKE_MAX_DURATION='600' 
EXPIRE_SPIKE_SLEEP_FRACTION=0.007

########################### TESTS START HERE #########################################

# Load the data
cd data
psql "postgresql://$DB_USERNAME:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME" -a -f load.sql

# Run the tests, in order
# Make sure both the virus scan and backend server you want are running!

# Record overall test start time
dt=$(date '+%Y-%m-%dT%T.%zZ')
cd ../results/detailed
mkdir $dt
cd ../summary
mkdir $dt

# Verify tests
cd ../../tests/ideal
echo "Starting verify ideal test..."
k6 run -e URL=$URL -e VERIFY_ENDPOINT=$VERIFY_ENDPOINT -e API_KEY=$API_KEY -e VERIFY_IDEAL_TARGET=$VERIFY_IDEAL_TARGET -e VERIFY_IDEAL_VUS=$VERIFY_IDEAL_VUS -e VERIFY_IDEAL_MAX_DURATION=$VERIFY_IDEAL_MAX_DURATION -e VERIFY_IDEAL_SLEEP=$VERIFY_IDEAL_SLEEP  -e dt=$dt --out csv=../../results/detailed/$dt/verify-ideal.csv verify.js 
echo "Done verify ideal test!"

cd ../spike
echo "Starting verify spike test..."
k6 run -e URL=$URL -e VERIFY_ENDPOINT=$VERIFY_ENDPOINT -e API_KEY=$API_KEY -e VERIFY_SPIKE_TARGET=$VERIFY_SPIKE_TARGET -e VERIFY_SPIKE_VUS=$VERIFY_SPIKE_VUS -e VERIFY_SPIKE_MAX_DURATION=$VERIFY_SPIKE_MAX_DURATION -e VERIFY_SPIKE_SLEEP=$VERIFY_SPIKE_SLEEP  -e dt=$dt --out csv=../../results/detailed/$dt/verify-spike.csv verify.js 
echo "Done verify spike test!"

# Vhers-create tests
cd ../ideal
echo "Starting vhers-create ideal test..."
k6 run -e URL=$URL -e VHERS_CREATE_ENDPOINT=$VHERS_CREATE_ENDPOINT -e API_KEY=$API_KEY -e CREATE_IDEAL_TARGET=$CREATE_IDEAL_TARGET -e CREATE_IDEAL_VUS=$CREATE_IDEAL_VUS -e CREATE_IDEAL_MAX_DURATION=$CREATE_IDEAL_MAX_DURATION -e CREATE_IDEAL_SLEEP=$CREATE_IDEAL_SLEEP  -e dt=$dt --out csv=../../results/detailed/$dt/vhers-create-ideal.csv vhers-create.js || true
echo "Done vhers-create ideal test!"

cd ../spike
echo "Starting vhers-create spike test..."
k6 run -e URL=$URL -e VHERS_CREATE_ENDPOINT=$VHERS_CREATE_ENDPOINT -e API_KEY=$API_KEY -e CREATE_SPIKE_TARGET=$CREATE_SPIKE_TARGET -e CREATE_SPIKE_VUS=$CREATE_SPIKE_VUS -e CREATE_SPIKE_MAX_DURATION=$CREATE_SPIKE_MAX_DURATION -e CREATE_SPIKE_SLEEP=$CREATE_SPIKE_SLEEP  -e dt=$dt --out csv=../../results/detailed/$dt/vhers-create-spike.csv vhers-create.js || true
echo "Done vhers-create spike test!"

# Vhers-regenerate tests
cd ../ideal
echo "Starting vhers-regenerate ideal test..."
k6 run -e URL=$URL -e VHERS_REGENERATE_ENDPOINT=$VHERS_REGENERATE_ENDPOINT -e API_KEY=$API_KEY -e REGENERATE_IDEAL_TARGET=$REGENERATE_IDEAL_TARGET -e REGENERATE_IDEAL_VUS=$REGENERATE_IDEAL_VUS -e REGENERATE_IDEAL_MAX_DURATION=$REGENERATE_IDEAL_MAX_DURATION -e REGENERATE_IDEAL_SLEEP=$REGENERATE_IDEAL_SLEEP  -e dt=$dt --out csv=../../results/detailed/$dt/vhers-regenerate-ideal.csv vhers-regenerate.js
echo "Done vhers-regenerate ideal test!"

cd ../spike
echo "Starting vhers-regenerate spike test..."
k6 run -e URL=$URL -e VHERS_REGENERATE_ENDPOINT=$VHERS_REGENERATE_ENDPOINT -e API_KEY=$API_KEY -e REGENERATE_SPIKE_TARGET=$REGENERATE_SPIKE_TARGET -e REGENERATE_SPIKE_VUS=$REGENERATE_SPIKE_VUS -e REGENERATE_SPIKE_MAX_DURATION=$REGENERATE_SPIKE_MAX_DURATION -e REGENERATE_SPIKE_SLEEP=$REGENERATE_SPIKE_SLEEP  -e dt=$dt --out csv=../../results/detailed/$dt/vhers-regenerate-spike.csv vhers-regenerate.js
echo "Done vhers-regenerate spike test!"

# Virus-scan tests
cd ../ideal
echo "Starting virus scan ideal test..."
k6 run -e VIRUS_SCAN_URL=$VIRUS_SCAN_URL -e VIRUS_SCAN_ENDPOINT=$VIRUS_SCAN_ENDPOINT -e VIRUS_API_KEY=$VIRUS_API_KEY -e VIRUS_SCAN_IDEAL_TARGET=$VIRUS_SCAN_IDEAL_TARGET -e VIRUS_SCAN_IDEAL_VUS=$VIRUS_SCAN_IDEAL_VUS -e VIRUS_SCAN_IDEAL_MAX_DURATION=$VIRUS_SCAN_IDEAL_MAX_DURATION -e VIRUS_SCAN_SLEEP=$VIRUS_SCAN_SLEEP  -e dt=$dt --out csv=../../results/detailed/$dt/virus-scan-ideal.csv virus-scan.js
echo "Done virus-scan ideal test!"

cd ../spike
echo "Starting virus scan spike test..."
k6 run -e VIRUS_SCAN_URL=$VIRUS_SCAN_URL -e VIRUS_SCAN_ENDPOINT=$VIRUS_SCAN_ENDPOINT -e VIRUS_API_KEY=$VIRUS_API_KEY -e VIRUS_SCAN_SPIKE_TARGET=$VIRUS_SCAN_SPIKE_TARGET -e VIRUS_SCAN_SPIKE_VUS=$VIRUS_SCAN_SPIKE_VUS -e VIRUS_SCAN_SPIKE_MAX_DURATION=$VIRUS_SCAN_SPIKE_MAX_DURATION -e VIRUS_SCAN_SLEEP=$VIRUS_SCAN_SLEEP  -e dt=$dt --out csv=../../results/detailed/$dt/virus-scan-spike.csv virus-scan.js
echo "Done virus-scan spike test!"

# Etl-expire tests
cd ../ideal
echo "Starting etl-expire ideal test..."
k6 run -e URL=$URL -e EXPIRE_ENDPOINT=$EXPIRE_ENDPOINT -e API_KEY=$API_KEY -e EXPIRE_IDEAL_MAX_DURATION=$EXPIRE_IDEAL_MAX_DURATION -e EXPIRE_IDEAL_SLEEP_FRACTION=$EXPIRE_IDEAL_SLEEP_FRACTION  -e dt=$dt --out csv=../../results/detailed/$dt/etl-expire-ideal.csv etl-expire.js || true
echo "Done etl-expire ideal test!"

cd ../spike
echo "Starting etl-expire spike test..."
k6 run -e URL=$URL -e EXPIRE_ENDPOINT=$EXPIRE_ENDPOINT -e API_KEY=$API_KEY -e EXPIRE_SPIKE_MAX_DURATION=$EXPIRE_SPIKE_MAX_DURATION -e EXPIRE_SPIKE_SLEEP_FRACTION=$EXPIRE_SPIKE_SLEEP_FRACTION  -e dt=$dt --out csv=../../results/detailed/$dt/etl-expire-spike.csv etl-expire.js || true
echo "Done etl-expire spike test!"

# Remove the test data
echo "Done all tests! Deleting leftover db data..."
cd ../../data
psql "postgresql://$DB_USERNAME:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME" -a -f clean.sql

echo "All done! You can see the summary of each test in the results/summary/$dt folder, and the details of each particular request in the results/detailed/$dt folder"