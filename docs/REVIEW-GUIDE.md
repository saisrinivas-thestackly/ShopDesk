# Review call guide

The rules say you must be able to explain every line. Read this guide, then open each file it mentions and follow the code.

## 1. The big picture (say this first)

ShopDesk has two separate apps:

- **client/**: a React app the browser runs. It only shows things and sends requests.
- **server/**: an Express API. It checks the login, validates data and saves it in MongoDB Atlas using Mongoose.

They talk over HTTP with JSON. After login the server gives the browser a **JWT** (a signed token). The browser sends it with every request in the `Authorization: Bearer <token>` header. The server checks the signature before answering.

## 2. Follow one request from click to database

**"User clicks Delete on a product"**

1. `ProductsPage.jsx`: the trash button calls `setDeleting(product)`. That opens `ConfirmDialog`.
2. The user clicks **Delete**, so `handleDelete()` calls `deleteProduct(id)` from `api/index.js`.
3. `api/client.js`: an axios interceptor adds the token header. The request goes to `DELETE /api/products/:id`.
4. `server/app.js`: `requireAuth` (in `middleware/auth.js`) verifies the JWT and puts the user on `req.user`.
5. `routes/products.js`: `findProductOr404(id)` checks the id is a valid MongoDB id and runs `Product.findById(id)`. If nothing is found, it throws `HttpError(404)`.
6. The route calls `product.deleteOne()`, which removes the document from the `products` collection in MongoDB.
7. `middleware/errorHandler.js`: if anything throws, it turns the error into a JSON reply with the right status code.
8. Back in the browser: on success, `toast.success(...)` and `reload()`. On error, `toast.error(...)`.

If you can tell this story, you can tell it for every feature. They all follow the same path.

## 3. Questions you will probably get

**What does Mongoose do?**
It gives each collection a **schema** (the fields, their types and rules) and a **model** with methods like `find`, `findById`, `create`, `countDocuments` and `deleteOne`. The schema rules (for example `price` min 0.01, `stock` must be an integer, `category` must be one of 4 values) are checked again before every save.

**How does pagination work?** (`utils/paginate.js`)
`countDocuments(filter)` gives the total. `find(filter).sort({ createdAt: -1 }).skip((page - 1) * 10).limit(10)` gives one page, newest first.

**How does search work?**
A case-insensitive `$regex` on `name`. The search text is escaped first, so characters like `(` or `*` are treated as plain text.

**Why does each order item copy the product's name and price?**
So an old order still shows what was actually sold, even if the product is renamed or deleted later.

**Why is `id` a string and not `_id`?**
`config/db.js` sets a `toJSON` rule: it sends `id` and removes `_id` and `__v`. The User model also removes `passwordHash`.

**Where is the password stored?**
Only as a bcrypt hash (`passwordHash`). Login uses `bcrypt.compare`. The User model's `toJSON` removes the hash before a user is sent to the browser.

**Why does login say "Invalid email or password" for both mistakes?**
So nobody can use the login form to find out which emails have accounts.

**How do protected routes work?**
- *Frontend:* `ProtectedRoute.jsx` checks `user` from `AuthContext`. With no user, it sends you to `/login` and remembers where you wanted to go.
- *Backend:* `app.use('/api', requireAuth)` sits after the login route, so every route below it needs a valid token.
- If the token expires, the server answers 401. The interceptor in `api/client.js` then calls `logout()`.

**Why validate in the browser and on the server?**
Browser checks give instant feedback. Server checks are the real protection, because anyone can call the API directly, for example with Postman.

**How do loading / empty / error states work?**
`hooks/useApi.js` returns `{ data, loading, error, reload }`. `components/ui/DataState.jsx` picks what to show: skeleton, error with a **Try again** button (which calls `reload`), empty message, or the content.

**What is the `ignore` flag in `useApi`?**
If you change page quickly, an old slow request could finish after a newer one and overwrite it. When a newer request starts, the cleanup sets `ignore = true` on the old one, so its result is thrown away.

**How does the search box avoid calling the API on every key?**
`ProductsPage.jsx` waits 300ms after the last key press (a debounce) before it updates the URL. A new key press clears the old timer.

**Why keep search / category / page in the URL?**
So refresh, the back button and sharing a link all keep the same view. It also lets the top-bar search open `/products?search=...`.

**How does dark mode work?**
`theme/theme.css` defines colours as variables, such as `--color-card`. Tailwind turns them into classes like `bg-card`. The `.dark` block gives the same variables different values, and `ThemeContext` adds or removes `class="dark"` on `<html>`. A tiny script in `index.html` applies the saved theme before React loads, so the page doesn't flash white.

**How is the sidebar responsive?**
At 768px and wider (`md:`) it is always visible and the content has `md:ml-sidebar`. Below that it is moved off-screen with `-translate-x-full`, and the hamburger sets `mobileOpen` to slide it in over a dark backdrop.

**Why does the Modal keep `onClose` in a ref?**
The effect that adds the Escape listener and focuses the first field should run only when the modal opens. If `onClose` were a dependency, every parent re-render would re-run it and jump the cursor back to the first field.

**How are the dashboard numbers calculated?** (`routes/stats.js`)
The four database queries run at the same time with `Promise.all`.
- Revenue is the sum of non-cancelled orders.
- Low stock means stock below 10.
- The chart starts with 14 days at 0, then counts each order into its day.
- The % on the cards compares the last 7 days with the 7 days before.

**Why does `seed.js` use its own random function?**
It uses a fixed starting seed, so every run makes the same demo data. That makes testing and demos repeatable.

**How did you match the Figma?**
The colours, radius, font (Inter) and layout sizes (sidebar 212px, top bar 68px) are in `theme/theme.css`. Each status maps to a template badge style:

| ShopDesk status | Template badge |
|---|---|
| Pending | Pending (blue) |
| Shipped | In Progress (purple) |
| Delivered | Complete (green) |
| Cancelled | Rejected (grey) |

**Check the values in `theme.css` against Figma Dev Mode before the review.** They were read from screenshots.

## 4. Before you submit

- [ ] Open the template in Figma Dev Mode and correct any colour or size in `client/src/theme/theme.css` that differs.
- [ ] Optional: export the template's icons as SVG and paste their paths into `client/src/components/ui/icons.jsx`.
- [ ] Deploy (see README), then fill in the links at the top of the README.
- [ ] Record the 3–5 minute demo: login error, then login, dashboard, add / edit / delete product, change order status, profile, mobile menu, dark mode.
- [ ] Commit every day. Suggested order, so your history follows the plan:
  1. Day 1: Vite + Tailwind setup, `theme/theme.css`, folders
  2. Day 2: `components/ui/*`, `components/layout/Sidebar.jsx`, `Topbar.jsx`
  3. Day 3: everything in `server/` (models, routes, middleware, seed) and the Postman collection
  4. Day 4: `api/`, `context/AuthContext.jsx`, `ProtectedRoute.jsx`, `AppLayout.jsx`, `LoginPage.jsx`
  5. Day 5: `DashboardPage.jsx`, dashboard components, `ProductsPage.jsx`, product components
  6. Day 6: `OrdersPage.jsx`, `ProfilePage.jsx`, `useApi.js`, `DataState.jsx`
  7. Day 7: tests, README, screenshots, deploy settings
