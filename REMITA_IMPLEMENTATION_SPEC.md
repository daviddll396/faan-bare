# Remita + ItexPay Dual Payment Integration Spec

## Overview
FAAN currently only supports ItexPay for payments. Need to add Remita as an alternative payment provider so users can choose which gateway to use.

## Current State
- **ItexPay**: Already implemented in `DashboardPage.tsx` (wallet funding) and `ServicesPage.tsx` (service payments)
- **Remita**: Previously removed. Type definitions still exist in `InvoicesPage.tsx` but implementation was deleted

## Requirements

### 1. Backend Changes (Node/API)

#### New Endpoint: POST `/api/payments/remita/initiate`
Generates Remita RRR (Remita Retrieval Reference) for payments.

**Request Body:**
```json
{
  "amount": 25000,
  "payerName": "John Doe",
  "payerEmail": "john@example.com",
  "payerPhone": "08012345678",
  "description": "FAAN Wallet Funding",
  "customerType": "INDIVIDUAL"
}
```

**Response:**
```json
{
  "success": true,
  "rrr": "123456789012",
  "orderId": "FAAN-1234567890-abc123",
  "paymentUrl": "https://remita.net/payment/rrr/123456789012"
}
```

**Implementation Notes:**
- Amount must be in **kobo** (multiply NGN by 100)
- Generate SHA512 hash: `merchantId + serviceTypeId + orderId + amount + apiKey`
- Remita endpoint: `POST https://remita.net/remita/exapp/api/v1/send/api/echannelsvc/merchant/api/paymentinit`
- Headers: `Authorization: remitaConsumerKey={merchantId},remitaConsumerToken={hash}`

#### New Endpoint: GET `/api/payments/remita/verify/:rrr`
Verifies payment status.

**Response:**
```json
{
  "status": "SUCCESS",
  "rrr": "123456789012",
  "amount": 25000,
  "message": "Payment successful"
}
```

#### New Endpoint: POST `/api/webhooks/remita`
Webhook handler for Remita payment notifications.

**Implementation:**
- Parse incoming notification from Remita
- Verify payment status via status check API
- Call `fundWallet()` or `makePayment()` backend function to record payment
- Return 200 status to acknowledge receipt

### 2. Frontend Changes

#### A. Add Remita Script Loading

**File:** `DashboardPage.tsx` and `ServicesPage.tsx`

Add Remita script alongside existing ItexPay script:

```typescript
// In useEffect for script loading, add:
const remitaScript = document.createElement("script");
remitaScript.src = "https://remita.net/payment/v1/remita-pay-inline.bundle.js";
remitaScript.async = true;
document.body.appendChild(remitaScript);

return () => {
  // cleanup both scripts
  document.body.removeChild(script); // ItexPay
  document.body.removeChild(remitaScript); // Remita
};
```

#### B. Add Payment Provider Selection UI

**File:** `DashboardPage.tsx` (Fund Wallet modal)

Add provider selection step:

```typescript
const [selectedProvider, setSelectedProvider] = useState<'itexpay' | 'remita' | null>(null);

// In the fund wallet modal, before amount input or after:
<div className="payment-provider-selection">
  <div className="payment-provider-label">Select Payment Provider:</div>
  <div className="payment-provider-buttons">
    <button
      className={selectedProvider === 'itexpay' ? 'active' : ''}
      onClick={() => setSelectedProvider('itexpay')}
    >
      Pay with ItexPay
    </button>
    <button
      className={selectedProvider === 'remita' ? 'active' : ''}
      onClick={() => setSelectedProvider('remita')}
    >
      Pay with Remita
    </button>
  </div>
</div>
```

**CSS:** Add styles for provider selection buttons (active state, hover, etc.)

#### C. Modify handleFund Function

**File:** `DashboardPage.tsx`

Update `handleFund` to branch based on provider:

```typescript
const handleFund = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ... validation stays same ...
  
  if (!selectedProvider) {
    showToast("Select a payment provider", "error");
    return;
  }

  setShowFundLoading(true);
  setShowFundWallet(false);

  try {
    if (selectedProvider === 'itexpay') {
      // EXISTING ITEXPAY CODE (keep as-is)
      const Pay = new win.ItexPayNS!.ItexPay({...});
      Pay.init();
      
    } else {
      // NEW REMITA FLOW
      
      // 1. Call backend to generate RRR
      const response = await fetch('/api/payments/remita/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('faan_token')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount),
          payerName: `${user?.firstName} ${user?.lastName}`,
          payerEmail: user?.email,
          payerPhone: user?.phoneNumber,
          description: 'FAAN Wallet Funding',
          customerType: user?.customerType
        })
      });

      const data = await response.json();

      if (data.success && data.rrr) {
        // 2. Initialize Remita inline checkout
        const paymentEngine = RmPaymentEngine.init({
          key: process.env.VITE_REMITA_PUBLIC_KEY,
          customerId: user?.customerId || user?.id,
          transactionId: Date.now(),
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          amount: Math.round(amount) * 100, // REMITA USES KOBO!
          narration: 'FAAN Wallet Funding',
          onSuccess: async (response) => {
            // 3. Verify and record payment
            const verifyRes = await fetch(`/api/payments/remita/verify/${response.rrr}`);
            const verifyData = await verifyRes.json();
            
            if (verifyData.status === 'SUCCESS') {
              // Call fundWallet to credit user's account
              const result = await fundWallet(amount, response.rrr, verifyData);
              
              if (result) {
                setShowFundSuccess(true);
                setShowFundWallet(true);
                showToast("Wallet funded successfully!", "success");
                await refreshUserDetails();
                
                // Persist funding record
                const record: FundingTransaction = {
                  id: Date.now(),
                  reference: response.rrr,
                  paymentMethod: "Remita",
                  method: "Remita",
                  amount: Math.round(amount),
                  balanceBefore: localWalletBalance,
                  balanceAfter: localWalletBalance + Math.round(amount),
                  createdAt: new Date().toISOString(),
                };
                // ... persist to localStorage and state
              }
            }
          },
          onError: (err) => {
            logger.error("Remita payment error:", err);
            setShowFundLoading(false);
            setShowFundWallet(true);
            showToast("Payment failed. Please try again.", "error");
          },
          onClose: () => {
            logger.info("Remita widget closed");
            setShowFundLoading(false);
            setShowFundWallet(true);
          }
        });
        
        paymentEngine.showPaymentWidget();
      } else {
        setShowFundLoading(false);
        setShowFundWallet(true);
        showToast(data.error || "Failed to initiate payment", "error");
      }
    }
  } catch (error) {
    logger.error("Fund wallet error:", error);
    setShowFundLoading(false);
    setShowFundWallet(true);
    showToast("Payment initiation failed. Please try again.", "error");
  }
};
```

