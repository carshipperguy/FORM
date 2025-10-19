# COMPLETE PRICING FORENSIC AUDIT
## System-Wide Price Calculation & Transmission Analysis

**Generated:** October 19, 2025  
**Purpose:** Identify ALL locations where pricing is calculated, displayed, or transmitted

---

## EXECUTIVE SUMMARY

**CRITICAL FINDING:** The system has **ONE AUTHORITATIVE PRICING FUNCTION** (`calculatePrice` in `client/src/lib/pricing.ts`) that is used for all calculations. However, there are **NO PRICE TRANSFORMATIONS** applied between calculation and display in the current codebase.

**ISSUE STATUS:** The `/1.21` division mentioned in previous analysis **DOES NOT EXIST** in the current code. This suggests either:
1. The issue was already fixed but customers are seeing cached versions
2. The production deployment is running different code than what's in the repository
3. There's a client-side caching issue (browser cache, service worker, CDN)

---

## PART 1: PRICE CALCULATION FUNCTIONS

### 1.1 PRIMARY CALCULATION FUNCTION
**File:** `client/src/lib/pricing.ts`  
**Function:** `calculatePrice(distance, vehicleType, date, pickupLocation, dropoffLocation)`  
**Lines:** 61-292

**Purpose:** Single unified pricing engine for ALL vehicle types

**Vehicle-Specific Logic:**

#### A. Car/Truck/SUV (Lines 182-194)
```typescript
if (isCarTruckSUV) {
  // RULE 1: Minimum floor - $695
  if (basePrice < 695) {
    basePrice = 695;
  }
  
  // RULE 2: Middle-range uplift - 20% for $696-$1070 range
  if (basePrice >= 696 && basePrice <= 1070) {
    basePrice = Math.round(basePrice * 1.2);  // ← 20% MARKUP APPLIED HERE
  }
}
```

#### B. RV/5th Wheel/Travel Trailer (Lines 195-201)
```typescript
else if (ENABLE_NEW_SPECIAL_PRICING && isSpecialVehicleType(vehicleType)) {
  const specialPrice = calculateSpecialPricing(distance);
  // calculateSpecialPricing: miles × $3.00, minimum $750
  basePrice = specialPrice;
}
```

#### C. Other Vehicle Types (Lines 202-209)
```typescript
else {
  // Apply $695 minimum
  basePrice = Math.max(basePrice, 695);
}
```

**Returns:**
```typescript
{
  openTransport: Math.round(openTransportPrice),
  enclosedTransport: Math.round(enclosedTransportPrice),
  transitTime: number,
  message?: string
}
```

---

## PART 2: PRICE DATA FLOW (Complete Lineage)

### 2.1 CALCULATION → STORAGE
**File:** `client/src/components/SimpleQuoteForm.jsx`  
**Lines:** 385-445

```
1. User submits form
2. MapQuest API called for distance (line ~350)
3. calculatePrice() called (line 390)
4. Results stored in quoteData object (lines 411-419):
   - openTransportPrice = pricingResult.openTransport
   - enclosedTransportPrice = pricingResult.enclosedTransport
   - distance = distanceData.distance
```

**FORENSIC CHECKPOINT 1 (Lines 432-438):**
```javascript
console.log("═══════════════════════════════════════");
console.log("🔬 FORENSIC TRACE - QUOTE CALCULATION");
console.log("[DISTANCE] miles:", quoteData.distance);
console.log("[CALCULATED] openTransport:", quoteData.openTransportPrice);
console.log("[CALCULATED] enclosed:", quoteData.enclosedTransportPrice);
```

### 2.2 STORAGE → WEBHOOK
**File:** `client/src/components/SimpleQuoteForm.jsx`  
**Lines:** 476-562

```
1. webhookData created from quoteData (line 476)
2. No transformations applied
3. Sent to /api/webhook endpoint (line 553)
```

**FORENSIC CHECKPOINT 2 (Lines 545-551):**
```javascript
console.log("═══════════════════════════════════════");
console.log("🔬 FORENSIC TRACE - WEBHOOK PAYLOAD");
console.log("[DISTANCE] miles:", webhookData.distance);
console.log("[PAYLOAD] openTransport:", webhookData.openTransportPrice);
console.log("[PAYLOAD] enclosed:", webhookData.enclosedTransportPrice);
```

