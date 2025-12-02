# ClickUp-Style Task Management System

A simplified ClickUp-style task management application built with **Next.js 16**, **MongoDB Atlas**, **TypeScript**, and **Tailwind CSS**.

## 🚀 Features

### ✅ Core Functionality
- **Workspace Management**: Single workspace with auto-creation (scalable for multi-workspace)
- **Lists (Projects)**: Create, edit, delete lists with custom colors and icons
- **Custom Fields**: 9 field types support
  - Text, Number, Date
  - Select (Dropdown), Multi-Select
  - Checkbox, URL
  - Priority (Urgent/High/Normal/Low)
  - Status (To-Do/In Progress/In Review/Done/Blocked)
- **Task Management**:
  - Create, edit, delete tasks
  - Built-in fields: Name, Description, Status, Priority, Due Date
  - Dynamic custom field values
  - Quick inline editing in table view
- **File Attachments**: Upload files to Cloudinary (10MB limit)
- **Filtering & Search**: Filter by status, priority, search tasks
- **Dark/Light Theme**: Full theme support with persistence

### 🎨 UI Features
- ClickUp-style table view
- Collapsible sidebar navigation
- Modal-based forms
- Toast notifications
- Loading states
- Responsive design

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd clickup_demo
npm install
```

### 2. Configure MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 free tier)
3. Create a database user with read/write permissions
4. Get your connection string (should look like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/clickup_demo?retryWrites=true&w=majority
   ```

### 3. Configure Cloudinary

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 4. Setup Environment Variables

Update `.env.local` with your credentials:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clickup_demo?retryWrites=true&w=majority

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Default IDs (keep as-is for now)
DEFAULT_WORKSPACE_ID=default-workspace
DEFAULT_USER_ID=default-user
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
clickup_demo/
├── app/
│   ├── (dashboard)/          # Dashboard layout group
│   │   ├── layout.tsx        # Main app layout with sidebar
│   │   ├── dashboard/        # Home/empty state
│   │   └── lists/[id]/       # List detail page
│   ├── api/                  # API routes
│   │   ├── workspace/        # Workspace endpoints
│   │   ├── lists/            # Lists CRUD
│   │   │   └── [listId]/
│   │   │       ├── fields/   # Custom fields CRUD
│   │   │       └── tasks/    # Tasks CRUD
│   │   └── tasks/[taskId]/
│   │       └── attachments/  # Attachments upload/delete
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home redirect
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── modal.tsx
│   │   └── card.tsx
│   ├── sidebar.tsx           # Sidebar navigation
│   ├── task-table.tsx        # Task table view
│   ├── task-modal.tsx        # Task create/edit modal
│   ├── custom-fields-modal.tsx
│   ├── attachment-upload.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── models/               # Mongoose models
│   │   ├── User.ts
│   │   ├── Workspace.ts
│   │   ├── List.ts
│   │   ├── CustomFieldDefinition.ts
│   │   ├── Task.ts
│   │   └── Attachment.ts
│   ├── mongodb.ts            # Database connection
│   ├── cloudinary.ts         # Cloudinary utilities
│   └── utils/
│       └── cn.ts             # className utility
├── types/
│   └── index.ts              # TypeScript types
└── .env.local                # Environment variables
```

## 🔑 Key Technical Decisions

### Architecture
- **App Router**: Using Next.js 16 App Router with React Server Components
- **Route Groups**: `(dashboard)` group for authenticated layout
- **API Routes**: RESTful API with proper error handling

### Database Design
- **Scalable Schema**: All models include `workspaceId` and `userId` for future multi-tenancy
- **Dynamic Custom Fields**: Tasks store custom field values as flexible array
- **Proper Indexing**: Optimized queries with compound indexes

### State Management
- **Client Components**: Using React hooks for local state
- **Server Actions**: Not used (pure REST API approach)
- **Optimistic Updates**: Quick inline editing with API sync

### Styling
- **Tailwind CSS v4**: Latest version with inline theme config
- **Dark Mode**: Using `next-themes` with system preference detection
- **Responsive**: Mobile-first design principles

## 🎯 API Endpoints

### Workspace
- `GET /api/workspace` - Get or create default workspace
- `PUT /api/workspace` - Update workspace settings

### Lists
- `GET /api/lists` - Get all lists
- `POST /api/lists` - Create list
- `GET /api/lists/[id]` - Get list
- `PUT /api/lists/[id]` - Update list
- `DELETE /api/lists/[id]` - Delete list (cascades)

### Custom Fields
- `GET /api/lists/[listId]/fields` - Get custom fields
- `POST /api/lists/[listId]/fields` - Create field
- `PUT /api/lists/[listId]/fields/[fieldId]` - Update field
- `DELETE /api/lists/[listId]/fields/[fieldId]` - Delete field

### Tasks
- `GET /api/lists/[listId]/tasks` - Get tasks (with filters)
- `POST /api/lists/[listId]/tasks` - Create task
- `GET /api/lists/[listId]/tasks/[taskId]` - Get task
- `PUT /api/lists/[listId]/tasks/[taskId]` - Update task
- `DELETE /api/lists/[listId]/tasks/[taskId]` - Delete task

### Attachments
- `GET /api/tasks/[taskId]/attachments` - Get attachments
- `POST /api/tasks/[taskId]/attachments` - Upload file
- `DELETE /api/tasks/[taskId]/attachments/[id]` - Delete file

## 🔮 Future Enhancements

### Not Implemented (Out of Scope)
- **Drag & Drop Reordering**: Task/List reordering with @dnd-kit
- **Real Authentication**: Currently uses hardcoded default user
- **User Management**: Multi-user support
- **Real-time Updates**: WebSocket/SSE for live collaboration
- **Comments/Activity**: Task comments and activity log
- **Board View**: Kanban board as alternative to table
- **Time Tracking**: Built-in time tracking
- **Notifications**: Email/push notifications
- **Bulk Operations**: Multi-select and bulk actions

### Easy to Add Later
- Authentication with NextAuth.js or Clerk
- Real-time with Pusher or Socket.io
- Email with Resend or SendGrid
- Export to CSV/PDF
- Keyboard shortcuts
- Advanced permissions

## 🐛 Known Limitations

- Single workspace only (no workspace switching UI)
- No user authentication (hardcoded default user)
- No real-time updates (requires manual refresh)
- File upload limited to 10MB
- No mobile drag-and-drop
- No offline support

## 📝 Development Notes

### Type Safety
- Full TypeScript coverage
- Mongoose schema types mapped to TypeScript interfaces
- API responses use generic `ApiResponse<T>` type

### Error Handling
- Try/catch blocks in all API routes
- Toast notifications for user feedback
- Console logging for debugging

### Performance
- MongoDB indexes on frequently queried fields
- Lean queries for better performance
- Proper pagination support (not implemented in UI yet)

## 🤝 Contributing

This is a demo project. Feel free to fork and extend!

## 📄 License

MIT License - feel free to use this code for your projects.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI inspired by [ClickUp](https://clickup.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ using Next.js 16 + MongoDB Atlas**
