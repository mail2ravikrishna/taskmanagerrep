# Taskflow — Task Manager

A responsive task manager built with Next.js, React and TypeScript. It is ready to run locally and deploy to Vercel.

## Features

- Create, edit and delete tasks
- Set task start dates and due dates
- Track progress from 0–100%
- Statuses: Not started, In progress and Completed
- Priority levels: Low, Medium and High
- Dashboard counts for total, in-progress, completed and overdue tasks
- Views for All tasks, Today, Upcoming, Overdue and Completed
- Search tasks and filter by priority
- Responsive layout for desktop and mobile
- Browser `localStorage` persistence

## Requirements

- Node.js 18.18+ (Node.js 20 LTS recommended)
- npm
- A GitHub account
- A Vercel account

## Run locally

1. Unzip the project.
2. Open a terminal in the `task-manager-app` folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open http://localhost:3000.

## Deploy with GitHub + Vercel

1. Create a new repository on GitHub, for example `task-manager-app`.
2. From the project folder, run:

   ```bash
   git init
   git add .
   git commit -m "Initial task manager app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/task-manager-app.git
   git push -u origin main
   ```

3. Sign in to https://vercel.com and choose **Add New → Project**.
4. Import your `task-manager-app` GitHub repository.
5. Keep the detected framework as **Next.js** and click **Deploy**.
6. Vercel will build and publish the app. Future pushes to the connected branch trigger deployments automatically.

## Important data-storage note

This starter version saves tasks in the browser's `localStorage`. Data stays in the same browser profile on the same device. It is not shared across devices or users, and clearing browser data can remove saved tasks.

For a production version with sign-in, cloud database storage, multi-device sync, team collaboration and reliable reminders, connect a backend such as Supabase and add a notification service. Do not put database secrets in client-side code.

## Project structure

```text
task-manager-app/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── .gitignore
├── next-env.d.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Notes

- The dashboard starts with a few sample tasks so you can see how the interface works. You can edit or delete them.
- Dates are displayed using the browser's local date formatting.
- The app does not send email, push or background notifications in this MVP. Overdue and due-today tasks are highlighted when you open the app.
