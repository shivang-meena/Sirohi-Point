# Role workflow delivery checklist

Scope: customer, business buyer, technician and admin. Vendor, distributor and RFQ workflows are excluded.

## Acceptance checks

- [ ] Role selection first; separate landing pages, sign-in and sign-out.
- [ ] Customer signup immediate; business/technician pending 48 working hours, approve/reject/reapprove, revoked access/restore.
- [ ] B2B search, category/stock/price filters and pagination.
- [ ] Separate account carts; wholesale prices/MOQ enforced in cart and API.
- [ ] Database orders, admin approval, stock safety, buyer-visible fulfilment tracking.
- [ ] Separate admin-managed B2B banners and wholesale offers.
- [ ] Technician registration service selector, database profile, home and request navigation.
- [ ] Original customer storefront, public browsing, authenticated buying/booking.
- [ ] Admin-managed real service discounts, including optional technician or delivered-product eligibility.
- [ ] Booking admin approval before technician acceptance; updates visible to customer.
- [ ] Type checks, API/database regression tests and browser checks.

## Service discount rules

An admin sets a fixed rupee discount on the technician's listed visit charge. It cannot exceed that charge. Labour/materials remain separately quoted, not invented by the app. An offer can target a service type, technician and/or product. Product-linked offers require a delivered, approved order belonging to the customer. An order can fund one booking (existing unique order relation). The backend rechecks eligibility and stores the original visit charge, discount, offer title and final visit charge on the booking. Editing/deactivating an offer does not change existing bookings.
