# GitHub Security Checklist ✅

**Before pushing to GitHub, ensure these files are NOT committed:**

## 🔒 Files That Should NEVER Be Committed

### ✅ Already Gitignored (Safe)
- ✅ `.env.local` - Contains real AWS credentials
- ✅ `.env.aws` - Contains real AWS resource IDs
- ✅ `.env.production` - Production environment secrets
- ✅ `.env.staging` - Staging environment secrets
- ✅ `terraform.tfvars` - Contains environment-specific values
- ✅ `*.tfstate` - Terraform state (contains sensitive data)
- ✅ `.terraform/` - Terraform plugins
- ✅ `*.tfplan` - Terraform execution plans
- ✅ `backend/**/*.zip` - Lambda deployment packages
- ✅ `.aws/` - AWS credentials directory

### ⚠️ Files to Delete Before Committing
These contain your real AWS Account ID and resource IDs:

```bash
# Delete these files (they contain real AWS IDs)
rm AWS_DEPLOYMENT_STATUS.md
rm FRONTEND_AWS_TESTING.md
rm QUICK_AWS_DEPLOYMENT.md

# Use the template versions instead
# AWS_DEPLOYMENT_STATUS_TEMPLATE.md
```

---

## 🧹 Cleanup Commands

Run these before your first push:

```bash
# Remove files with sensitive data
git rm --cached AWS_DEPLOYMENT_STATUS.md
git rm --cached FRONTEND_AWS_TESTING.md
git rm --cached QUICK_AWS_DEPLOYMENT.md

# Remove Lambda packages
git rm --cached backend/iot/checkins-processor/function.zip
git rm --cached backend/iot/vitals-processor/function.zip
git rm --cached backend/aggregator/function.zip
git rm --cached backend/alerts/alert-processor/function.zip
git rm --cached backend/analytics/habit-analyzer/function.zip

# Remove terraform plan
git rm --cached infrastructure/deployment.tfplan

# Add the updated .gitignore
git add .gitignore

# Commit the security changes
git commit -m "Security: Remove sensitive files and update .gitignore"
```

---

## 🔍 What's Safe to Commit

### ✅ Safe Files
- ✅ Source code (`.js`, `.ts`, `.tsx`, `.py`)
- ✅ Configuration templates (`.env.example`, `example.tfvars`)
- ✅ Documentation without real IDs (`README.md`, `*_TEMPLATE.md`)
- ✅ Infrastructure code (`*.tf` files)
- ✅ Package files (`package.json`, `requirements.txt`)
- ✅ Scripts (`*.sh`, `*.ps1`)
- ✅ `RESUME_WORK_GUIDE.md` (contains instructions, not secrets)

### ⚠️ Review Before Committing
- ⚠️ Check all `.md` files for AWS Account ID
- ⚠️ Check all `.md` files for real API Gateway URLs
- ⚠️ Check all `.md` files for Cognito Pool IDs
- ⚠️ Check all `.md` files for IoT endpoints

---

## 🔐 Sensitive Information to Look For

When reviewing files, search for these patterns:

1. **AWS Account ID**: `378664616416` (12-digit number)
2. **API Gateway IDs**: `zm434z4dck` (10-character alphanumeric)
3. **Cognito Pool IDs**: `us-east-1_dfdsulC89` (format: `region_XXXXXXXXX`)
4. **Cognito Client IDs**: `172fnjmoiuf8papjikgn5db781` (26-character alphanumeric)
5. **IoT Endpoints**: `a7jyq7fkp5dex-ats.iot.us-east-1.amazonaws.com`
6. **SNS ARNs**: `arn:aws:sns:us-east-1:378664616416:*`
7. **Email Addresses**: Your actual email in SES config

---

## 🛡️ How to Find Sensitive Data

```bash
# Search for AWS Account ID in all files
grep -r "378664616416" .

# Search for Cognito Pool ID
grep -r "us-east-1_dfdsulC89" .

# Search for API Gateway ID
grep -r "zm434z4dck" .

# Search for IoT endpoint
grep -r "a7jyq7fkp5dex" .
```

If any of these return results in files you're about to commit, **sanitize them first!**

---

## 📝 Files That Need Sanitization

### `infrastructure/providers.tf`
✅ Safe - No sensitive data, bucket name uses variable

### `RESUME_WORK_GUIDE.md`
⚠️ **CONTAINS SENSITIVE DATA** - Replace with sanitized version or use template

