# Troubleshooting Guide

## Current Status

### ✅ Working
- API Authentication with token
- Querying account information
- Listing locations and sound zones
- Accessing sound zone details

### ❌ Not Working
- `setVolume` mutation returns "Not found" error

## Details

**Account**: BMAsia Unlimited DEMO
**Zone ID**: U291bmRab25lLCwxYzN3NGR0cXkyby9Mb2NhdGlvbiwsMWwzNHpkc3RibHMvQWNjb3VudCwsMThjdHE4b2t4czAv
**Zone Name**: Test Player
**API Token**: Correctly configured and working for read operations

## Error Response

```json
{
  "data": {
    "setVolume": null
  },
  "errors": [
    {
      "message": "Not found",
      "path": ["setVolume"],
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

## Possible Causes

1. **API Token Permissions**
   - The token can read data but might not have write/control permissions
   - Volume control might require a special permission flag

2. **Account Type Restrictions**
   - "DEMO" accounts might not support volume control
   - Volume control might be a premium feature

3. **Zone Requirements**
   - The zone might need to be actively playing music
   - There might be a minimum device firmware requirement
   - The zone might need special configuration

## Next Steps

1. Contact Soundtrack Your Brand support to:
   - Verify if the API token has volume control permissions
   - Confirm if demo accounts support volume control
   - Get guidance on any additional requirements

2. If you have a production account, try:
   - Testing with a production API token
   - Using a non-demo sound zone

3. Check the Soundtrack Your Brand dashboard to see if:
   - Volume control works through the web interface
   - There are any account limitations shown

## Testing Commands

Test API connection:
```bash
npm run test-api
```

Test volume control (when working):
```bash
npm run test-volume 10
```

Test with different zone ID:
```bash
npm run test-api [different-account-id]
```