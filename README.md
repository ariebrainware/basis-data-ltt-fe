# Next.js Project Setup and Explanation

This project was bootstrapp with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and uses the powerful framework [Next.js](https://nextjs.org) for building server-side rendered React applications. In addition to getting started quickly, this setup provides an optimized development experience with automatic hot-reloading and file-based routing.

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Clone the Repository

Clone the project to your local machine:

```bash
git clone https://github.com/ariebrainware/basis-data-ltt-fe.git
cd basis-data-ltt-fe
```

### 2. Install Dependencies

Install the project dependencies using your preferred package manager:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Start the Development Server

Run the development server to start the application:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### 4. Editing and Automatic Reload

The main page is located at `app/page.tsx`. Any changes you make will automatically reload the page, thanks to Next.js's hot-reload feature.

## Explanation of the Setup and Method

### Project Bootstrapping with create-next-app

- **Scaffolding**: The project was initialized using `create-next-app`, which sets up a minimal, yet functional, Next.js project with sensible defaults.
- **File-based Routing**: Next.js uses the file system to automatically build routes for your application, making it easy to manage and scale.
- **Optimized Fonts**: This project utilizes [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically load and optimize fonts like [Geist](https://vercel.com/font), ensuring performance and design consistency.

### Advanced Features

- **Server-Side Rendering (SSR)**: Next.js supports SSR, which can improve performance and SEO for your application.
- **Static Generation**: With static generation, pages can be pre-rendered at build time, reducing load times.
- **API Routes**: Next.js allows for the creation of backend API endpoints within the same project structure, facilitating a full-stack approach.

## Learn More

To dive deeper into Next.js and its capabilities, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs) – a comprehensive guide to all features and APIs.
- [Learn Next.js](https://nextjs.org/learn) – an interactive tutorial to guide you through core concepts.
- [Next.js GitHub Repository](https://github.com/vercel/next.js) – contribute to the source or report issues.

## Deploy on Vercel

Deploying your Next.js app is straightforward using [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). For detailed deployment instructions, refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
