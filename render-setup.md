# Render Deployment Guide for TradeA+ NOWPayments Webhook

This guide will help you deploy your application to Render.com so you can receive NOWPayments IPN webhooks.

## Prerequisites

1. Create a [Render.com](https://render.com) account if you don't have one
2. Make sure your project is in a Git repository (GitHub, GitLab, or Bitbucket)

## GitHub Repository Setup

If you haven't uploaded your project to GitHub yet, follow these steps:

1. **Create a GitHub Account**: Sign up at [GitHub.com](https://github.com) if you don't have an account

2. **Create a New Repository**:
   - Go to [github.com/new](https://github.com/new)
   - Enter a repository name (e.g., "tradea-plus")
   - Set visibility (public or private)
   - Click "Create repository"

3. **Initialize Git in Your Project** (if not already done):
   ```bash
   cd c:\Users\Faisal\Downloads\tradea+\tradea+\tradea+
   git init
   ```

4. **Add Your Files to Git**:
   ```bash
   git add .
   ```

5. **Commit Your Files**:
   ```bash
   git commit -m "Initial commit of TradeA+ application"
   ```

6. **Link to Your GitHub Repository**:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/tradea-plus.git
   ```
   (Replace YOUR-USERNAME with your GitHub username and tradea-plus with your repository name)

7. **Push Your Code to GitHub**:
   ```bash
   git push -u origin main
   ```
   (If your default branch is "master" instead of "main", use "master" instead)

8. **Verify Upload**: Go to your GitHub repository URL to confirm your files are uploaded

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

Set the following environment variables:
- `NEXT_PUBLIC_API_URL`: Set to your Render app URL (available after first deployment)
- Add any Firebase or other service credentials needed

### 4. Deploy Your Application

1. Click **Create Web Service**
2. Render will automatically build and deploy your application
3. After the initial deployment, go back to environment variables and set `NEXT_PUBLIC_API_URL` to the deployed URL
4. Trigger a redeployment

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

### Webhook Not Receiving Data
1. Check Render logs for any errors
2. Ensure your Firebase credentials are properly configured
3. Verify the NOWPayments IPN URL is correct

### Security Considerations
For production, consider implementing:
1. Authentication for your webhook endpoint
2. IP allowlisting for NOWPayments servers
3. Signature verification for webhook payloads

## Render Auto-Deploys

Render automatically deploys when you push to your deployment branch. No need
to manually trigger builds after your initial setup.
