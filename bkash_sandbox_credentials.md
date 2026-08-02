# bKash Tokenized Checkout Sandbox Credentials

Here are the official bKash Tokenized Checkout Sandbox credentials and testing instructions for reference.

## 1. Sandbox API Credentials
These values have been successfully updated in the `system_settings` table of your database:

| Configuration Key | Value |
| :--- | :--- |
| **bkash_api_url** | `https://tokenized.sandbox.bka.sh/v1.2.0-beta` |
| **bkash_merchant_key** (App Key) | `4f6o0cjiki2rfm34kfdadl1eqq` |
| **bkash_merchant_secret** (App Secret) | `2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b` |
| **bkash_username** | `sandboxTokenizedUser02` |
| **bkash_password** | `sandboxTokenizedUser02@12345` |
| **bkash_is_live** | `false` |

---

## 2. Sandbox Testing Guide

To test the payment checkout flow on the bKash hosted sandbox page:

*   **Test Mobile Wallet Number:** `01770618575` or `01929918378`
*   **Test OTP (One-Time Password):** `123456`
*   **Test PIN:** `12121`

---

## 3. Important Reminders
*   **Restart Backend Server:** Whenever you update the database credentials, make sure to restart your Node.js backend (`npm run dev` or `node server.js`) so that the gateway re-initializes with the new values.
*   **Production Deployment:** Before going live, you must replace these settings with the unique, confidential credentials assigned to your business merchant account in the [bKash Merchant Portal](https://developer.bka.sh/) and change `bkash_is_live` to `true`.
