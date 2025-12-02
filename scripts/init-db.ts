/**
 * Database Initialization Script
 * Creates default workspace and user with valid MongoDB ObjectIds
 * Run this script to set up the initial database records
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// Define schemas inline to avoid issues with models
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: { type: String },
}, { timestamps: true });

const WorkspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, default: 'OWNER' },
    joinedAt: { type: Date, default: Date.now },
  }],
  settings: {
    defaultTaskStatus: { type: String, default: 'TODO' },
    defaultPriority: { type: String, default: 'NORMAL' },
  },
}, { timestamps: true });

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get or create models
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', WorkspaceSchema);

    // Check if default user exists
    let defaultUser = await User.findOne({ email: 'default@workspace.local' });
    
    if (!defaultUser) {
      console.log('Creating default user...');
      defaultUser = await User.create({
        email: 'default@workspace.local',
        name: 'Default User',
        avatar: '',
      });
      console.log('✅ Default user created:', defaultUser._id);
    } else {
      console.log('✅ Default user already exists:', defaultUser._id);
    }

    // Check if default workspace exists
    let defaultWorkspace = await Workspace.findOne({ name: 'Default Workspace' });
    
    if (!defaultWorkspace) {
      console.log('Creating default workspace...');
      defaultWorkspace = await Workspace.create({
        name: 'Default Workspace',
        description: 'Your default workspace for organizing tasks',
        ownerId: defaultUser._id,
        members: [{
          userId: defaultUser._id,
          role: 'OWNER',
          joinedAt: new Date(),
        }],
        settings: {
          defaultTaskStatus: 'TODO',
          defaultPriority: 'NORMAL',
        },
      });
      console.log('✅ Default workspace created:', defaultWorkspace._id);
    } else {
      console.log('✅ Default workspace already exists:', defaultWorkspace._id);
    }

    // Output environment variables to set
    console.log('\n📋 Add these to your .env.local file:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`DEFAULT_WORKSPACE_ID=${defaultWorkspace._id}`);
    console.log(`DEFAULT_USER_ID=${defaultUser._id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