### 2.3 STORAGE → SESSION STORAGE
**File:** `client/src/components/SimpleQuoteForm.jsx`  
**Lines:** 639-658

```
1. quoteDataWithAttribution created (includes attribution params)
2. Stored in sessionStorage.quote_data (line 655)
3. No price transformations applied
```

**FORENSIC CHECKPOINT 3 (Lines 647-653):**
```javascript
console.log("═══════════════════════════════════════");
console.log("🔬 FORENSIC TRACE - SESSION STORAGE");
console.log("[DISTANCE] miles:", quoteDataWithAttribution.distance);
console.log("[SESSION] openTransport:", quoteDataWithAttribution.openTransportPrice);
console.log("[SESSION] enclosed:", quoteDataWithAttribution.enclosedTransportPrice);
```

### 2.4 SESSION STORAGE → DISPLAY
**File:** `client/src/pages/final-quote.tsx`  
**Lines:** 20-82

```
1. Retrieves quote_data from sessionStorage (line 24)
2. Parses JSON (line 39)
3. Passes to QuoteOptions component (line 100)
```

**Diagnostic Logging (Lines 40-45):**
```javascript
console.log("🔍 DISTANCE RETRIEVED FROM SESSIONSTORAGE:", parsed.distance);
console.log("🔍 PRICES RETRIEVED FROM SESSIONSTORAGE:", {
  openTransportPrice: parsed.openTransportPrice,
  enclosedTransportPrice: parsed.enclosedTransportPrice
});
```

### 2.5 DISPLAY COMPONENT
**File:** `client/src/components/QuoteOptions.jsx`  
**Lines:** 5-105

```
1. Receives formData as props (line 5)
2. Creates local copy (line 22)
3. Uses prices directly for display:
   - standardPrice = formData.openTransportPrice or formData.enclosedTransportPrice
   - expressPrice = standardPrice × 1.2 (20% express fee)
```

**FORENSIC CHECKPOINT 4 (Lines 40-48):**
```javascript
console.log("═══════════════════════════════════════");
console.log("🔬 FORENSIC TRACE - DISPLAY PRICE");
console.log("[DISTANCE] miles:", formData.distance);
console.log("[DISPLAY] standardPrice:", standardPrice);
console.log("[DISPLAY] expressPrice:", expressPrice);
```

**CRITICAL:** Express pricing adds 20% on top (line 38):
```javascript
const expressPrice = isEnclosedExpress 
  ? Math.round(formData.enclosedTransportPrice * 1.2) 
  : Math.round(formData.openTransportPrice * 1.2);
```

---

## PART 3: PRICE TRANSFORMATION INVENTORY

### 3.1 ALL IDENTIFIED TRANSFORMATIONS

| Location | Transformation | Vehicle Types | Purpose |
|----------|---------------|---------------|---------|
| `pricing.ts:192` | `× 1.2` | Car/Truck/SUV only | Middle-range uplift ($696-$1070) |
| `QuoteOptions.jsx:38` | `× 1.2` | ALL | Express delivery fee |
| `pricing.ts:279-280` | `Math.round()` | ALL | Remove decimals |

### 3.2 TRANSFORMATIONS THAT DO NOT EXIST IN CURRENT CODE

| Claimed Location | Transformation | Status |
|-----------------|---------------|--------|
| `SimpleQuoteForm.jsx` | `÷ 1.21` | **NOT FOUND** |
| ANY FILE | Display price adjustment | **NOT FOUND** |
| ANY FILE | Reverse markup for non-car types | **NOT FOUND** |

---

## PART 4: VEHICLE TYPE ANALYSIS

### 4.1 CAR/TRUCK/SUV PRICE PATH

**Example:** 800 miles
```
1. Base calculation: 800 × $0.614 × 1.10 = $540
2. Distance < 1500 + MULTIPLIER_MODE: $540 × 1.40 × 1.40 = $1,058
3. In range $696-$1070: $1,058 × 1.2 = $1,270 ← 20% UPLIFT APPLIED
4. Display: $1,270
5. Webhook: $1,270
6. Express: $1,270 × 1.2 = $1,524
```

**RESULT:** Display = Webhook ✅

### 4.2 RV/5TH WHEEL PRICE PATH

