# Prescription Creation Fix Guide

## Problem
Prescriptions are not being created when doctors submit the form.

## Solution Steps

### Step 1: Verify RLS Policies in Supabase

1. **Open Supabase Dashboard** → SQL Editor
2. **Run this verification script**: `supabase/verify_prescription_policies.sql`
3. **Check the output** - you should see 3 policies:
   - `Patients view own prescriptions`
   - `Doctors view all prescriptions`
   - `Doctors create prescriptions`

If policies are missing, the script will recreate them.

### Step 2: Test Prescription Creation

1. **Open your browser** and go to http://localhost:3000
2. **Log in as a doctor**
3. **Navigate to** `/doctor/prescriptions`
4. **Open Browser Console** (F12 or Right-click → Inspect → Console tab)
5. **Fill out the prescription form**:
   - Select a patient
   - Add at least one medication with all fields filled
   - Click "Send Prescription"

### Step 3: Check Console Logs

The updated code now logs detailed information:

```
Starting prescription submission...
Valid medications: [...]
Inserting prescription for patient: <patient-id>
Doctor ID: <doctor-id>
Medications: [...]
```

**If successful**, you'll see:
```
Prescription created successfully: [...]
✅ Prescription sent successfully to patient!
```

**If it fails**, you'll see the exact error:
```
Supabase error: { message: "...", details: "...", hint: "..." }
❌ Failed to send prescription.
```

### Step 4: Common Issues and Fixes

#### Issue: "new row violates row-level security policy"
**Fix**: Run `verify_prescription_policies.sql` to ensure RLS policies are correct

#### Issue: "null value in column doctor_id"
**Fix**: Make sure you're logged in as a doctor user

#### Issue: "relation prescriptions does not exist"
**Fix**: Run the main `schema.sql` to create the prescriptions table

#### Issue: "column medications does not exist"
**Fix**: Check that the prescriptions table has a `medications` column of type JSONB

### Step 5: Verify Patient Can See Prescription

1. **Log out** from doctor account
2. **Log in as the patient** you sent the prescription to
3. **Navigate to** `/patient/prescriptions`
4. **Check** if the prescription appears in the list

## What Changed

### Enhanced Error Logging
- Added console.log statements throughout the submission process
- Shows exact Supabase error messages with details and hints
- Displays all data being sent to the database

### Better User Feedback
- Success message: "✅ Prescription sent successfully to patient!"
- Detailed error alerts with full error information
- Form resets properly after successful submission

### Data Validation
- Validates patient selection
- Filters out incomplete medications
- Ensures at least one complete medication exists

## Testing Checklist

- [ ] RLS policies verified in Supabase
- [ ] Prescription form loads without errors
- [ ] Patient dropdown shows all patients
- [ ] Can add/remove medications
- [ ] Form validation works (shows alerts for missing fields)
- [ ] Prescription submits successfully
- [ ] Success message appears
- [ ] Form resets after submission
- [ ] Prescription appears in doctor's "Issued Prescriptions" list
- [ ] Prescription appears in patient's prescriptions page

## Need More Help?

If prescriptions still aren't working after following these steps:
1. Copy the **exact error message** from the browser console
2. Check the **Network tab** in browser dev tools for failed requests
3. Verify your **user role** is set to 'doctor' in the profiles table
