import mongoose from 'mongoose';

// Don't throw at import time so Vercel/build can succeed without env.
// We throw when connectDB() is called without MONGODB_URI (runtime).
const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

if (process.env.NODE_ENV !== 'production') {
  global.mongoose = cached;
}

// Log connection status in development (attach listeners once to avoid MaxListenersExceededWarning)
if (process.env.NODE_ENV !== 'production') {
  const conn = mongoose.connection;
  conn.setMaxListeners(20);
  if (!(global as unknown as { _mongooseDevListeners?: boolean })._mongooseDevListeners) {
    (global as unknown as { _mongooseDevListeners?: boolean })._mongooseDevListeners = true;
    conn.once('connected', () => {
      console.log('[MongoDB] Connected to database');
    });
    conn.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err.message);
    });
    conn.on('disconnected', () => {
      console.log('[MongoDB] Disconnected');
    });
  }
}

async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
