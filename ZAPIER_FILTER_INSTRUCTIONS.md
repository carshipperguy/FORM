# Zapier Filter Instructions for Health Check Pings

## Overview
To prevent diagnostic health check pings from triggering unnecessary Zapier tasks, we've implemented clear flags in both the request payload and headers. These flags need to be used in Zapier to filter out these health checks.

## Zapier Filter Configuration Steps

1. **Log into your Zapier account** and open the webhook Zap that's receiving leads.

2. **Add a Filter step** right after your webhook trigger:
   - Click the "+" button after your webhook trigger
   - Search for and select "Filter by Zapier"
   - Choose "Only continue if..."

3. **Set up the filter condition using ONE of these options**:

   ### Option 1: Filter by payload flag (recommended)
   - Field: `DO_NOT_PROCESS`
   - Condition: "Does not exist"
   
   (This will only allow requests that don't have the DO_NOT_PROCESS flag to continue)

   ### Option 2: Filter by ZAPIER_FILTER_FLAG
   - Field: `ZAPIER_FILTER_FLAG` 
   - Condition: "Does not exist"

   ### Option 3: Filter by header (if your webhook setup captures headers)
   - Field: `headers__x_zapier_filter`
   - Condition: "Does not exist"

   ### Option 4: Filter by combinations
   You can also combine multiple conditions for extra safety:
   - Only continue if ALL of these conditions are true:
     - `DO_NOT_PROCESS` "Does not exist"
     - `IS_DIAGNOSTIC_PING` "Does not exist"

4. **Click "Continue" and save your Zap**.

## Testing the Filter
After setting up the filter, you can verify it's working by:

1. Wait for the next automatic health check (runs every 30 minutes)
2. Check your Zap history to confirm the health check was correctly filtered
3. Submit a real lead to verify legitimate submissions still go through

## Important Note
The health checks will still receive a "200 OK" response from Zapier, but they won't trigger any subsequent steps in your Zap (email notifications, database entries, etc.). This is expected and allows our system to verify that the webhook endpoint is functioning properly without generating unnecessary actions.

If you need any assistance configuring these filters, please contact us for help.