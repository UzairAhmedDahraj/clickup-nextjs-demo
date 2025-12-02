# ClickUp-Style Task Management System

A full-featured task management application with MongoDB Atlas and Cloudinary integration.

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Add your MongoDB Atlas connection string
   - Add your Cloudinary credentials

3. **Run development server:**
```bash
npm run dev
```

4. **Open** [http://localhost:3000](http://localhost:3000)

## Features

- ✅ Create lists/projects with custom colors
- ✅ 9 custom field types (text, number, date, select, multi-select, checkbox, URL, priority, status)
- ✅ Full task CRUD with custom fields
- ✅ File attachments with Cloudinary
- ✅ Filtering and search
- ✅ Dark/light theme
- ✅ ClickUp-style table view

## Documentation

See [README_IMPLEMENTATION.md](./README_IMPLEMENTATION.md) for detailed documentation.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- MongoDB Atlas
- Cloudinary
- Tailwind CSS v4
- React Hook Form
- Zod validation
- Lucide Icons

## Environment Variables

Required in `.env.local`:

```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