**Fix:**
```bash
# Replace AWS Account ID with placeholder
sed -i 's/378664616416/YOUR_AWS_ACCOUNT_ID/g' RESUME_WORK_GUIDE.md

# Replace Cognito Pool ID
sed -i 's/us-east-1_dfdsulC89/us-east-1_XXXXXXXXX/g' RESUME_WORK_GUIDE.md

# Replace Cognito Client ID
sed -i 's/172fnjmoiuf8papjikgn5db781/XXXXXXXXXXXXXXXXXXXXXXXXXX/g' RESUME_WORK_GUIDE.md

# Replace API Gateway ID
sed -i 's/zm434z4dck/XXXXXXXXXX/g' RESUME_WORK_GUIDE.md

# Replace IoT endpoint
sed -i 's/a7jyq7fkp5dex/XXXXXXXXXXXXXX/g' RESUME_WORK_GUIDE.md
```

---

## 🚀 Safe Push Checklist

Before running `git push`:

- [ ] Run `git status` and review all files to be committed
- [ ] Check that `.env.local`, `.env.aws`, `.env.production` are NOT in the list
- [ ] Check that `terraform.tfvars` is NOT in the list
- [ ] Check that `.tfstate` files are NOT in the list
- [ ] Check that Lambda `.zip` files are NOT in the list
- [ ] Search for your AWS Account ID: `grep -r "378664616416" .`
- [ ] Search for Cognito IDs: `grep -r "us-east-1_dfdsulC89" .`
- [ ] Search for API Gateway IDs: `grep -r "zm434z4dck" .`
- [ ] Review all `.md` files for real resource IDs
- [ ] Ensure `.gitignore` is updated and committed

---

## 🔄 What to Do If You Accidentally Commit Secrets

### If you haven't pushed yet:
```bash
# Remove the file from the last commit
git reset HEAD~1 -- path/to/sensitive/file.txt

# Remove sensitive content
# Edit the file or delete it

# Commit again
git add .
git commit -m "Fix: Remove sensitive data"
```

### If you've already pushed:
1. **Immediately rotate all credentials**
   - Generate new AWS access keys
   - Delete the exposed keys in AWS Console
   - Update Cognito clients if exposed

2. **Remove from Git history**
   ```bash
   # Use BFG Repo Cleaner or git filter-branch
   # This rewrites history - coordinate with team!
   bfg --delete-files sensitive-file.txt
   git push --force
   ```

3. **Consider the repo compromised**
   - If AWS keys were exposed, create a new AWS account
   - If Cognito IDs were exposed, they're less critical but rotate them

---

## ✅ Quick Verification Script

Run this before pushing:

```bash
#!/bin/bash
echo "🔍 Checking for sensitive data..."

# Check for AWS Account ID
if git diff --cached | grep -q "378664616416"; then
    echo "❌ Found AWS Account ID in staged files!"
    exit 1
fi

# Check for .env files
if git diff --cached --name-only | grep -q "\.env"; then
    echo "❌ Found .env file in staged files!"
    exit 1
fi

# Check for tfstate
if git diff --cached --name-only | grep -q "\.tfstate"; then
    echo "❌ Found tfstate file in staged files!"
    exit 1
fi

# Check for zip files
if git diff --cached --name-only | grep -q "\.zip"; then
    echo "❌ Found .zip file in staged files!"
    exit 1
fi

echo "✅ No obvious sensitive data found!"
echo "⚠️ Manually review all .md files before pushing!"
```

---

## 📚 Additional Resources

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [AWS: What to do if you expose credentials](https://aws.amazon.com/blogs/security/what-to-do-if-you-inadvertently-expose-an-aws-access-key/)

---

## 🎯 Summary

**Critical Files to Keep Private:**
1. `.env*` files (except `.env.example`)
2. `terraform.tfvars`
3. `*.tfstate` files
4. Lambda `.zip` packages
5. Any file with AWS Account ID or resource IDs

**Safe to Share:**
1. Source code
2. Terraform `.tf` modules
3. Documentation templates
4. `RESUME_WORK_GUIDE.md` (after sanitizing)

**When in doubt, DON'T commit it!**

You can always add files later after reviewing them. It's much harder to remove them after pushing.

---

**Last Updated**: September 30, 2025
**Status**: ✅ Ready for GitHub with proper gitignore