#### D. Update ServicesPage.tsx

**File:** `ServicesPage.tsx`

Same pattern for service payments:

1. Add provider selection state and UI
2. Modify `handlePayment` function to branch:
   - If `user.role === 'Customer'`: Use existing backend `makePayment`
   - If Guest + ItexPay selected: Use existing ItexPay inline
   - If Guest + Remita selected: Call `/api/payments/remita/initiate` → `RmPaymentEngine.init()`

### 3. Environment Variables

Add to `.env`:
```
VITE_REMITA_PUBLIC_KEY=your_remita_public_key
REMITA_MERCHANT_ID=your_merchant_id
REMITA_API_KEY=your_api_key
REMITA_SERVICE_TYPE_ID=your_service_type_id
```

### 4. Type Definitions

**File:** `InvoicesPage.tsx` (already exists, verify/update)

```typescript
declare global {
  interface Window {
    RmPaymentEngine: {
      init: (config: RemitaPaymentConfig) => RemitaPaymentHandler;
    };
  }
}

interface RemitaPaymentConfig {
  key: string;
  customerId: string;
  transactionId: number;
  firstName: string;
  lastName: string;
  email: string;
  amount: number; // In kobo!
  narration: string;
  onSuccess: (response: Record<string, unknown>) => void;
  onError: (response: Record<string, unknown>) => void;
  onClose: () => void;
}

interface RemitaPaymentHandler {
  showPaymentWidget: () => void;
}
```

### 5. API Route Handler

**File:** Create `server/src/routes/payments/remita.ts` or add to existing payment routes

```typescript
import crypto from 'crypto';
import { Router } from 'express';

const router = Router();

router.post('/initiate', async (req, res) => {
  // Implementation details above
});

router.get('/verify/:rrr', async (req, res) => {
  // Implementation details above
});

router.post('/webhook', async (req, res) => {
  // Implementation details above
});

export default router;
```

### 6. Database Updates

No schema changes needed. Use existing:
- `fundWallet()` function for wallet funding records
- `makePayment()` function for service payment records
- Store `paymentMethod: 'Remita'` or `'ITEXPay'` in transaction records

## Testing Checklist

- [ ] Remita script loads correctly
- [ ] Provider selection UI appears
- [ ] Switching between ItexPay and Remita works
- [ ] Minimum amounts enforced (₦25k individual, ₦200k corporate)
- [ ] Amount converted to kobo for Remita
- [ ] RRR generated successfully
- [ ] Remita widget opens
- [ ] Payment success records in DB
- [ ] Payment failure handled gracefully
- [ ] Wallet balance updates after Remita payment
- [ ] Works for both Customer and Guest roles
- [ ] Widget close handling doesn't break flow

## Key Differences: ItexPay vs Remita

| Feature | ItexPay | Remita |
|---------|---------|--------|
| Script | `checkout.itexpay.com/*/itexpay-inline-staging-min.js` | `remita.net/payment/v1/remita-pay-inline.bundle.js` |
| Init | `new ItexPayNS.ItexPay({...})` | `RmPaymentEngine.init({...})` |
| Show | `.init()` | `.showPaymentWidget()` |
| Amount | Naira (e.g., `25000`) | **Kobo** (e.g., `2500000`) |
| API Auth | `api_key` | `publicKey` |
| Success | `onCompleted` | `onSuccess` |
| Backend | Direct inline, no pre-call | Requires `/initiate` call first |
| Callback | Inline only | Inline + Webhook |

## Files to Modify

1. `src/components/pages/DashoardPage/DashboardPage.tsx` - Add provider selection, Remita flow
2. `src/components/pages/ServicesPage/ServicesPage.tsx` - Add provider selection, Remita flow
3. `server/src/routes/payments/remita.ts` - NEW FILE - Backend endpoints
4. `server/src/routes/index.ts` - Register Remita routes
5. `.env` - Add Remita credentials
6. `src/components/pages/DashoardPage/DashboardPage.css` - Add provider selection styles

## Notes for Codex

1. **Amount handling is critical**: Remita uses kobo, ItexPay uses naira. Multiply by 100 for Remita.
2. **Script loading**: Add Remita script alongside ItexPay, both need cleanup on unmount.
3. **Backend first**: Must call `/api/payments/remita/initiate` before opening Remita widget.
4. **Webhook optional**: Can rely on inline `onSuccess` callback for MVP, webhook for production.
5. **Error handling**: Always reset `showFundLoading` and reopen modal on errors.
6. **State management**: Track `selectedProvider` and validate before proceeding.
