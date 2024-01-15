# Edit these variables with the correct information for your desired test environment
# DB_NAME='your-db-name'
# DB_USERNAME='username'
# DB_PORT=11111
# DB_PASSWORD='password'
#
# URL='be server url here'
# VERIFY_ENDPOINT='verify endpoint name here'
# API_KEY='key here'
# VERIFY_IDEAL_TARGET=20 
# VERIFY_IDEAL_VUS=100
# VERIFY_IDEAL_MAX_DURATION='60'
# VERIFY_IDEAL_SLEEP=0.5
# VERIFY_SPIKE_TARGET=100 
# VERIFY_SPIKE_VUS=20
# VERIFY_SPIKE_MAX_DURATION='30'
# VERIFY_SPIKE_SLEEP=0.5

# Load the data
cd data
psql "postgresql://$DB_USERNAME:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME" -a -f load.sql

# Run the tests, in order
# Make sure both the virus scan and backend server you want are running!

# Record overall test start time
dt=$(date '+%Y-%m-%dT%T.%zZ')

# Verify tests
cd ../tests/ideal
echo "Starting verify ideal test..."
k6 run -e URL=$URL -e VERIFY_ENDPOINT=$VERIFY_ENDPOINT -e API_KEY=$API_KEY -e VERIFY_IDEAL_TARGET=$VERIFY_IDEAL_TARGET -e VERIFY_IDEAL_VUS=$VERIFY_IDEAL_VUS -e VERIFY_IDEAL_MAX_DURATION=$VERIFY_IDEAL_MAX_DURATION -e VERIFY_IDEAL_SLEEP=$VERIFY_IDEAL_SLEEP -e dt=$dt --out json=../results/detailed/verify-ideal-$dt.json verify.js 
echo "Done verify ideal test!"

cd ../spike
echo "Starting verify spike test..."
k6 run -e URL=$URL -e VERIFY_ENDPOINT=$VERIFY_ENDPOINT -e API_KEY=$API_KEY -e VERIFY_SPIKE_TARGET=$VERIFY_SPIKE_TARGET -e VERIFY_SPIKE_VUS=$VERIFY_SPIKE_VUS -e VERIFY_SPIKE_MAX_DURATION=$VERIFY_SPIKE_MAX_DURATION -e VERIFY_SPIKE_SLEEP=$VERIFY_SPIKE_SLEEP -e dt=$dt --out json=../results/detailed/verify-spike-$dt.json verify.js 
echo "Done verify spike test!"

# Vhers-create tests
cd ../ideal
echo "Starting vhers-create ideal test..."
k6 run -e URL=$URL -e VHERS_CREATE_ENDPOINT=$VHERS_CREATE_ENDPOINT -e API_KEY=$API_KEY -e CREATE_IDEAL_TARGET=$CREATE_IDEAL_TARGET -e CREATE_IDEAL_VUS=$CREATE_IDEAL_VUS -e CREATE_IDEAL_MAX_DURATION=$CREATE_IDEAL_MAX_DURATION -e CREATE_IDEAL_SLEEP=$CREATE_IDEAL_SLEEP -e dt=$dt --out json=../results/detailed/vhers-create-ideal-$dt.json vhers-create.js
echo "Done vhers-create ideal test!"

# # Remove the test data
# cd ../../data
# psql "postgresql://$DB_USERNAME:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME" -a -f clean.sql