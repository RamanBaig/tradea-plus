# Render Deployment Guide for TradeA+ NOWPayments Webhook

This guide will help you deploy your application to Render.com so you can receive NOWPayments IPN webhooks.

## Prerequisites

1. Create a [Render.com](https://render.com) account if you don't have one
2. Make sure your project is in a Git repository (GitHub, GitLab, or Bitbucket)

## Step-by-Step GitHub Upload Instructions

Here's a detailed walkthrough for uploading your project to GitHub:

### Step 1: Install Git (if not already installed)
1. Download Git from [git-scm.com](https://git-scm.com/downloads)
2. Install with default options
3. Verify installation by opening Command Prompt and typing `git --version`

### Step 2: Configure Git (first-time setup)
1. Open Command Prompt
2. Set your username: 
   ```
   git config --global user.name "Your Name"
   ```
3. Set your email:
   ```
   git config --global user.email "your.email@example.com"
   ```

### Step 3: Create a GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in the top-right corner, then "New repository"
3. Name your repository (e.g., "tradea-plus")
4. Choose visibility (Public or Private)
5. Do NOT initialize with README, .gitignore, or license
6. Click "Create repository"
7. Keep this page open as you'll need the repository URL

### Step 4: Navigate to Your Project
1. Open Command Prompt
2. Navigate to your project folder:
   ```
   cd c:\Users\Faisal\Downloads\tradea+\tradea+\tradea+
   ```

### Step 5: Initialize Git Repository
1. Initialize a new Git repository:
   ```
   git init
   ```

### Step 6: Create .gitignore File
1. Create a .gitignore file in your project root to exclude unnecessary files:
   ```
   echo node_modules > .gitignore
   echo .next >> .gitignore
   echo .env >> .gitignore
   echo .env.local >> .gitignore
   ```

### Step 7: Add Files to Git
1. Add all project files:
   ```
   git add .
   ```
2. Verify files are staged:
   ```
   git status
   ```

### Step 8: Make Your First Commit
1. Commit the files:
   ```
   git commit -m "Initial commit of TradeA+ application"
   ```

### Step 9: Link to GitHub
1. Add the remote repository URL (from Step 3):
   ```
   git remote add origin https://github.com/YOUR-USERNAME/tradea-plus.git
   ```
   (Replace YOUR-USERNAME with your GitHub username and tradea-plus with your repository name)

### Step 10: Push to GitHub
1. Push your code:
   ```
   git push -u origin master
   ```
   (If you get an error, try `git push -u origin main` instead)

2. If prompted, enter your GitHub username and password/token

### Step 11: Verify Upload
1. Go to your GitHub repository URL:
   ```
   https://github.com/YOUR-USERNAME/tradea-plus
   ```
2. Check that all your files are there

### Troubleshooting

#### If you get authentication errors:
1. GitHub no longer accepts passwords for Git operations
2. Create a Personal Access Token:
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token
   - Select repo scope
   - Copy the token
3. Use the token as your password when prompted

#### If you see "fatal: remote origin already exists":
1. Remove the existing remote:
   ```
   git remote remove origin
   ```
2. Then add the correct remote URL

#### If your push is rejected:
1. Try pulling first:
   ```
   git pull origin master --allow-unrelated-histories
   ```
2. Resolve any conflicts
3. Then push again:
   ```
   git push -u origin master
   ```

## Deployment Steps

### 1. Prepare Your Project

Make sure you have these files in your project:
- `package.json` with proper build and start scripts
- `.env.example` as a template for environment variables
- Optional: `render.yaml` for Infrastructure as Code setup

### 2. Create a New Web Service on Render

1. Log in to your Render dashboard
2. Click **New** and select **Web Service**
3. Connect your Git repository
4. Configure the service:
   - **Name**: tradea-plus (or your preferred name)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Region**: Choose closest to your users
   - **Branch**: main (or your deployment branch)
   - **Plan**: Free (or paid if you need more resources)

### 3. Environment Variables

Set the following environment variables during initial setup:
- `NODE_ENV`: Set to `production`
- Add all Firebase credentials needed for your application

**For the API URL, you have two options:**

#### Option 1: Two-step deployment (recommended for beginners)
1. First deploy without setting `NEXT_PUBLIC_API_URL`
2. After deployment completes, note your app URL (e.g., `https://tradea-plus.onrender.com`)
3. Go to the "Environment" tab in your service dashboard
4. Add `NEXT_PUBLIC_API_URL` with your app's URL
5. Click "Save Changes" and Render will automatically redeploy

#### Option 2: Predict your URL (faster deployment)
1. If you named your service "tradea-plus", your URL will be `https://tradea-plus.onrender.com`
2. Set `NEXT_PUBLIC_API_URL` to this predicted URL during initial setup
3. This avoids the need to redeploy, but requires you to name your service correctly

**Note:** If Render won't let you modify environment variables after starting deployment, you can still add them later through your service's dashboard under the "Environment" section.

### 4. Deploy Your Application

1. Click **Create Web Service**
2. Render will automatically build and deploy your application
3. Once deployment is complete, verify your service is running
4. If you need to update environment variables, use the "Environment" tab in your service settings

### 5. Configure NOWPayments Webhook

1. Go to your NOWPayments dashboard
2. Navigate to the IPN settings
3. Enter the webhook URL: `https://your-app-name.onrender.com/api/ipn/nowpayments`
4. Save the configuration

## Testing Your Webhook

1. Deploy your application to Render
2. Use the TradeA+ admin panel "Test Webhook" button
3. Check the Render logs to confirm the webhook was received
4. Verify the payment data appears in your Firebase database

## Troubleshooting

### Build Errors

#### Error: "sh: 1: vite: not found"
This error occurs because Vite isn't being found during the build process. Here's how to fix it:

1. **Update your package.json build command**:
   - Make sure Vite is in your dependencies, not just devDependencies
   - Add this to your package.json:
     ```json
     "dependencies": {
       // ...other dependencies
       "vite": "^4.0.0"  // use the version that matches your project
     }
     ```

2. **Update your build command in Render**:
   - Change to: `npm install && npm run build`
   - Or try: `npm install && npx vite build`

3. **Check your start script**:
   - Make sure it's not trying to use Vite in production mode
   - For Next.js apps, it should be: `next start`
   - For Vite apps, it should use the built files

4. **Alternative approach**:
   - Add a custom build script to your package.json:
     ```json
     "scripts": {
       "build": "npm install vite && vite build",
       // ...other scripts
     }
     ```

### Webhook Not Receiving Data
1. Check Render logs for any errors
2. Ensure your Firebase credentials are properly configured
3. Verify the NOWPayments IPN URL is correct

### Security Considerations
For production, consider implementing:
1. Authentication for your webhook endpoint
2. IP allowlisting for NOWPayments servers
3. Signature verification for webhook payloads

## Verifying Your Build Configuration

Before deploying, ensure your package.json has the correct scripts:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
```

For a Next.js application, these are the correct commands. If you're using Vite instead, use:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "start": "vite preview"
}
```

## Render Auto-Deploys

Render automatically deploys when you push to your deployment branch. No need
to manually trigger builds after your initial setup.
