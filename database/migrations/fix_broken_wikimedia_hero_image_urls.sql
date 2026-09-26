-- Replace deleted / unstable Wikimedia Commons hero & placeholder URLs (404 in CI).

UPDATE `hero_slides`
SET `image_url` = 'https://upload.wikimedia.org/wikipedia/commons/1/13/Table_Mountain_DanieVDM.jpg',
    `image_alt` = CASE
      WHEN `locale` = 'fr' THEN 'Montagne de la Table, Cap'
      WHEN `locale` = 'es' THEN 'Montaña de la Mesa, Ciudad del Cabo'
      ELSE 'Table Mountain, Cape Town'
    END
WHERE `image_url` LIKE '%Koutoubia_Mosque%';

UPDATE `hero_slides`
SET `image_url` = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg/1280px-A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg',
    `image_alt` = CASE
      WHEN `locale` = 'fr' THEN 'Girafe devant la skyline de Nairobi'
      WHEN `locale` = 'es' THEN 'Jirafa frente al skyline de Nairobi'
      ELSE 'Giraffe with Nairobi city skyline'
    END
WHERE `image_url` LIKE '%Zanzibar_beach%';

UPDATE `hero_slides`
SET `image_url` = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg/1280px-A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg'
WHERE `image_url` LIKE '%Elephants_at_Amboseli%';
