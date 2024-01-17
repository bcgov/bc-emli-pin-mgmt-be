################################# SHELL VARIABLES ##################################
# Edit these variables with the correct information for your desired test environment
DB_NAME='your-db-name'
DB_USERNAME='username'
DB_PORT=11111
DB_PASSWORD='password'

# Remove the data
cd data
psql "postgresql://$DB_USERNAME:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME" -a -f clean.sql