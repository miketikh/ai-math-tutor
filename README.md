This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# AI Math Tutor

An AI-powered Socratic math tutoring application that helps students learn through guided questioning and problem-solving.

## Prerequisites

- Node.js 18+ installed
- An OpenAI API key (for GPT-4 Vision and GPT-4)

## Environment Setup

This application requires an OpenAI API key to function. Follow these steps to set up your environment:

### 1. Get an OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an OpenAI account
3. Click "Create new secret key"
4. Copy the key immediately (you won't be able to see it again)

### 2. Configure Local Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and replace the placeholder with your actual OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. Save the file

**Important Security Notes:**
- `.env.local` is gitignored and will NOT be committed to version control
- Never share your API key or commit it to a repository
- The API key is only accessible in server-side code (API routes, server components)
- Environment variables without the `NEXT_PUBLIC_` prefix are never exposed to the browser

## Getting Started

First, make sure you've completed the environment setup above. Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Configuring Environment Variables in Vercel

When deploying to Vercel, you need to configure environment variables in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add a new environment variable:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Your actual OpenAI API key (starting with `sk-`)
   - **Environments**: Select all environments (Production, Preview, Development) or as needed
4. Click **Save**
5. Redeploy your application for the changes to take effect

**Note**: Environment variables in Vercel are encrypted and securely stored. They are only accessible to your server-side code and never exposed to the client.

For more details, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) and [Vercel Environment Variables documentation](https://vercel.com/docs/projects/environment-variables).
