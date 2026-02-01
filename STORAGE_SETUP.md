# Supabase Storage Bucket Setup Guide

## The Problem
You're getting a "Bucket not found" error because the `lab-results` storage bucket hasn't been created in your Supabase project yet.

## Solution: Create the Storage Bucket

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project (Guardian HMS)

### Step 2: Create Storage Bucket
1. Click on **Storage** in the left sidebar
2. Click **New bucket** button
3. Fill in the details:
   - **Name**: `lab-results`
   - **Public bucket**: ✅ Check this box (so patients can view/download files)
   - **File size limit**: 50MB (or your preferred limit)
4. Click **Create bucket**

### Step 3: Set Bucket Policies
After creating the bucket, you need to set up access policies:

1. Click on the `lab-results` bucket
2. Go to **Policies** tab
3. Click **New policy**

#### Policy 1: Allow Authenticated Users to Upload
- **Policy name**: `Doctors can upload files`
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **Policy definition**:
```sql
(bucket_id = 'lab-results'::text) AND (auth.role() = 'authenticated'::text)
```

#### Policy 2: Allow Public Read Access
- **Policy name**: `Public can view files`
- **Allowed operation**: SELECT
- **Target roles**: authenticated, anon
- **Policy definition**:
```sql
(bucket_id = 'lab-results'::text)
```

### Step 4: Test the Upload
1. Go back to your app at http://localhost:3000
2. Navigate to `/doctor/labs`
3. Try uploading a lab result
4. The file should now upload successfully!

## Verification
After setup, you should be able to:
- ✅ Upload PDF and image files from doctor's page
- ✅ View files from patient's page
- ✅ Download files from both pages

## Troubleshooting

### Still getting "Bucket not found"?
- Make sure the bucket name is exactly `lab-results` (with hyphen, not underscore)
- Verify you're in the correct Supabase project
- Check that the bucket is marked as **Public**

### Files upload but can't be viewed?
- Check the bucket policies are set correctly
- Make sure "Public bucket" is enabled

### Need Help?
The bucket creation SQL is in `supabase/lab_results_schema.sql` lines 89-122, but it's easier to create it through the dashboard UI.