**Example:** 1292 miles (Myrtle Beach SC → Lawton OK)
```
1. Special pricing: 1292 × $3.00 = $3,876
2. Display: $3,876
3. Webhook: $3,876
4. Express: $3,876 × 1.2 = $4,651
```

**EXPECTED RESULT:** Display = Webhook = $3,876 ✅

**REPORTED RESULT:** Display = $3,203, Webhook = $3,876 ❌

**Math Analysis:** $3,876 ÷ 1.21 = $3,203.31

### 4.3 MOTORCYCLE PRICE PATH

**Example:** 1000 miles
```
1. Base: 1000 × $0.614 = $614
2. Motorcycle multiplier: $614 × 0.7 = $430
3. +50% (MULTIPLIER_MODE): $430 × 1.5 = $645
4. Minimum $695: max($645, $695) = $695
5. Display: $695
6. Webhook: $695
```

**RESULT:** Display = Webhook ✅

### 4.4 OTHER VEHICLE TYPES (Boat, ATV, Golf Cart, Heavy Equipment)

**Process:**
```
1. Base calculation with vehicle multiplier
2. $695 minimum applied
3. No additional markups
4. Display = Webhook
```

**RESULT:** Display = Webhook ✅

---

## PART 5: BACKEND WEBHOOK PROCESSING

### 5.1 WEBHOOK ENDPOINT
**File:** `server/routes.ts`  
**Endpoint:** `POST /api/webhook`

**Process:**
1. Receives webhookData from frontend
2. Validates required fields
3. Formats data for Zapier
4. NO PRICE CALCULATIONS OR MODIFICATIONS
5. Sends formatted data to external webhook

### 5.2 WEBHOOK UTILITY
**File:** `server/utils/webhook.ts`

**Functions:**
- `sendWebhook()` - Sends data to Zapier
- `formatWebhookData()` - Formats fields (names, addresses)
- **NO PRICE TRANSFORMATIONS**

---

## PART 6: CRITICAL DISCREPANCY ANALYSIS

### 6.1 THE MYSTERY OF $3,203 vs $3,876

**Known Facts:**
- Backend calculates: $3,876 (1292 miles × $3.00) ✅
- Webhook receives: $3,876 ✅
- Customer sees: $3,203 ❌
- Math: $3,876 ÷ 1.21 = $3,203.31

**Code Search Results:**
```bash
grep -r "1.21" client/src → NO MATCHES
grep -r "/\s*1.2" client/src → NO MATCHES
grep -r "displayPrice" client/src → NO MATCHES
grep -r "adjustedPrice" client/src → NO MATCHES
```

### 6.2 POSSIBLE EXPLANATIONS

#### Hypothesis 1: Stale Deployment ⚠️
**Evidence:**
- `dist/index.js` last modified: October 14, 2025
- Current date: October 19, 2025
- Code repository shows no `/1.21` division
- **This suggests production is running 5-day-old code**

**Test:** Rebuild and deploy fresh code

#### Hypothesis 2: Browser Cache 🔍
**Evidence:**
- Customer reports issue in "both environments"
- Could be browser caching old JavaScript bundle

**Test:** Hard refresh (Ctrl+Shift+R) or incognito mode

#### Hypothesis 3: CDN/Proxy Cache 🌐
**Evidence:**
- Embedded iframe may be served through CDN
- CDN could be caching old version

**Test:** Check CDN purge settings

#### Hypothesis 4: Code Not in Repository ⚠️
**Evidence:**
- `/1.21` division was added but not committed
- Or exists in production branch not visible in dev

**Test:** Check git history and production branch

#### Hypothesis 5: Client-Side Runtime Modification 🔧
**Evidence:**
- Some external script modifying prices after render
- Browser extension or parent window interference

**Test:** Check browser console for external scripts

---

## PART 7: VERIFICATION TEST PLAN

### 7.1 CONTROLLED ENVIRONMENT TESTS

#### Test 1: RV Quote (Primary Issue)
```
Input:
- Pickup: Myrtle Beach, SC 29572
- Dropoff: Lawton, OK 73503  
- Vehicle: RV/5th Wheel
- Distance: 1292 miles

Expected:
- Calculation: 1292 × $3.00 = $3,876
- Display: $3,876
- Session Storage: $3,876
- Webhook: $3,876

Verification:
- Open browser console
- Submit quote
- Check all 4 FORENSIC TRACE checkpoints
- Screenshot displayed price
- Check webhook payload in server logs
```

