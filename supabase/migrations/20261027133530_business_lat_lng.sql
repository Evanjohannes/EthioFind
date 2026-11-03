alter table businesses
  add column lat double precision generated always as (ST_Y(location::geometry)) stored,
  add column lng double precision generated always as (ST_X(location::geometry)) stored;