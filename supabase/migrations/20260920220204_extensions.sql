-- Enable PostGIS for location/geography columns (needed for "nearby" search)
create extension if not exists postgis;

-- Enable UUID generation for primary keys
create extension if not exists "uuid-ossp";