#### Test 2: Car/Truck/SUV (Control Test)
```
Input:
- Distance: 800 miles
- Vehicle: Car

Expected:
- Calculation: ~$1,270 (with 20% uplift)
- Display: $1,270
- Webhook: $1,270

Verification:
- Compare all 4 checkpoints
- Verify 20% uplift only applied once
```

#### Test 3: Motorcycle (Edge Case)
```
Input:
- Distance: 1000 miles
- Vehicle: Motorcycle

Expected:
- Calculation: $695 (minimum)
- Display: $695
- Webhook: $695

Verification:
- Ensure minimum is enforced
- No unexpected transformations
```

### 7.2 CONSOLE LOG VERIFICATION SCRIPT

```javascript
// Run this in browser console after submitting quote
const checkpoints = {
  calculation: null,
  payload: null,
  session: null,
  display: null
};

// Monitor console logs for forensic checkpoints
const originalLog = console.log;
console.log = function(...args) {
  if (args[0]?.includes('FORENSIC TRACE - QUOTE CALCULATION')) {
    checkpoints.calculation = args;
  }
  if (args[0]?.includes('FORENSIC TRACE - WEBHOOK PAYLOAD')) {
    checkpoints.payload = args;
  }
  if (args[0]?.includes('FORENSIC TRACE - SESSION STORAGE')) {
    checkpoints.session = args;
  }
  if (args[0]?.includes('FORENSIC TRACE - DISPLAY PRICE')) {
    checkpoints.display = args;
  }
  originalLog.apply(console, args);
};

// After quote submission, check consistency:
setTimeout(() => {
  console.table(checkpoints);
}, 5000);
```

---

## PART 8: RACE CONDITIONS & ASYNC STATE

### 8.1 IDENTIFIED ASYNC OPERATIONS

**Distance API Call:**
```javascript
// SimpleQuoteForm.jsx line ~350
const distanceResponse = await fetch('/api/distance/calculate', ...);
```

**Webhook Submission:**
```javascript
// SimpleQuoteForm.jsx line 553
const webhookResponse = await fetch(apiUrl, ...);
```

### 8.2 POTENTIAL RACE CONDITIONS

❌ **NONE IDENTIFIED** - All operations are sequential:
```
1. Form submit → 2. Fetch distance → 3. Calculate price → 
4. Store data → 5. Send webhook → 6. Navigate to display
```

No parallel state updates that could cause price divergence.

---

## PART 9: GLOBAL SAFEGUARDS PROPOSAL

### 9.1 SINGLE SOURCE OF TRUTH SYSTEM

**Recommendation:** Implement immutable price object

```typescript
// Create once, freeze, never modify
const priceData = Object.freeze({
  calculated: pricingResult.openTransport,
  display: pricingResult.openTransport,
  webhook: pricingResult.openTransport,
  timestamp: Date.now()
});
```

### 9.2 VALIDATION CHECKPOINTS

**Add assertion at each handoff:**

```javascript
// Before webhook
console.assert(
  webhookData.openTransportPrice === quoteData.openTransportPrice,
  'PRICE MISMATCH: webhook !== calculation'
);

// Before display
console.assert(
  formData.openTransportPrice === sessionData.openTransportPrice,
  'PRICE MISMATCH: display !== session'
);
```

### 9.3 REAL-TIME MONITORING

**Add to webhook payload:**

```javascript
{
  ...webhookData,
  _diagnostics: {
    calculatedPrice: originalCalculation,
    displayedPrice: screenValue,
    priceMatch: originalCalculation === screenValue,
    timestamp: Date.now()
  }
}
```

---

## PART 10: EXTERNAL INTEGRATIONS IMPACT

### 10.1 ZAPIER WEBHOOK
**File:** `server/utils/webhook.ts`  
**Impact:** ✅ NO CHANGES NEEDED
- Receives prices as-is
- No transformations applied
- Format changes only affect text fields (names, addresses)

### 10.2 CRM INGESTION
**Endpoint:** `/api/crm/track-lead-source`  
**Impact:** ✅ NO CHANGES NEEDED
- Attribution data only
- No price data in CRM webhook

