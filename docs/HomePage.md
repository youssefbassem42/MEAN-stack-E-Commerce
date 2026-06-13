# Homepage Documentation

The homepage experience is built using a fully responsive, modern storefront layout with dynamic hero slide promotion and curated catalog grids.

---

## Backend APIs

The backend exposes four dedicated endpoints for query retrieval:

### 1. Featured Products
* **Endpoint:** `GET /home/featured`
* **Query Params:** `limit` (default: 8)
* **Logic:** Returns products tagged as `featured`. If none are found, falls back to the first `limit` products.

### 2. New Arrivals
* **Endpoint:** `GET /home/new-arrivals`
* **Query Params:** `limit` (default: 8)
* **Logic:** Returns products sorted by creation date (`createdAt` descending).

### 3. Best Sellers
* **Endpoint:** `GET /home/best-sellers`
* **Query Params:** `limit` (default: 8)
* **Logic:** Returns products tagged as `best-seller`. If none are found, falls back to products sorted by `stock` in descending order.

### 4. Trending Products
* **Endpoint:** `GET /home/trending`
* **Query Params:** `limit` (default: 8)
* **Logic:** Returns products tagged as `trending`. If none are found, falls back to the first `limit` products.

---

## Frontend Components

### 1. Hero Slider
* Handles sliding auto-play transitions using a 6-second timer loop.
* Supports active state tracking and manual controls via left/right arrows or circular indicators.
* Displays dynamic badges, custom subtitles, big action-oriented headings, and structured action buttons.

### 2. Curated Product Sections
Divided into 4 distinct grids corresponding to the backend endpoints:
1. **Featured Products:** Highlighting key items.
2. **New Arrivals:** Displaying the latest catalog updates.
3. **Trending Products:** Capturing popular items.
4. **Best Sellers:** Showcasing high-demand stock.

---

## Core Features & UX Design

* **Responsive Design:** Fluid layouts, flex wrap configurations, and media-query break-points designed to automatically adjust for mobile, tablet, and desktop screens.
* **Lazy Loading:** Frontend image elements use the native `loading="lazy"` attribute to optimize network traffic and page load times.
* **Empty State Handling:** If any query returns no items, a custom `emptyState` template renders a clean illustration and a call-to-action placeholder so the UI remains pristine.
* **Error & Loading Indicators:** Circular progress spinners indicate query progress. If a request fails, a colored error card captures the stack info without breaking the user session.
