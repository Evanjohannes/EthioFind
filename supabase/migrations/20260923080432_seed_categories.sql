-- Top-level categories
insert into categories (id, name, icon, sort_order) values
  (gen_random_uuid(), 'Food & Drink', '🍽️', 1),
  (gen_random_uuid(), 'Shopping', '🛍️', 2),
  (gen_random_uuid(), 'Services', '🔧', 3),
  (gen_random_uuid(), 'Beauty Salon', '💇', 4),
  (gen_random_uuid(), 'Hotels', '🏨', 5),
  (gen_random_uuid(), 'Parks', '🌳', 6),
  (gen_random_uuid(), 'Gas Station', '⛽', 7),
  (gen_random_uuid(), 'Banks', '🏦', 8),
  (gen_random_uuid(), 'Hospitals', '🏥', 9),
  (gen_random_uuid(), 'Pharmacy', '💊', 10);

-- Subcategories under "Food & Drink"
insert into categories (name, parent_category_id, icon, sort_order)
select 'Cafe', id, '☕', 1 from categories where name = 'Food & Drink'
union all
select 'Restaurant', id, '🍲', 2 from categories where name = 'Food & Drink'
union all
select 'Fast Food', id, '🍔', 3 from categories where name = 'Food & Drink'
union all
select 'Coffee House', id, '☕', 4 from categories where name = 'Food & Drink'
union all
select 'Bakery', id, '🥐', 5 from categories where name = 'Food & Drink';