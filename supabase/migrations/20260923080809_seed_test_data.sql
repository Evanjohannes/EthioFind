-- A couple of admin-configured payment methods
insert into payment_methods (method_type, account_name, account_number) values
  ('Bank (CBE)', 'EthioFind PLC', '1000123456789'),
  ('Telebirr', 'EthioFind PLC', '0912345678');

-- Note: test businesses need a real owner_id (a profiles row), so we create
-- one manually after you have at least one signed-up test user.
-- Run this part later, replacing YOUR_TEST_USER_ID with a real profiles.id:

-- insert into businesses (owner_id, name, description, category_id, city, subcity, location, status)
-- select
--   'YOUR_TEST_USER_ID',
--   'Habesha Café',
--   'Traditional coffee and food',
--   id,
--   'Addis Ababa',
--   'Bole',
--   ST_MakePoint(38.7935, 9.0107)::geography,
--   'active'
-- from categories where name = 'Cafe';