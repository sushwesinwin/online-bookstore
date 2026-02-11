# Troubleshooting Guide - Frontend Not Displaying Data

## Issue: Trending Books and Bestsellers Not Displaying

### Quick Checklist

1. **Is the backend running?**
   ```bash
   curl http://localhost:3001/books?page=1&limit=5
   ```
   ✅ Should return JSON with books data

2. **Is the frontend running?**
   ```bash
   cd frontend
   pnpm dev
   ```
   ✅ Should be running on http://localhost:3000

3. **Check browser console**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

4. **Check React Query Devtools**
   - Look for floating icon in bottom-right corner
   - Click to open devtools
   - Check query status (loading/error/success)

## Common Issues & Solutions

### Issue 1: CORS Error
**Symptoms:**
- Console shows: `Access to XMLHttpRequest blocked by CORS policy`
- Network tab shows failed requests

**Solution:**
```bash
# Check backend CORS settings
# backend/src/main.ts should have:
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});

# Restart backend
cd backend
pnpm dev
```

### Issue 2: Wrong API URL
**Symptoms:**
- Network requests go to wrong URL
- 404 errors in console

**Solution:**
```bash
# Check frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001

# Restart frontend (IMPORTANT!)
cd frontend
# Kill the process (Ctrl+C)
pnpm dev
```

### Issue 3: Frontend Not Restarted
**Symptoms:**
- Changes not reflected
- Old code still running

**Solution:**
```bash
cd frontend
# Kill the process (Ctrl+C)
pnpm dev
```

### Issue 4: No Data in Database
**Symptoms:**
- API returns empty array
- `{"data":[],"meta":{...}}`

**Solution:**
```bash
cd backend
# Run seed script
pnpm prisma db seed

# Or reset database
pnpm prisma migrate reset
```

### Issue 5: React Query Cache Issue
**Symptoms:**
- Data was working, now not loading
- Stale data showing

**Solution:**
1. Open React Query Devtools
2. Click "Clear Cache" button
3. Or hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### Issue 6: Port Already in Use
**Symptoms:**
- `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

## Step-by-Step Debugging

### Step 1: Verify Backend
```bash
# Test trending books endpoint
curl 'http://localhost:3001/books?page=1&limit=5&sortBy=createdAt&sortOrder=desc'

# Test bestsellers endpoint
curl 'http://localhost:3001/books?page=1&limit=4&sortBy=price&sortOrder=desc'

# Should return JSON with books
```

### Step 2: Check Frontend Environment
```bash
cd frontend
cat .env.local

# Should show:
# NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 3: Restart Everything
```bash
# Terminal 1: Backend
cd backend
pnpm dev

# Terminal 2: Frontend
cd frontend
pnpm dev
```

### Step 4: Check Browser
1. Open http://localhost:3000
2. Open DevTools (F12)
3. Go to Console tab
4. Look for "=== API DEBUG INFO ===" logs
5. Check for errors

### Step 5: Check Network Tab
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to `localhost:3001/books`
4. Click on request to see:
   - Status code (should be 200)
   - Response data
   - Request headers

## Debug Component

A debug component has been added to the homepage (bottom-left corner) showing:
- ✅ Success: Data loaded
- ⏳ Loading: Fetching data
- ❌ Error: Failed to load

Check this component for real-time status.

## React Query Devtools

The devtools show:
- **Fresh** (green): Data is cached and fresh
- **Fetching** (blue): Currently loading
- **Stale** (yellow): Data is cached but stale
- **Inactive** (gray): Query not currently in use
- **Error** (red): Failed to fetch

## Common Error Messages

### "Network Error"
- Backend not running
- Wrong API URL
- CORS issue

### "Request failed with status code 404"
- Wrong endpoint URL
- Backend route not found

### "Request failed with status code 500"
- Backend error
- Check backend console logs

### "Failed to fetch"
- Network issue
- Backend not accessible
- CORS blocking request

## Manual Test

Create a test file to verify API:

```typescript
// frontend/test-api.ts
import axios from 'axios';

async function testAPI() {
  try {
    const response = await axios.get('http://localhost:3001/books', {
      params: {
        page: 1,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
    });
    console.log('✅ API Working!', response.data);
  } catch (error) {
    console.error('❌ API Error:', error);
  }
}

testAPI();
```

Run with:
```bash
npx ts-node test-api.ts
```

## Still Not Working?

1. **Clear all caches:**
   ```bash
   # Frontend
   cd frontend
   rm -rf .next
   rm -rf node_modules/.cache
   pnpm dev
   ```

2. **Check backend logs:**
   - Look for errors in backend terminal
   - Check if requests are reaching backend

3. **Try incognito mode:**
   - Rules out browser extension issues
   - Fresh cache

4. **Check firewall:**
   - Ensure ports 3000 and 3001 are not blocked

5. **Reinstall dependencies:**
   ```bash
   cd frontend
   rm -rf node_modules
   pnpm install
   pnpm dev
   ```

## Success Indicators

When everything is working:
- ✅ Backend console shows: "Application is running on: http://localhost:3001"
- ✅ Frontend console shows: "=== API DEBUG INFO ===" with data
- ✅ Homepage displays book cards
- ✅ React Query Devtools shows green "success" status
- ✅ Network tab shows 200 OK responses

## Need More Help?

Check these files:
- `frontend/src/lib/api/client.ts` - API configuration
- `frontend/src/lib/hooks/use-books.ts` - React Query hooks
- `frontend/src/components/providers.tsx` - Query client setup
- `backend/src/main.ts` - CORS and server config
