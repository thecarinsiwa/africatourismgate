-- Cover images for seed blog posts (idempotent)
UPDATE `blog_posts`
SET `cover_image_url` = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Masai_Mara_National_Reserve_2019.jpg/1280px-Masai_Mara_National_Reserve_2019.jpg'
WHERE `slug` = 'decouvrir-kenya-masai-mara'
  AND (`cover_image_url` IS NULL OR `cover_image_url` = '');

UPDATE `blog_posts`
SET `cover_image_url` = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Zanzibar_Nungwi_Beach.jpg/1280px-Zanzibar_Nungwi_Beach.jpg'
WHERE `slug` = 'zanzibar-plages-stone-town'
  AND (`cover_image_url` IS NULL OR `cover_image_url` = '');

UPDATE `blog_posts`
SET `cover_image_url` = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Kinshasa_Gombe_%28cropped%29.jpg/1280px-Kinshasa_Gombe_%28cropped%29.jpg'
WHERE `slug` = 'voyager-rdc-kinshasa'
  AND (`cover_image_url` IS NULL OR `cover_image_url` = '');
