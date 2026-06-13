Goal:
Allow authenticated users to manage profile data.

Features:

- Profile
- Change Password
- Addresses

Tasks:

Backend:

Create:
Addresses collection

Endpoints:

GET /profile
PUT /profile

PUT /profile/change-password

GET /addresses
POST /addresses
PUT /addresses/:id
DELETE /addresses/:id

Requirements:

Address:

- city
- street
- building
- apartment
- defaultAddress

Frontend:

Profile Page

Sections:

- Personal Info
- Password
- Addresses

Testing:

Authenticated:
✓ can update profile

Wrong Password:
✓ rejected

Add Address:
✓ created

Delete Address:
✓ removed

Unauthorized:
✓ blocked

Documentation:

ProfileAPI.md

Definition of Done:
User profile management fully working.
