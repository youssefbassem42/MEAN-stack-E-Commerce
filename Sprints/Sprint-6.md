Goal:
Product page experience.

Features:

- Product Details
- Reviews
- Real View Counter
- Wishlist Button

Tasks:

Collections:

Reviews
ProductViews

Endpoints:

GET /products/:id

POST /reviews

GET /reviews/:productId

Implement:

Only verified buyers can review.

Real-time viewers:

Socket.io

Track:

- join product room
- leave product room

Testing:

Purchased User:
✓ can review

Non Buyer:
✓ rejected

Viewer Count:
✓ increases

Viewer Leaves:
✓ decreases

Documentation:

Reviews.md
SocketEvents.md

Definition of Done:
Product details page completed.
