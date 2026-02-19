# How to Use the Admin Profile (MK Store)

This guide explains how to get an admin account and use the admin panel.

---

## 1. Getting an Admin Account

Normal **registration** (`/register`) creates users with role **`user`**. Admins must have role **`admin`** in the database.

### Option A: Create an admin with the script (recommended)

1. **Create a normal account** (if you don’t have one):
   - Go to [Register](/register) and sign up with your email and password.

2. **Run the “make admin” script** (from project root):

   ```bash
   npx tsx scripts/makeAdmin.ts your_email@example.com
   ```

   Replace `your_email@example.com` with the **exact email** you used to register.  
   The script sets that user’s `role` to `admin`.

3. **Log in** with that account. You will then have admin access.

### Option B: Set admin in MongoDB manually

1. Register a user as usual.
2. Open MongoDB (Compass or `mongosh`) and find the `users` collection.
3. Find the user by `email` and set:
   ```json
   { "role": "admin" }
   ```
4. Log in with that account.

---

## 2. Logging In as Admin

1. Go to **[/login](/login)**.
2. Enter the **email** and **password** of the admin user.
3. After login you’ll be redirected (or go to the home page).

---

## 3. Opening the Admin Panel

- **From the header**: Click your **account/avatar** (top right) → **Admin Panel** (this link only appears when you’re logged in as admin).
- **Direct URL**: Go to **[/admin](/admin)**.

If you’re not logged in, you’ll be sent to `/login`. If you’re logged in but not admin, you’ll be redirected to the home page.

---

## 4. What You Can Do in the Admin Panel

| Section        | URL              | Description |
|----------------|------------------|-------------|
| **Dashboard**  | `/admin`         | Overview: total users, products, orders, revenue, and monthly sales chart. |
| **Users**      | `/admin/users`   | List all users; see email, name, role (user/admin). |
| **Products**    | `/admin/products`| List, add, edit, and delete products. Seed sample products. |
| **Orders**     | `/admin/orders`  | List orders; open order details and mark as delivered. |

- **Back to store**: Use “← Back to store” in the sidebar to return to the main site.

---

## 5. Security Notes

- **Admin routes** (`/admin`, `/admin/*`) and **admin APIs** (`/api/admin/*`) are protected:
  - You must be **logged in** and have **`role === 'admin'`**.
- The **auth token** (cookie) includes your role; changing role in the DB only takes effect after you **log in again** (so log out and log back in after running the script or editing the DB).
- Keep admin credentials safe and do not use the same password as on other sites.

---

## Quick Checklist

1. Register at `/register` (or use an existing account).
2. Run: `npx tsx scripts/makeAdmin.ts your_email@example.com`
3. Log in at `/login` with that email and password.
4. Open **Admin Panel** from the header or go to `/admin`.
5. Use Dashboard, Users, Products, and Orders as needed.
