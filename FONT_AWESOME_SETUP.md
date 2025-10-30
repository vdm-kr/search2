# Font Awesome Pro Setup Guide

## Setup with License Token

### Step 1: Get Your Font Awesome Pro License Token

1. Go to [https://fontawesome.com/account](https://fontawesome.com/account)
2. Sign in with your Font Awesome Pro account
3. Navigate to your account settings
4. Find the **"npm Token"** section (it may be under "Package Access" or "Tokens")
5. Copy your license token (it's a long string of characters like: `A1B2C3D4-E5F6-7890-ABCD-EF1234567890`)

### Step 2: Add Token to .npmrc File

**📍 Location:** Create/update the `.npmrc` file in the root of your project

1. Open the `.npmrc` file (it should already exist in the project root)
2. Replace `YOUR_LICENSE_TOKEN_HERE` with your actual license token from Font Awesome

**Example:**
```
@fortawesome:registry=https://npm.fontawesome.com/
//npm.fontawesome.com/:_authToken=A1B2C3D4-E5F6-7890-ABCD-EF1234567890
```

⚠️ **Important:** The `.npmrc` file is already in `.gitignore` to prevent committing your token to version control.

### Step 3: Install Font Awesome Pro Packages

After adding your token to `.npmrc`, run these commands in your terminal:

```bash
npm install @fortawesome/fontawesome-pro
npm install @fortawesome/react-fontawesome
npm install @fortawesome/pro-solid-svg-icons
npm install @fortawesome/pro-regular-svg-icons
npm install @fortawesome/pro-light-svg-icons
```

### Step 4: Import Font Awesome Styles

Add this import to your `src/index.css` file (at the top, before other imports):

```css
@import '@fortawesome/fontawesome-pro/css/all.css';
```

Or alternatively, import in your `src/main.tsx`:

```typescript
import '@fortawesome/fontawesome-pro/css/all.css'
```

## Usage Examples

### Method 1: Using CSS Classes (Recommended for this project)

After installation, you can use Font Awesome icons directly via CSS classes:

```tsx
<i className="fas fa-check"></i>
<i className="far fa-circle"></i>
<i className="fal fa-arrow-left"></i>
<i className="fas fa-chevron-right"></i>
```

### Method 2: Using React FontAwesome Component

```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faChevronRight } from '@fortawesome/pro-solid-svg-icons'

<FontAwesomeIcon icon={faCheck} className="text-indigo-600" />
<FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
```

## Icon Style Prefixes

- `fas` - Solid (Pro)
- `far` - Regular (Pro)  
- `fal` - Light (Pro)
- `fad` - Duotone (Pro)

## Common Icons Used in This Project

Based on the Figma designs:
- `fas fa-check` - Checkmark (✓)
- `fas fa-chevron-right` - Right arrow (›)
- `fas fa-chevron-left` - Left arrow (‹)
- `fas fa-times` - Close/X (×)
- `fas fa-search` - Search (🔍)
- `fas fa-globe` - Globe (🌐)
- `fas fa-chevron-down` - Dropdown arrow (▼)
- `fas fa-star` - Star for popular badge (⭐)

## Troubleshooting

**If you get authentication errors:**
1. Double-check your license token in `.npmrc` - make sure it matches exactly
2. Ensure there are no extra spaces, quotes, or newlines around the token
3. Verify the token starts with `@fortawesome:registry=...` on the first line
4. Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
5. Verify your Font Awesome Pro subscription is active at [fontawesome.com/account](https://fontawesome.com/account)

**If icons don't appear:**
1. Make sure you've imported the CSS file (`@import '@fortawesome/fontawesome-pro/css/all.css'`)
2. Restart your dev server after installation
3. Check browser console for any errors
4. Verify the correct style prefix (fas, far, fal, etc.)

## Summary

1. ✅ Get your npm token from [fontawesome.com/account](https://fontawesome.com/account)
2. ✅ Add it to `.npmrc` file (replace `YOUR_LICENSE_TOKEN_HERE`)
3. ✅ Run `npm install` commands listed above
4. ✅ Import CSS in `src/index.css` or `src/main.tsx`
5. ✅ Use icons with `<i className="fas fa-icon-name"></i>`
