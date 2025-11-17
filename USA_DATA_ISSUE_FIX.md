# USA Data Not Showing - Solution ✅

## The Problem

You're not seeing USA data on the graphs because **USA is currently unchecked** in your country selection.

## Why This Happened

The app uses **localStorage** to remember your preferences between visits. At some point, USA was unchecked and that preference was saved. Every time you visit the app, it loads those saved preferences.

## How to Fix It - 3 Easy Ways

### ✅ Option 1: Check the USA Checkbox (Recommended)
1. Open the app at http://localhost:3000
2. Scroll down to "Select Countries to Display"
3. **Look for the yellow warning box** that says "USA is not selected"
4. Find the **USA checkbox** (it will be highlighted with a yellow ring)
5. **Click to check** the USA box
6. USA data will immediately appear on all graphs!

### ✅ Option 2: Click "Reset Defaults" Button
1. Open the app at http://localhost:3000
2. Scroll down to "Select Countries to Display"
3. Click the **"Reset Defaults"** button in the top-right of that section
4. This restores the original 9 countries including USA

### ✅ Option 3: Clear Browser Storage
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Type: `localStorage.clear()`
4. Press Enter
5. Refresh the page (F5)

## New Features Added to Help

### 1. Warning Banner
If USA is not selected, you'll see a yellow warning box:
```
⚠️ USA is not selected. Check the box below to see US data on the graphs.
```

### 2. Visual Highlight
The USA checkbox will be **highlighted with a yellow ring** if it's unchecked, making it easy to spot.

### 3. Reset Defaults Button
Click this button to instantly restore the default country selection (first 9 countries including USA).

### 4. Debug Information
Open the browser console (F12) to see helpful debug info:
```
=== DEBUG INFO ===
Selected countries from localStorage: ["Canada", "France", "Germany", ...]
Available country names: ["USA", "Canada", "France", ...]
USA is selected: false
==================
```

## Verify USA Data is Working

After checking the USA box, you should see:

1. **On Interest Rates chart:** Blue line for USA (#8884d8)
2. **In legend:** "USA" listed with a blue color swatch
3. **On hover:** Tooltip shows USA values
4. **Console log:** "USA is selected: true"

## Technical Details

### Country Selection
The app stores your selected countries in localStorage under the key `'selectedCountries'`.

**Default countries (first 9):**
1. ✅ USA
2. ✅ Canada
3. ✅ France
4. ✅ Germany
5. ✅ Italy
6. ✅ Japan
7. ✅ UK
8. ✅ Australia
9. ✅ Mexico

### Country Code Mapping
- **World Bank API** uses code: `US`
- **App displays** as: `USA`
- **Color**: Blue (#8884d8)

### Data Source
All USA economic data comes from the World Bank API using country code `US`, which is automatically mapped to display name `USA`.

## Troubleshooting

### Still Not Seeing USA Data?

1. **Check the Console Logs:**
   ```javascript
   // Open DevTools (F12) → Console tab
   // Look for these logs:
   "Available countries in interest rates: [...]"
   "Selected countries: [...]"
   "USA is selected: true/false"
   ```

2. **Verify USA is in the Data:**
   ```javascript
   // In console:
   localStorage.getItem('cache_wb_all_data')
   // Should contain USA data
   ```

3. **Force a Fresh Data Load:**
   - Click the **"Refresh Data"** button near the top
   - This clears cache and fetches fresh data from World Bank API

4. **Check Network Tab:**
   - Open DevTools → Network tab
   - Look for requests to `api.worldbank.org`
   - Check if USA (US) is in the country list: `country/US;CA;GB;...`

### If USA Checkbox Doesn't Appear

1. Clear the search box (might be filtering it out)
2. Try typing "USA" in the search box
3. Click "Reset Defaults" button

## Prevention

To avoid this in the future:

1. **Be careful when unchecking countries** - your choices are saved
2. **Use "Reset Defaults"** if you're unsure which countries to select
3. **Check the warning banner** - it will alert you if USA is not selected

## Additional Commands

### Check What's in LocalStorage:
```javascript
// See selected countries
localStorage.getItem('selectedCountries')

// See all saved preferences
for (let i = 0; i < localStorage.length; i++) {
  console.log(localStorage.key(i), '=', localStorage.getItem(localStorage.key(i)));
}
```

### Manually Set USA as Selected:
```javascript
// Force USA to be selected
let selected = JSON.parse(localStorage.getItem('selectedCountries') || '[]');
if (!selected.includes('USA')) {
  selected.push('USA');
  localStorage.setItem('selectedCountries', JSON.stringify(selected));
  window.location.reload();
}
```

## Summary

**Root Cause:** USA was unchecked in the country selection and saved to localStorage.

**Quick Fix:** Check the USA checkbox or click "Reset Defaults" button.

**Visual Cue:** Yellow warning banner and highlighted USA checkbox.

---

**The USA data IS available** - you just need to select it in the country checkboxes! 📊🇺🇸

