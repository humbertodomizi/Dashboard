# Project Dashboard & API

This repository contains a full-stack application with a **Vue 3 Dashboard** frontend and a **Node.js/Express** backend API.

## Project Structure

-   **`/dashboard`**: Frontend application built with Vue 3, Vite, PrimeVue, and Tailwind CSS.
-   **`/api`**: Backend REST API built with Node.js, Express, Mongoose (MongoDB), and Zod.

## Prerequisites

-   **Node.js** (Latest LTS recommended)
-   **pnpm** (Package manager)
-   **MongoDB** (Must be running locally or accessible via connection string)

## Installation

1.  **Install Root Dependencies** (for Husky):
    ```bash
    pnpm install
    ```

2.  **Install Dashboard Dependencies**:
    ```bash
    cd dashboard
    pnpm install
    cd ..
    ```

3.  **Install API Dependencies**:
    ```bash
    cd api
    pnpm install
    cd ..
    ```

## Database Setup

Before running the API, make sure your MongoDB instance is running. You can populate the database with initial data (users and posts) using the seed script.

```bash
cd api
pnpm run seed
```

## Running the Project

### API (Backend)

Start the backend server (default port: 3000):

```bash
cd api
pnpm run dev
```
*Runs with `--watch` mode for development.*

### Dashboard (Frontend)

Start the frontend development server:

```bash
cd dashboard
pnpm run dev
```

## Features

-   **Users Management**: Create, Read, Edit, Delete users.
-   **Posts Management**: Create, Read, Edit, Delete posts with Rich Text Editor.
-   **Statistics**: Dashboard charts for User and Post analytics.
-   **Validation**: Robust form validation (VeeValidate/Yup on frontend, Zod on backend).
-   **UI**: PrimeVue components with Tailwind CSS styling.

## Git Hooks (Husky)

This project uses **Husky** to ensure code quality before commits. The `pre-commit` hook performs the following:

1.  **Dashboard**: Runs Prettier formatting and builds the project to check for errors.
2.  **API**: Runs Prettier formatting and checks syntax.

If any of these steps fail, the commit will be aborted.

