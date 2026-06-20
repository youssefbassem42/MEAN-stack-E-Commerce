# Socket.io Real-Time Events Documentation

This document describes the Socket.io real-time event protocol used to synchronize active viewer counts on product detail pages.

---

## Architecture Overview

We use Socket.io to establish a persistent bi-directional connection between the client storefront and the backend server.
Active page viewers are grouped into dynamic, redis-backed or in-memory rooms corresponding to each product's ID (`product:${productId}`).

---

## Socket Events Reference

### 1. Client to Server Events

#### `join-product`
Sent by the client when navigating to a product details page. Places the socket connection in the product's room to start receiving updates.

* **Payload:** `productId: string`
* **Action:** Socket joins room `product:${productId}`. The server recalculates room member count and broadcasts it to all sockets in that room.

---

#### `leave-product`
Sent by the client when leaving the product details page (or navigating away).

* **Payload:** `productId: string`
* **Action:** Socket leaves room `product:${productId}`. The server recalculates room member count and broadcasts it to remaining sockets.

---

### 2. Server to Client Events

#### `viewer-count-changed`
Broadcast to all sockets inside a product's room whenever a client joins or leaves, notifying them of the current active viewer count.

* **Payload:**
  ```json
  {
    "productId": "603d2e…",
    "count": 4
  }
  ```

---

## Connection & Disconnection Handling

* **Automatic Cleanup:** If a client abruptly closes their browser tab or disconnects from the internet, Socket.io triggers the native `disconnecting` event on the server.
* The server automatically parses all rooms the socket was in (filtering for `product:*` keys), decrements the active viewer counts, and broadcasts the updated count to remaining clients in those rooms.
* This ensures that active viewers count never gets out of sync or remains artificially inflated.
