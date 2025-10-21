# SQL Execution Guide for Supabase

## 🚨 Critical Steps to Fix Search Results

You need to execute these SQL scripts in Supabase to fix the issues:

### Step 1: Fix RLS Policies (Allows session creation)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Navigate to your project
   - Click on "SQL Editor" in the left sidebar

2. **Execute RLS Script**
   - Copy the contents of `configure-user-sessions-rls.sql`
   - Paste into SQL Editor
   - Click "Run" button
   - Should see success message

3. **Verify RLS Policies**
   - After execution, you should see 3 policies listed
   - Go to Table Editor → user_sessions → RLS policies
   - Should see 3 policies instead of red error

### Step 2: Check Current Function (Optional but recommended)

1. **Execute Check Script**
   - Copy contents of `check-match-function.sql`
   - Paste into SQL Editor
   - Click "Run"
   - This will show current function parameters

### Step 3: Update match_sketches Function (Critical for 15 results)

1. **Execute Update Script**
   - Copy contents of `update-match-function-v2.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Should see success message

2. **Verify Function Update**
   - The function should now have DEFAULT 15 instead of 6
   - This will make API return 15 sketches instead of 4

## 🔄 After SQL Execution

### Deploy Backend to Vercel

**Option A: Via Vercel Dashboard (Recommended)**
1. Open https://vercel.com/maxims-projects-92fd3574/backend
2. Click "..." menu on latest deployment
3. Select "Redeploy"
4. Wait for deployment to complete
5. Copy the new deployment URL

**Option B: Via Git (If connected)**
1. Push changes to GitHub repository
2. Vercel will auto-deploy
3. Wait for deployment notification

### Update Frontend Config

1. **Update API URL**
   - Open `Prelude/config.js`
   - Replace `window.VIBECODING_API_URL` with new Vercel URL
   - Save and upload to hosting

## 🧪 Testing Checklist

After completing all steps:

### ✅ Test 1: Sessions Are Created
1. Make a search request from frontend
2. Check Supabase `user_sessions` table
3. Should see new session with all fields populated
4. `generated_prompt` should contain "animal" keyword

### ✅ Test 2: 15 Sketches Returned
1. Check browser console for API response
2. Should see `count: 15` or close to it
3. Should see different sketch IDs, not just 4 same ones

### ✅ Test 3: Search Diversity
1. Search with "animal" → should return animal sketches first
2. Search with different parameters → should get different results
3. Check that `prompt` includes all user selections

## 🚨 Expected Results

After completing all steps:
- ✅ Sessions are created securely in `user_sessions` table
- ✅ API returns 10-15 sketches instead of 4
- ✅ Search results are diverse and relevant
- ✅ Prompt includes all user selections including "animal" keyword
- ✅ System ready for demo tomorrow

## 📞 If Issues Persist

If you still see only 4 sketches after completing all steps:

1. **Check Vercel Logs**
   - Go to Vercel dashboard → Functions → View logs
   - Look for any errors in the search-sketches function

2. **Verify Function Parameters**
   - Run the check script again
   - Ensure match_count DEFAULT is 15

3. **Clear Browser Cache**
   - Hard refresh (Ctrl+Shift+R)
   - Or test in incognito mode

## 🎯 Quick Reference

**Files to execute in order:**
1. `configure-user-sessions-rls.sql` (Fix session creation)
2. `update-match-function-v2.sql` (Fix 15 sketches)

**Files to update after deployment:**
1. `Prelude/config.js` (Update API URL)

**Files already updated:**
1. `backend/app/api/search-sketches/route.js` (Added logging, increased limit)
2. `backend/lib/supabase.js` (Increased default limit)
3. `Prelude/main.js` (Fixed data sending)
4. `Prelude/index.html` (Updated cache version)
