[![CircleCI](https://circleci.com/gh/jbevis/build-your-own-backend/tree/master.svg?style=svg)](https://circleci.com/gh/jbevis/build-your-own-backend/tree/master)

### Build Your Own Backend

#### About
This is a project for the Turing School's Front End Engineering program in Mod 4. The purpose is to build out a backend using Express, Knex, and PostgreSQL. The data for this project is from global earthquake data from the USGS.

#### API End points

#### GET:

* /api/v1/regions
  - Retrieves all regions from the database.
  - Does not require authentication
  - Body returns all regions with primary key of ID, NAME, NE_LAT, NE_LONG, SW_LAT, sw_long

* /api/v1/earthquakes
  - Retrieves all earthquakes from the database
  - Does not require authentication
  - Body returns all earthquake with primary key of ID, MAGNITUDE, DESCRIPTION, LAT, LONG, DEPTH, region_id

* /api/v1/regions/:id
  - Retrieves a specific region from the database by ID
  - Does not require authentication
  - Body returns specific region with primary key of ID, NAME, NE_LAT, NE_LONG, SW_LAT, SW_long

* /api/v1/:region_id/earthquakes
  - Retrieves all earthquakes for a given region
  - Does not require authentication
  - Body returns all earthquakes with a region_id matching the body param

* /api/v1/earthquakes/filterMag
  - Retrieves all earthquakes that fall with in the magnitude range specified in the query params
  - e.g. /api/v1/filterMag?magLow=3&magHi=5
  - Does not require authentication
  - Body returns all earthquakes within query param range.

#### POST:

* /api/v1/authenticate
   - Creates JWT for authentication on remaining write endpoints
   - Requires a .env variables
   - return JWT token and username

 * /api/v1/regions
   - Creates a new region in the regions table
   - Requires authentication with a JWT.
   - Request must be sent with body including ID, NAME, NE_LAT, NE_LONG, SW_LAT, SW_long

 * /api/v1/earthquakes
    - Creates a new earthquake in the earthquakes table
    - Requires authentication with a JWT
    - Request must be sent with a body including ID, MAGNITUDE, DESCRIPTION, LAT, LONG, DEPTH, region_id

#### PATCH:

* /api/v1/earthquakes/:id/updateMag
  - Updates the magnitude for a given earthquake by ID
  - Requires authentication with a JWT
  - Request must be sent with ID and NEWMAG. ID to match earthquake record, and NEWMAG to update MAGNITUDE

* /api/v1/earthquakes/:id/updateMag
  - Updates the depth for a given earthquake by ID
  - Requires authentication with a JWT
  - Request must be sent with ID and NEWDEPTH. ID to match earthquake record, and NEWDEPTH to update DEPTH

#### DELETE:

* /api/v1/:id/earthquakes
  - Deletes a specific earthquake record from the database
  - Requires authentication with a JWT
  - Request must be sent with an ID in order to find record to be removed

* /api/v1/:id/region
  - Deletes all earthquakes and associated region from both tables in database
  - Requires authentication with a JWT
  - Request must be sent with a ID for a region, which will match to REGION_ID of associated earthquakes.
