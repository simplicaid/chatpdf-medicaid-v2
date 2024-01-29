This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

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

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Libraries used

- [Shadcn](https://ui.shadcn.com/): _Build your component library_. Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable. Open Source.
- [Cleck](https://cleck.com/): _Authentication for the modern web_. Cleck is a modern authentication platform that allows you to add authentication to your app in minutes.
- [HyperColor](https://hypercolor.dev/): _Color palette generator_. Generate beautiful color palettes from any image.
- [lucide-react](https://lucide.dev/): _Simple icons for your project_. Lucide is a free, open-source icon set made for projects that need an icon system.
- [Neon](https://neon.tech): _The fastest way to build serverless apps_. Neon is a framework for building serverless PostGress with TypeScript.
- [Drizzle](https://orm.drizzle.team/) _The ORM for Supabase_. TypeScript ORM that lets us skip SQL and work directly with the Supabase API + has typing support. #TODO: Erase when switching to MongoDB.
- [ReactDropZone](https://react-dropzone.js.org/) _Simple drag and drop file upload_. A simple component that allows you to drag and drop files to upload.

## Tasks:

### DB:

- [x] Switch to MongoDB or AWS DynamoDB.
- [x] Decouple Dizzle when using MongoDB.

### FileUpload:

- [x] Accept multiple files
- [x] Accept multiple file types (images, docs)
- [x] Redesign Logic so it is displayed after filling initial medicaid quiz.
