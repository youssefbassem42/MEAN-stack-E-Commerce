Goal:
Create catalog foundation.

Features:
- Products
- Categories

Tasks:

Collections:
- Products
- Categories

Admin Endpoints:

POST /categories
GET /categories
PUT /categories/:id
DELETE /categories/:id

POST /products
GET /products
GET /products/:id
PUT /products/:id
DELETE /products/:id

Product Fields:

- title
- slug
- price
- stock
- description
- images
- category
- tags

Validation:
- unique slug
- positive price

Testing:

Create Product
✓ works

Update Product
✓ works

Delete Product
✓ works

Category Filter
✓ works

Documentation:

ProductsAPI.md
CategoriesAPI.md

Definition of Done:
Catalog management completed.