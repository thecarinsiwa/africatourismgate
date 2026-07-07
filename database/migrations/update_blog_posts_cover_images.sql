-- Cover images for demo blog posts
UPDATE `blog_posts`
SET `cover_image_url` = 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Serengeti_sunset-1001.jpg'
WHERE `slug` = 'decouvrir-kenya-masai-mara' AND (`cover_image_url` IS NULL OR `cover_image_url` = '');

UPDATE `blog_posts`
SET `cover_image_url` = 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Zanzibar_beach.jpg'
WHERE `slug` = 'zanzibar-plages-stone-town' AND (`cover_image_url` IS NULL OR `cover_image_url` = '');

UPDATE `blog_posts`
SET `cover_image_url` = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg'
WHERE `slug` = 'voyager-rdc-kinshasa' AND (`cover_image_url` IS NULL OR `cover_image_url` = '');
