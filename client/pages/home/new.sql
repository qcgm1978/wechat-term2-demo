SELECT * FROM store.product;
UPDATE product SET image = REPLACE(image, 'products/', '/pages/home/products/')
