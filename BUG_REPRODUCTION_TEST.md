# ZIP Code Dropdown Bug - Reproduction Steps

## Test Case 1: Fast Typing
1. Open form
2. Click "Ship From" field
3. **Quickly type "90210"** (all 5 digits in <1 second)
4. **BUG:** Dropdown shows popular cities, not Beverly Hills, CA

**Why:** Debounce cancels search on each keystroke. After last keystroke, 300ms delay starts. Meanwhile, dropdown shows stale data.

---

## Test Case 2: Paste ZIP Code
1. Open form
2. Copy "90210" to clipboard
3. Click "Ship From" field
4. **Paste the ZIP**
5. **BUG:** Sometimes shows nothing, sometimes shows popular cities

**Why:** Paste might not trigger onChange quickly enough, or search length check blocks it

---

## Test Case 3: Slow Network
1. Throttle network to "Slow 3G" in DevTools
2. Type "902" slowly
3. Wait 1 second
4. Type "10"
5. **BUG:** Dropdown shows "Loading..." forever or shows wrong results

**Why:** First search (for "902") is still in flight when "90210" search starts. Race condition.

---

## Test Case 4: Click Away and Back
1. Type "902"
2. Click outside dropdown (blur)
3. Click back into field (focus)
4. **BUG:** Dropdown shows popular cities, not search results for "902"

**Why:** onFocus doesn't trigger new search, shows stale filteredOptions

---

## Test Case 5: Single Character State
1. Type "T" (for Texas)
2. **BUG:** Nothing appears
3. Type "TX"
4. Results appear

**Why:** Minimum 2-character restriction blocks single-char searches

---

## Expected Behavior:
- Typing "90210" should show Beverly Hills, CA immediately
- Typing "9" should show all cities/ZIPs starting with 9
- Pasting should work instantly
- Dropdown should always show relevant results

## Current Behavior:
- Random appearance/disappearance of valid ZIPs
- Stale popular cities shown instead of search results
- No visual feedback during fast typing