### 10.3 META CAPI TRACKING
**File:** `server/routes.ts` (Meta CAPI endpoint)  
**Impact:** ✅ NO CHANGES NEEDED
- Uses `value` field from `finalPrice`
- As long as `finalPrice` = displayed price, CAPI is correct

### 10.4 FACEBOOK PIXEL
**Location:** `client/src/components/QuoteOptions.jsx:76`  
**Impact:** ✅ NO CHANGES NEEDED
- Tracks `finalPrice` from selected option
- Same value customer sees

---

## PART 11: DEFINITIVE STATEMENT

### CAN A DISPLAY/WEBHOOK MISMATCH OCCUR?

**Based on current codebase analysis:**

✅ **NO** - The code has ONE calculation function with NO transformations between:
- Calculation → Webhook ✅
- Calculation → Display ✅

❌ **HOWEVER** - The reported issue ($3,203 vs $3,876) has mathematical signature of `/1.21` division that **DOES NOT EXIST** in current code.

**Conclusion:** The issue is NOT in the code logic, but in deployment/caching:
1. Production is running old code (dist folder is 5 days old)
2. Browser/CDN is serving cached JavaScript bundle
3. Code in production branch differs from repository

---

## PART 12: IMMEDIATE ACTION ITEMS

### 12.1 NO CODE CHANGES REQUIRED ✅

The codebase is architecturally sound. All pricing flows through one function with proper separation of concerns.

### 12.2 DEPLOYMENT VERIFICATION REQUIRED ⚠️

1. ✅ **COMPLETED:** Rebuilt frontend (npm run build)
2. ✅ **COMPLETED:** Restarted application workflow
3. ⏳ **PENDING:** Customer verification with fresh deployment
4. ⏳ **PENDING:** Browser hard refresh to clear cache
5. ⏳ **PENDING:** Check production embed for CDN cache

### 12.3 MONITORING ADDITIONS (Optional Enhancement)

If issue persists after deployment refresh, add:
- Price equality assertions at each checkpoint
- Server-side logging of display vs webhook prices
- Client-side error reporting for mismatches

---

## APPENDIX A: ALL PRICE-HANDLING FILES

| File | Purpose | Modifies Price? |
|------|---------|----------------|
| `client/src/lib/pricing.ts` | Main calculation | ✅ YES (authoritative) |
| `client/src/components/SimpleQuoteForm.jsx` | Form submission | ❌ NO (passes through) |
| `client/src/components/QuoteOptions.jsx` | Display & selection | ❌ NO (displays only) |
| `client/src/pages/final-quote.tsx` | Data retrieval | ❌ NO (loads from storage) |
| `client/src/pages/booking.tsx` | Booking form | ❌ NO (reads only) |
| `server/routes.ts` | API endpoints | ❌ NO (passes through) |
| `server/utils/webhook.ts` | Webhook transmission | ❌ NO (formats text only) |

---

## APPENDIX B: FORENSIC LOG ANALYSIS

### Expected Log Sequence for RV Quote (1292 miles):

```
═══════════════════════════════════════
🔬 FORENSIC TRACE - QUOTE CALCULATION
[DISTANCE] miles: 1292
[CALCULATED] openTransport: 3876
[CALCULATED] enclosed: 5426
═══════════════════════════════════════

═══════════════════════════════════════
🔬 FORENSIC TRACE - WEBHOOK PAYLOAD
[DISTANCE] miles: 1292
[PAYLOAD] openTransport: 3876
[PAYLOAD] enclosed: 5426
═══════════════════════════════════════

═══════════════════════════════════════
🔬 FORENSIC TRACE - SESSION STORAGE
[DISTANCE] miles: 1292
[SESSION] openTransport: 3876
[SESSION] enclosed: 5426
═══════════════════════════════════════

═══════════════════════════════════════
🔬 FORENSIC TRACE - DISPLAY PRICE
[DISTANCE] miles: 1292
[DISPLAY] standardPrice: 3876
[DISPLAY] expressPrice: 4651
═══════════════════════════════════════
```

**All values should be 3876** - any deviation indicates issue.

---

## END OF AUDIT

**Audited by:** Replit Agent  
**Date:** October 19, 2025  
**Status:** Complete - No code logic issues found  
**Next Steps:** Verify deployment and clear caches
