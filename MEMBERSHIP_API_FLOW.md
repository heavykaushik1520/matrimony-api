# Membership & Subscription API Flow

## Overview
This document describes the complete flow for user membership and subscription management for the matrimony site.

## Flow

### 1. User Sign Up & Sign In
```
POST /api/user/auth/signup
POST /api/user/auth/signin
```

After signup, user can see their profile but **cannot view other profiles**.

---

### 2. Purchase Membership (Rs. 499 for 1 year)

#### Step 1: Create Order
```http
POST /api/membership/order/membership
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Membership order created successfully.",
  "orderId": "order_xxxxxxxxxxxxx",
  "amount": 49900,
  "currency": "INR",
  "key_id": "rzp_live_xxxxxxxxxxxxx",
  "user_id": "user-uuid"
}
```

#### Step 2: Frontend Payment via Razorpay Checkout
Use Razorpay SDK with the returned `orderId` and `key_id`.

#### Step 3: Verify Payment
```http
POST /api/membership/verify/membership
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "razorpay_order_id": "order_xxxxxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_signature": "signature_hash"
}
```

**Response:**
```json
{
  "message": "Membership activated successfully.",
  "membership": {
    "status": "active",
    "expiry_date": "2025-02-15T10:30:00.000Z",
    "plan_name": "Annual Membership"
  }
}
```

**Now user has membership but still cannot view profiles.**

---

### 3. Purchase Subscription (Rs. 99 for 2 days)

#### Step 1: Create Order
```http
POST /api/membership/order/subscription
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Subscription order created successfully.",
  "orderId": "order_xxxxxxxxxxxxx",
  "amount": 9900,
  "currency": "INR",
  "key_id": "rzp_live_xxxxxxxxxxxxx",
  "user_id": "user-uuid"
}
```

#### Step 2: Frontend Payment via Razorpay Checkout
Use Razorpay SDK with the returned `orderId` and `key_id`.

#### Step 3: Verify Payment
```http
POST /api/membership/verify/subscription
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "razorpay_order_id": "order_xxxxxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_signature": "signature_hash"
}
```

**Response:**
```json
{
  "message": "Subscription activated successfully.",
  "subscription": {
    "status": "active",
    "expires_in": "2 days",
    "payment_id": "pay_xxxxxxxxxxxxx"
  }
}
```

**Now user can view profiles!**

---

### 4. View Profiles (Protected Routes)

#### Get All Opposite Gender Users
```http
GET /api/user/auth/users-opposite-gender?page=1&limit=5
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "totalItems": 50,
  "totalPages": 10,
  "currentPage": 1,
  "users": [...]
}
```

#### Filter Users
```http
GET /api/user/auth/users-opposite-gender/filter?religion=Hindu&education=Graduation&page=1&limit=5
Authorization: Bearer <access_token>
```

#### Get User by Personal ID
```http
GET /api/user/auth/user/:personalId
Authorization: Bearer <access_token>
```

---

### 5. Check Membership Status
```http
GET /api/membership/status
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "membership_status": "active",
  "membership_expiry_date": "2025-02-15T10:30:00.000Z",
  "membership_plan_name": "Annual Membership",
  "is_membership_active": true,
  "has_active_subscription": true,
  "can_view_profiles": true
}
```

---

## Error Responses

### Membership Not Purchased
```json
{
  "message": "You need to purchase an active membership first."
}
```

### Subscription Not Purchased
```json
{
  "message": "You need to purchase an active subscription to view profiles."
}
```

### Already Has Active Membership
```json
{
  "message": "You already have an active membership."
}
```

### Invalid Signature
```json
{
  "message": "Invalid signature."
}
```

---

## Database Fields Updated

### User Model
- `membership_status`: "pending" | "active" | "expired" | "cancelled"
- `membership_expiry_date`: Date when membership expires
- `membership_plan_name`: "Annual Membership"
- `razorpay_customer_id`: Razorpay payment ID (for membership)
- `razorpay_subscription_id`: Razorpay payment ID (for subscription)

---

## Middleware

### requireActiveMembership
Checks if user has an active membership. Used for:
- Subscription purchase route

### requireActiveSubscription  
Checks if user has both active membership AND subscription. Used for:
- View profiles route
- Filter users route
- Get user by personalId route

---

## Razorpay Configuration

### Required Environment Variables
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
```

---

## Frontend Integration Example

### Razorpay Checkout (Membership)
```javascript
const options = {
  key: orderResponse.key_id,
  amount: orderResponse.amount,
  currency: orderResponse.currency,
  order_id: orderResponse.orderId,
  name: 'HridaySparshi',
  description: 'Annual Membership',
  handler: async function(response) {
    // Send payment details to backend
    const verifyResponse = await fetch('/api/membership/verify/membership', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    });
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

---

## Summary

1. **Sign Up** → User signs up
2. **Sign In** → User signs in, gets JWT token
3. **Buy Membership** (Rs. 499) → User becomes a member (1 year validity)
4. **Buy Subscription** (Rs. 99) → User gets 2 days to view profiles
5. **View Profiles** → User can now browse other profiles

The subscription is a recurring purchase that needs to be bought every 2 days if the user wants to continue viewing profiles.

