# Proxy Setup for Railway Deployment

## Problem
Railway's IP (162.220.232.64) is being blocked by Cloudflare when trying to access Polymarket API.

## Solution
Use a proxy service to route requests through a different IP address.

## Recommended Free/Cheap Proxy Services

### Option 1: Bright Data (Formerly Luminati)
- **Cost:** Free tier available, then ~$5-10/month
- **Setup:** Create account, get proxy URL
- **Format:** `http://username:password@proxy.provider.com:port`

### Option 2: Smartproxy
- **Cost:** Free tier, then ~$5/month
- **Setup:** Simple dashboard
- **Format:** `http://username:password@gate.smartproxy.com:7000`

### Option 3: Oxylabs
- **Cost:** Free trial, then ~$10/month
- **Setup:** Easy integration
- **Format:** `http://username:password@pr.oxylabs.io:7777`

### Option 4: Free Proxy Lists
- **Cost:** Free
- **Risk:** Less reliable, may be slow
- **Sources:** free-proxy-list.net, proxy-list.download

## How to Configure

### Step 1: Get a Proxy URL
Sign up for one of the services above and get your proxy URL in format:
```
http://username:password@proxy.example.com:port
```

### Step 2: Add to Railway Environment Variables
1. Go to Railway dashboard
2. Click your `web` service
3. Go to **Variables** tab
4. Add:
```
HTTP_PROXY=http://username:password@proxy.example.com:port
HTTPS_PROXY=http://username:password@proxy.example.com:port
```

### Step 3: Redeploy
Push a change to GitHub to trigger redeploy:
```bash
git commit --allow-empty -m "Enable proxy for Cloudflare bypass"
git push origin main
```

## Testing
Once deployed, check logs for:
```
✓ MongoDB connected
✓ Monitoring traders...
📊 NEW TRADE DETECTED
✓ Order executed
```

## Alternative: Contact Polymarket
You can also contact Polymarket support to whitelist Railway's IP range for API access. This is the proper long-term solution.

## Current Status
- Local bot on Mac: ✅ Works (not blocked)
- Railway bot: ❌ Blocked by Cloudflare (needs proxy)

## Next Steps
1. Choose a proxy service
2. Get proxy URL
3. Add to Railway variables
4. Redeploy
5. Monitor logs
