
# Meta CAPI Integration Restore Point

## Date: Current Implementation
## Status: Meta CAPI Integration Added

### Changes Made:
1. Added Meta Pixel script to `client/index.html`
2. Added Meta CAPI server integration in `server/utils/meta-capi.ts`
3. Updated form submission tracking in `SimpleQuoteForm.jsx`
4. Added Meta CAPI data processing to webhook handler
5. Restored Meta Pixel events to booking and quote selection pages

### Files Modified:
- `client/index.html` - Added Meta Pixel script
- `client/src/components/SimpleQuoteForm.jsx` - Added tracking and CAPI data
- `server/utils/meta-capi.ts` - New file for CAPI integration
- `server/utils/webhook.ts` - Added CAPI processing
- `client/src/pages/booking-new.tsx` - Restored Purchase tracking
- `client/src/components/QuoteOptions.jsx` - Restored InitiateCheckout tracking

### Environment Variables Required:
- `META_PIXEL_ID` - Your Meta Pixel ID
- `META_CAPI_ACCESS_TOKEN` - Your Meta CAPI access token

### Rollback Instructions:
To rollback these changes:
1. Remove Meta Pixel script from `client/index.html`
2. Remove Meta CAPI tracking code from form components
3. Delete `server/utils/meta-capi.ts`
4. Remove Meta CAPI imports and calls from `server/utils/webhook.ts`
5. Replace tracking calls with the previous "disabled" messages

### Testing:
- Set `test_event_code` parameter in URL for Meta test events
- Check browser console for tracking confirmations
- Verify events in Meta Events Manager
