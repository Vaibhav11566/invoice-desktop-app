# 📘 Invoice Pro — User Manual
### Complete Guide: App Kaise Use Karein

> **Version:** 1.0.0  
> **App:** Invoice Pro Desktop Application  
> **Platform:** Windows / macOS  

---

## 📑 Table of Contents

1. [App Overview](#1-app-overview)
2. [App Start Kaise Karein](#2-app-start-kaise-karein)
3. [Account Banana — Register](#3-account-banana--register)
4. [Login Karna](#4-login-karna)
5. [Dashboard — Invoice List](#5-dashboard--invoice-list)
6. [Naya Invoice Banana — Create Invoice](#6-naya-invoice-banana--create-invoice)
7. [Invoice Details Dekhna](#7-invoice-details-dekhna)
8. [Invoice Edit Karna](#8-invoice-edit-karna)
9. [Invoice Delete Karna](#9-invoice-delete-karna-admin-only)
10. [Search aur Filter](#10-search-aur-filter)
11. [Role-Based Permissions](#11-role-based-permissions)
12. [Payment Screenshot Upload](#12-payment-screenshot-upload)
13. [Logout Karna](#13-logout-karna)
14. [Samajhne Wali Cheezein — Glossary](#14-samajhne-wali-cheezein--glossary)
15. [Common Errors aur Solutions](#15-common-errors-aur-solutions)

---

## 1. App Overview

**Invoice Pro** ek desktop application hai jo aapko apne clients ke liye invoices (bills) banana, manage karna, aur track karna allow karta hai.

### App Kya Kya Kar Sakta Hai?

```
✅ Invoices banana aur manage karna
✅ Client ka naam, email, phone, address save karna
✅ Multiple products/services ek invoice mein add karna
✅ Automatic tax calculation (GST/any %)
✅ Payment screenshot upload karna (UPI/Bank proof)
✅ Order aur payment status track karna
✅ Search aur filter karna invoices mein
✅ Admin aur Regular User — do alag roles
```

### App Ki Screen Flow

```
  Launch App
      │
      ▼
  Login / Register
      │
      ▼
  Invoice List (Home)
      │
    ┌─┴──────────────────┐
    ▼                    ▼
Create Invoice     View / Edit Invoice
```

---

## 2. App Start Kaise Karein

### Step-by-Step:

**Step 1** — Terminal open karein aur project folder mein jayein:
```bash
cd "invoice-desktop-app"
```

**Step 2** — App start karein:
```bash
npm run dev
```

**Step 3** — Thoda wait karein (15-20 seconds):
```
[0] ✅ MongoDB connected
[0] ✅ Server running on http://localhost:5001
[1] ✅ Vite dev server running on http://localhost:5173
→  Electron window automatically khul jayegi
```

> ⚠️ **Zaruri:** MongoDB chalu hona chahiye pehle se.  
> macOS par: `mongod` command chalayein alag terminal mein.

### Pehli Baar Checklist:
- [ ] Node.js installed hai
- [ ] MongoDB running hai
- [ ] `npm install` root, backend, frontend teeno mein hua hai
- [ ] `.env` file backend folder mein hai

---

## 3. Account Banana — Register

Pehli baar app use karne ke liye account banana hoga.

### Steps:

**Step 1** — App open hone par Login page dikhega.  
"Create one" link par click karein (neeche likha hoga).

**Step 2** — Register form fill karein:

```
┌─────────────────────────────────────────────────────┐
│                   Create Account                    │
│                                                     │
│  Full Name *         → apna poora naam likhein      │
│  ┌───────────────────────────────────────────────┐  │
│  │  Ishwar Sharma                                │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Email Address *     → valid email likhein          │
│  ┌───────────────────────────────────────────────┐  │
│  │  ishwar@company.com                           │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Phone (Optional)    → phone number                 │
│  ┌───────────────────────────────────────────────┐  │
│  │  9876543210                                   │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Password *    Confirm Password *                   │
│  ┌──────────┐  ┌──────────────────────────────┐     │
│  │ ●●●●●●  │  │ ●●●●●●                       │     │
│  └──────────┘  └──────────────────────────────┘     │
│                                                     │
│         [ Create Account Button ]                   │
└─────────────────────────────────────────────────────┘
```

**Step 3** — "Create Account" button dabayein.

**Step 4** — Success hone par automatically Invoice List page par pahunch jayenge.

### Register Ke Rules:
| Field | Rule |
|-------|------|
| Name | Zaruri hai, koi bhi naam |
| Email | Zaruri, unique hona chahiye |
| Password | Minimum **6 characters** |
| Confirm Password | Password se match karna chahiye |
| Phone | Optional hai |

> 📌 **Note:** Naya account hamesha **"user" role** ke saath banta hai.  
> **Admin** banne ke liye database mein manually role change karna hota hai  
> (yeh kaam system administrator karta hai).

---

## 4. Login Karna

### Steps:

**Step 1** — App open karein. Login page dikhega.

**Step 2** — Apna email aur password dalein:

```
┌─────────────────────────────────────────────────────┐
│                  Welcome Back 👋                    │
│         Sign in to manage your invoices             │
│                                                     │
│  Email Address                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │ ✉  ishwar@company.com                         │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Password                                           │
│  ┌───────────────────────────────────────────────┐  │
│  │ 🔒  ●●●●●●●●                                  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│              [ Sign In Button ]                     │
│                                                     │
│       Don't have an account?  Create one            │
└─────────────────────────────────────────────────────┘
```

**Step 3** — "Sign In" button dabayein.

**Step 4** — Login successful hone par Invoice List page dikhega.

### Login Error Aaye Toh?

| Error Message | Matlab | Solution |
|---------------|--------|----------|
| "Invalid email or password" | Email ya password galat hai | Dobara check karein |
| "Email and password are required" | Koi field khali chhori | Dono fields bharo |
| "Account is deactivated" | Admin ne account band kiya | Admin se contact karein |

---

## 5. Dashboard — Invoice List

Login ke baad yeh **main screen** dikhti hai:

```
┌──────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (Left)              │  MAIN CONTENT (Right)                 │
│                              │                                        │
│  📄 Invoice Pro              │  Invoices                    [+ New]  │
│                              │  25 invoices total                    │
│  📋 All Invoices  ← active   │                                        │
│  ➕ Create Invoice            │  ┌──────────────────────────────────┐  │
│                              │  │ 🔍 Search...    [Status ▼] [🔄]  │  │
│  ─────────────────           │  └──────────────────────────────────┘  │
│                              │                                        │
│  👤 Ishwar Admin             │  ┌──────────────────────────────────┐  │
│     admin                    │  │ Inv# │ Client │ Amt │ Status │..│  │
│  [Logout →]                  │  │ INV- │ Priya  │ ₹29k│ Pending│  │  │
│                              │  │ INV- │ Tech.. │ ₹66k│ Process│  │  │
│                              │  └──────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### Invoice Table Columns Samajhein:

| Column | Kya Dikhta Hai |
|--------|----------------|
| **Invoice #** | Auto-generated unique number (INV-YYYYMMDD-XXXXXXXX) |
| **Client** | Client ka naam + email (neeche chota) |
| **Amount (₹)** | Total invoice amount Indian Rupees mein |
| **Order Status** | Pending / Processing / Shipped / Delivered / Cancelled |
| **Payment** | Payment status: Pending / Verified / Failed |
| **Type** | NewJoining ya RePurchase |
| **Date** | Invoice banane ki date |
| **Actions** | 👁 View, ✏️ Edit, 🗑 Delete (admin only) |

### Status Badges Ka Matlab:

**Order Status:**
```
🟡 Pending      → Order abhi process nahi hua
🔵 Processing   → Order process ho raha hai
🟣 Shipped      → Order bheej diya gaya
🟢 Delivered    → Order deliver ho gaya
🔴 Cancelled    → Order cancel ho gaya
```

**Payment Status:**
```
🟡 Pending   → Payment ka confirmation nahi hua
🟢 Verified  → Payment verify ho gayi
🔴 Failed    → Payment fail ho gayi
```

---

## 6. Naya Invoice Banana — Create Invoice

### Kaise Pahunchein:
- Sidebar mein **"Create Invoice"** click karein, **ya**
- Invoice List page par **"+ New Invoice"** button click karein

### Form 4 Sections Mein Banta Hai:

---

### Section 1 — Client Information 👤

```
┌──────────────────────────────────────────────────────┐
│  Client Information                                  │
│                                                      │
│  Client Name *              Client Email            │
│  ┌─────────────────────┐   ┌─────────────────────┐  │
│  │ Priya Sharma        │   │ priya@example.com   │  │
│  └─────────────────────┘   └─────────────────────┘  │
│                                                      │
│  Client Phone               Purchase Type           │
│  ┌─────────────────────┐   ┌─────────────────────┐  │
│  │ 9001234567          │   │ RePurchase      ▼   │  │
│  └─────────────────────┘   └─────────────────────┘  │
│                                                      │
│  Shipping Address (Full Width)                       │
│  ┌──────────────────────────────────────────────┐   │
│  │ 42 MG Road, Bangalore - 560001               │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

| Field | Zaruri? | Description |
|-------|---------|-------------|
| Client Name | ✅ Yes | Client ka poora naam |
| Client Email | No | Invoice ya communication ke liye |
| Client Phone | No | Contact number |
| Purchase Type | No | **NewJoining** = pehli baar, **RePurchase** = dobara aya |
| Shipping Address | No | Delivery address |

---

### Section 2 — Invoice Items 🛒

Yahan aap products/services add karte hain.

```
┌──────────────────────────────────────────────────────────┐
│  Invoice Items                                           │
│                                                          │
│  Product/Service     │  Qty  │  Unit Price  │  Total    │
│  ─────────────────── │ ───── │ ──────────── │ ────────  │
│  [Web Development  ] │ [ 1 ] │ [  25000   ] │ ₹25,000  │
│  [Full website build] │       │              │           │
│  ─────────────────── │ ───── │ ──────────── │ ────────  │
│  [API Integration  ] │ [ 2 ] │ [   8000   ] │ ₹16,000  │
│  [REST API setup   ] │       │              │           │
│  ─────────────────── │ ───── │ ──────────── │ ────────  │
│  [+ Add Item         ]                                   │
│                                                          │
│                          ┌─────────────────────────┐    │
│                          │ Subtotal      ₹41,000   │    │
│                          │ Tax [18] %    ₹ 7,380   │    │
│                          │ ─────────────────────── │    │
│                          │ TOTAL         ₹48,380   │    │
│                          └─────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

**Item Add Karna:**
1. Pehla row already khali hoga
2. **Product Name** likhein (zaruri)
3. Neeche **Description** optional hai
4. **Qty** (quantity) dalein — minimum 1
5. **Unit Price** dalein rupees mein
6. **Total automatically** calculate ho jayega (Qty × Price)
7. Aur item add karne ke liye **"+ Add Item"** click karein
8. Item hatane ke liye **🗑 (trash icon)** click karein

**Tax Calculate Karna:**
- Tax box mein **percentage** dalein (jaise 18 for GST 18%)
- Tax Amount aur Total **automatically** update ho jayega
- 0 rakho agar tax nahi lagta

> 💡 **Tip:** Sab calculations real-time mein hoti hain — type karte hi update hoga.

---

### Section 3 — Payment Information 💳

```
┌──────────────────────────────────────────────────────┐
│  Payment Information                                 │
│                                                      │
│  Payment Service            Transaction ID           │
│  ┌─────────────────────┐   ┌─────────────────────┐  │
│  │ UPI             ▼  │   │ UPI20240601001      │  │
│  └─────────────────────┘   └─────────────────────┘  │
│                                                      │
│  Payment Screenshot (optional)                       │
│  ┌──────────────────────────────────────────────┐   │
│  │ Choose File   payment_proof.jpg              │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

| Field | Options | Description |
|-------|---------|-------------|
| Payment Service | UPI, BankTransfer, Cash, Card, Other | Kaise payment aayi |
| Other (agar select kiya) | Text field | Custom payment method likho |
| Transaction ID | Text | UPI/NEFT reference number |
| Screenshot | File upload | Payment proof image ya PDF |

---

### Section 4 — Additional Information ℹ️

```
┌──────────────────────────────────────────────────────┐
│  Additional Information                              │
│                                                      │
│  Remarks                                             │
│  ┌──────────────────────────────────────────────┐   │
│  │ Rush delivery requested. Deliver by 5th June │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

**Remarks** mein koi bhi extra notes likh sakte hain — client instructions, delivery notes, special requests, etc.

---

### Invoice Submit Karna:

```
              [  Cancel  ]    [  Create Invoice  ]
```

- **Cancel** — form band karo, kuch save nahi hoga
- **Create Invoice** — invoice save ho jayega

**Success hone par:**
- ✅ "Invoice created successfully! 🎉" toast message aayega
- Automatically **Invoice Detail page** par redirect ho jayega
- **Auto-generated invoice number** assign ho jayega (jaise `INV-20260527-5A224FB9`)

---

## 7. Invoice Details Dekhna

Kisi bhi invoice ka **View button (👁)** click karein ya table row click karein.

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back    INV-20260527-5A224FB9                                 │
│            🟡 Pending   🟡 Pending (payment)       [Edit] [Del] │
│                                                                  │
│  LEFT COLUMN (2/3 width)    │  RIGHT COLUMN (1/3 width)         │
│  ─────────────────────────  │  ─────────────────────────────    │
│  CLIENT INFORMATION         │  INVOICE DETAILS                  │
│  Name:    Priya Sharma      │  Invoice #: INV-20260527-5A224FB9  │
│  Email:   priya@example.com │  Created:   27 May 2026, 10:49 AM │
│  Phone:   9001234567        │  Updated:   27 May 2026, 10:49 AM │
│  Type:    NewJoining        │  By:        Ishwar Admin           │
│                             │                                    │
│  INVOICE ITEMS              │  PAYMENT INFO                     │
│  Web Development    ₹25,000 │  Status:    🟡 Pending            │
│  Full website build         │  Service:   UPI                   │
│  ─────────────────────────  │  Txn ID:    UPI20240601001        │
│  Subtotal          ₹25,000  │  Screenshot: 📥 View Screenshot   │
│  Tax (18%)         ₹ 4,500  │                                    │
│  ─────────────────────────  │                                    │
│  TOTAL             ₹29,500  │                                    │
│                             │                                    │
│  REMARKS                    │                                    │
│  Rush delivery requested    │                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. Invoice Edit Karna

### Kaise Edit Karein:
- Invoice List mein **✏️ (edit icon)** click karein, **ya**
- Invoice Detail page par **"Edit" button** click karein

### Edit Form — Create Form Jaisa Hi Hai, Par:

**Extra Section Hai — Status Update:**
```
┌──────────────────────────────────────────────────────┐
│  Status                                              │
│                                                      │
│  Order Status               Payment Status           │
│  ┌─────────────────────┐   ┌─────────────────────┐  │
│  │ Processing      ▼  │   │ Verified        ▼  │  │
│  └─────────────────────┘   └─────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Order Status Change Karo:**
```
Pending → Processing → Shipped → Delivered
                    ↘ Cancelled (kabhi bhi)
```

**Payment Status Change Karo:**
```
Pending → Verified  (payment confirm hone par)
Pending → Failed    (payment fail hone par)
```

### Edit Ke Rules:

| User Type | Kya Edit Kar Sakta Hai |
|-----------|------------------------|
| **Admin** | Kisi bhi invoice ka kuch bhi edit kar sakta hai |
| **Regular User** | Sirf **apna** invoice, aur sirf jab status **"Pending"** ho |

> ⚠️ **Regular User Alert:**  
> Agar invoice ka status Pending se aage (Processing, Shipped, etc.) ho gaya,  
> toh regular user wo invoice **edit nahi kar sakta** — sirf admin kar sakta hai.

### Save Karna:
- **"Save Changes"** button click karein
- ✅ "Invoice updated successfully!" message aayega
- Invoice Detail page par wapas jayega

---

## 9. Invoice Delete Karna (Admin Only)

> 🔒 **Yeh feature sirf Admin ke liye hai.**

### Steps:

**Step 1** — Invoice List mein **🗑 (red trash icon)** click karein.

**Step 2** — Confirmation box aayega:
```
┌─────────────────────────────────────────┐
│  Are you sure you want to delete this   │
│  invoice?                               │
│                                         │
│     [ Cancel ]      [ OK ]              │
└─────────────────────────────────────────┘
```

**Step 3** — "OK" click karein.

**Step 4** — ✅ "Invoice deleted." toast aayega.

> 📌 **Important:** Invoice delete karne par **permanently delete nahi hota**.  
> Sirf "soft delete" hota hai — database mein rehta hai par list mein nahi dikhta.  
> Yeh business records ke liye safe hai.

---

## 10. Search aur Filter

Invoice List page par ye tools hain:

```
┌────────────────────────────────────────────────────────┐
│  🔍 [Search by invoice #, client name or email...  ]  │
│  [All Statuses ▼]   [🔄 Refresh]                       │
└────────────────────────────────────────────────────────┘
```

### Search Kaise Karein:

Search box mein type karein. **Ye cheezein search hoti hain:**
- Invoice number (jaise `INV-20260527`)
- Client ka naam (jaise `Priya`)
- Client ka email (jaise `priya@example`)

**Example:**
```
Search: "Tech"    → TechCorp Pvt Ltd wale invoice dikhenge
Search: "INV-20260527" → Us din ke sab invoices
Search: "@gmail"  → Gmail wale clients ke invoices
```

### Status Filter:

Dropdown se ek status select karein:
```
All Statuses  → sab invoices
Pending       → sirf pending
Processing    → sirf processing
Shipped       → sirf shipped
Delivered     → sirf delivered
Cancelled     → sirf cancelled
```

### Pagination (Bahut Saare Invoices Hone Par):

```
         [ ← Prev ]   Page 2 of 5   [ Next → ]
```

- Har page par **10 invoices** dikhte hain
- **Prev/Next** buttons se pages badlein

---

## 11. Role-Based Permissions

App mein **2 types ke users** hote hain:

### 👑 Admin User

```
✅ Apne aur sabke invoices dekh sakta hai
✅ Koi bhi invoice edit kar sakta hai
✅ Kisi bhi status ka invoice edit kar sakta hai
✅ Invoices delete kar sakta hai (soft delete)
✅ Payment status change kar sakta hai (Pending → Verified/Failed)
✅ Order status change kar sakta hai (Processing, Shipped, etc.)
```

### 👤 Regular User

```
✅ Sirf apne khud ke invoices dekh sakta hai
✅ Apna invoice create kar sakta hai
✅ Sirf apna "Pending" status wala invoice edit kar sakta hai
❌ Dusre logon ke invoices nahi dekh sakta
❌ Koi invoice delete nahi kar sakta
❌ Pending se aage gaye invoice edit nahi kar sakta
```

### Permission Table:

| Action | Admin | Regular User |
|--------|-------|--------------|
| Apne invoices dekhna | ✅ | ✅ |
| Sabke invoices dekhna | ✅ | ❌ |
| Invoice banana | ✅ | ✅ |
| Apna Pending invoice edit | ✅ | ✅ |
| Apna non-Pending invoice edit | ✅ | ❌ |
| Kisi ka bhi invoice edit | ✅ | ❌ |
| Invoice delete karna | ✅ | ❌ |

---

## 12. Payment Screenshot Upload

Client ne payment ki proof (screenshot) share ki hai toh aap usse invoice ke saath attach kar sakte hain.

### Upload Kaise Karein:

**Create Invoice ya Edit Invoice** mein — Payment Information section mein:

```
Payment Screenshot
┌──────────────────────────────────────────┐
│  [ Choose File ]   payment_upi.jpg       │
└──────────────────────────────────────────┘
```

1. **"Choose File"** button click karein
2. Apne computer se file select karein
3. Invoice save karein

### Allowed File Types:
```
✅ JPG / JPEG  (photos)
✅ PNG         (screenshots)
✅ GIF
✅ WebP
✅ PDF         (bank statement)

❌ DOC, XLS, etc. — allowed nahi
```

**Maximum Size:** 5MB

### Screenshot Dekhna:

Invoice Detail page par — Payment Info section mein:
```
Screenshot:  📥 View Screenshot  ← click karein
```
Click karne par file browser/new tab mein khulegi.

---

## 13. Logout Karna

Sidebar ke **sabse neeche** logout button hai:

```
┌──────────────────────────┐
│  👤 Ishwar Admin         │
│     admin                │
│                    [→|]  │  ← Yeh hai logout button
└──────────────────────────┘
```

**Logout icon** (arrow + door) click karein:
- ✅ "Logged out successfully." message aayega
- Login page par redirect ho jayega
- Token automatically delete ho jayega

> 🔒 **Security:** Token 7 din mein automatically expire hota hai.  
> Expire hone par automatically login page par bhej dega.

---

## 14. Samajhne Wali Cheezein — Glossary

| Term | Matlab |
|------|--------|
| **Invoice** | Client ko diya jaane wala bill jisme services/products ki list hoti hai |
| **Invoice Number** | Auto-generated unique ID — jaise `INV-20260527-5A224FB9` |
| **Subtotal** | Tax se pehle ka total amount |
| **Tax %** | GST ya koi bhi tax percentage |
| **Tax Amount** | Subtotal × Tax% / 100 |
| **Total Amount** | Subtotal + Tax Amount |
| **Order Status** | Invoice/order abhi kis stage mein hai |
| **Payment Status** | Payment receive hua ya nahi |
| **NewJoining** | Client pehli baar purchase kar raha hai |
| **RePurchase** | Client dobara purchase kar raha hai |
| **Soft Delete** | Record list se hatao par database se nahi |
| **JWT Token** | Login ke baad milne wala secure access key (7 din valid) |
| **Admin** | Full access wala user |
| **Pagination** | Ek baar mein 10 records dikhana, next button se aage |

---

## 15. Common Errors aur Solutions

### ❌ "Invalid email or password"
**Cause:** Email ya password galat hai  
**Fix:** Dobara dhyan se likhein. Caps Lock off karein.

---

### ❌ "Email already registered"
**Cause:** Is email se pehle se account hai  
**Fix:** Login karein ya doosra email use karein

---

### ❌ "Passwords do not match"
**Cause:** Password aur Confirm Password alag hain  
**Fix:** Dono fields mein exactly same password likhein

---

### ❌ "At least one invoice item is required"
**Cause:** Invoice mein koi item add nahi kiya  
**Fix:** Items section mein kam se kam ek product/service add karein

---

### ❌ "You can only edit invoices with Pending status"
**Cause:** Regular user kisi non-Pending invoice ko edit karne ki koshish kar raha hai  
**Fix:** Admin se edit karwayein ya admin login se edit karein

---

### ❌ "Access denied. You can only view your own invoices"
**Cause:** Regular user kisi aur ka invoice dekhne/edit karne ki koshish kar raha hai  
**Fix:** Admin account se login karein

---

### ❌ App window nahi khul rahi
**Cause:** Backend ya frontend start nahi hua  
**Fix:**
1. Terminal mein check karein koi error toh nahi
2. MongoDB chalu hai kya? (`mongod` command chalayein)
3. Ports free hain kya? (`lsof -i :5001` aur `lsof -i :5173`)

---

### ❌ "Failed to fetch invoices"
**Cause:** Backend server band ho gaya  
**Fix:** `npm run dev` dobara chalayein

---

### ❌ File upload nahi ho rahi
**Cause:** File size 5MB se zyada hai ya wrong file type  
**Fix:** File compress karein ya PDF/JPG/PNG use karein

---

## 📞 Quick Help Card

```
┌────────────────────────────────────────────────────────┐
│           INVOICE PRO — QUICK REFERENCE               │
├────────────────────────────────────────────────────────┤
│  App Start   →  npm run dev                           │
│  Backend     →  http://localhost:5001                 │
│  Frontend    →  http://localhost:5173                 │
├────────────────────────────────────────────────────────┤
│  Invoice Number Format:  INV-YYYYMMDD-XXXXXXXX        │
│  Tax:  Subtotal × Tax% / 100                          │
│  Token Expiry:  7 din                                  │
├────────────────────────────────────────────────────────┤
│  ORDER STATUS FLOW:                                    │
│  Pending → Processing → Shipped → Delivered           │
│                      ↘ Cancelled                      │
├────────────────────────────────────────────────────────┤
│  PAYMENT STATUS:                                       │
│  Pending → Verified  (payment confirm hone par)       │
│  Pending → Failed    (payment fail hone par)          │
├────────────────────────────────────────────────────────┤
│  Admin  = sab kuch kar sakta hai                      │
│  User   = sirf apne Pending invoices manage kar sakta │
└────────────────────────────────────────────────────────┘
```

---

*Invoice Pro v1.0.0 — User Manual*  
*Agar koi aur help chahiye toh developer se contact karein.*
