# Required Changes for PDF Generation in Docker

## Overview
This document outlines the changes required to fix PDF generation issues when running the IDURAR ERP CRM backend service in Docker containers, particularly on ARM64 architecture (Apple Silicon, AWS Graviton, etc.).

## Problem Statement
When running the backend service in Docker, the following error occurred:
```
html-pdf: Failed to load PhantomJS module. You have to set the path to the PhantomJS binary using 'options.phantomPath'
```

### Root Causes
1. **PhantomJS is deprecated** - The PhantomJS project was discontinued in 2018
2. **Architecture incompatibility** - `phantomjs-prebuilt` npm package doesn't support ARM64 architecture
3. **Missing system dependencies** - PhantomJS requires specific system libraries that weren't available in the Alpine Linux container
4. **html-pdf is deprecated** - The `html-pdf` package relies on PhantomJS and is no longer maintained

## Solution: Migrate to Puppeteer

We replaced the deprecated `html-pdf` + `phantomjs-prebuilt` stack with Puppeteer, which is:
- Actively maintained by Google
- Supports modern architectures including ARM64
- More reliable and feature-rich
- Better Docker support

## Changes Made

### 1. Package Dependencies Update

**File:** `backend/package.json`

**Before:**
```json
"html-pdf": "^3.0.1",
"phantomjs-prebuilt": "^2.1.16",
```

**After:**
```json
"puppeteer": "^21.6.0",
```

**Why:** Puppeteer is a modern headless browser automation tool that includes PDF generation capabilities and is actively maintained.

### 2. PDF Controller Refactoring

**File:** `backend/src/controllers/pdfController/index.js`

**Changes:**
- Replaced `require('html-pdf')` with `require('puppeteer')`
- Rewrote PDF generation logic to use Puppeteer's API
- Added proper browser lifecycle management (launch/close)
- Configured Puppeteer for Docker environment with necessary flags

**Key differences:**
```javascript
// Old approach with html-pdf
pdf.create(htmlContent, options).toFile(targetLocation, callback);

// New approach with Puppeteer
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setContent(htmlContent);
await page.pdf({ path: targetLocation, format: 'A4' });
await browser.close();
```

**Why:** Puppeteer provides a more reliable and modern API for PDF generation with better error handling and resource management.

### 3. Dockerfile Optimization

**File:** `backend/Dockerfile`

**Changes:**
- Removed PhantomJS-specific dependencies and build tools (python3, make, g++, git)
- Added Puppeteer-specific environment variables
- Configured to use system-installed Chromium instead of downloading it

**Key additions:**
```dockerfile
# Tell Puppeteer to use installed Chromium package
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

**Why:** 
- Reduces Docker image size by ~400MB by not downloading Chromium twice
- Ensures compatibility with ARM64 architecture
- Uses Alpine's optimized Chromium package

### 4. Docker Compose Environment

**File:** `docker-compose.yml`

**Added:**
```yaml
environment:
  DOCKER_ENV: true
```

**Why:** Allows the application to detect when running in Docker and apply appropriate configurations.

## Benefits of These Changes

1. **Cross-platform compatibility** - Works on both x86_64 and ARM64 architectures
2. **Smaller Docker images** - No need for build tools or duplicate Chromium installations
3. **Better performance** - Puppeteer is faster and more efficient than PhantomJS
4. **Future-proof** - Using actively maintained libraries
5. **Enhanced security** - Puppeteer receives regular security updates

## Migration Notes

### For Developers
- The PDF generation API remains the same - no changes needed in calling code
- PDF output quality and formatting are preserved
- All existing PDF templates (Pug files) work without modification

### For DevOps
- First build after these changes will take longer due to dependency updates
- Ensure Docker has sufficient memory (at least 2GB) for Puppeteer operations
- The `--no-sandbox` flag is required in Docker but should not be used in production without proper security measures

## Rollback Plan

If issues arise, you can rollback by:
1. Reverting the changes in `package.json`
2. Reverting the changes in `pdfController/index.js`
3. Reverting the `Dockerfile`
4. Running `npm install` locally to regenerate `package-lock.json`
5. Rebuilding Docker images

## Testing Recommendations

After implementing these changes:
1. Test PDF generation for all document types (invoice, quote, payment, offer)
2. Verify PDF formatting matches previous output
3. Test on both AMD64 and ARM64 architectures if possible
4. Monitor memory usage during PDF generation
5. Verify no security warnings in production logs

## Additional Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Puppeteer Docker Guide](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker)
- [Migration from PhantomJS](https://github.com/puppeteer/puppeteer/blob/main/docs/migrating-from-phantomjs.md)