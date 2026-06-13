Goal:
Implement shopping cart.

Features:

- Add Item
- Remove Item
- Quantity
- VAT
- COD

Tasks:

Collection:
Cart

Endpoints:

GET /cart

POST /cart/items

PUT /cart/items/:id

DELETE /cart/items/:id

Business Rules:

VAT = 15%

COD Shipping = 50 EGP

Calculations:
subtotal
vat
shipping
grandTotal

Testing:

Add Product
✓ added

Increase Quantity
✓ updated

Remove Product
✓ removed

VAT Calculated
✓ correct

COD Added
✓ correct

Documentation:

CartAPI.md

Definition of Done:
Cart working correctly.
