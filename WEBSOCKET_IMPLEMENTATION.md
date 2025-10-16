# WebSocket Implementation - DevSync Compatible

## 🎯 Overview

Implementasi WebSocket yang kompatibel dengan backend DevSync untuk real-time chat functionality. Implementasi ini mengikuti spesifikasi format pesan dan alur komunikasi yang benar sesuai dengan backend DevSync.

## 🏗️ Architecture

### 1. ChatWebSocket Class (`src/lib/ChatWebSocket.ts`)

Class utama yang mengelola koneksi WebSocket dan komunikasi dengan backend DevSync.

**Key Features:**
- ✅ Format pesan sesuai spesifikasi DevSync
- ✅ Validasi pesan incoming yang ketat
- ✅ Filter pesan berdasarkan project_id
- ✅ Auto-reconnect mechanism
- ✅ Error handling yang robust
- ✅ TypeScript type safety

**Configuration:**
```typescript
interface ChatWebSocketConfig {
  projectId: number;
  userId: number;
  token: string;
  wsUrl?: string;
  apiUrl?: string;
}
```

### 2. DevSync Message Format

**Outgoing (REST API):**
```typescript
POST /api/v1/projects/{projectId}/messages
{
  "content": "Hello World!"
}
```

**Incoming (WebSocket):**
```typescript
{
  "type": "chat_message",
  "project_id": 1,
  "user_id": 1,
  "data": {
    "message": "Hello World!",
    "user_id": 1,
    "project_id": 1
  }
}
```

## 🚀 Usage

### Basic Implementation

```typescript
import { ChatWebSocket } from '@/lib/ChatWebSocket';

// Initialize
const chatWs = new ChatWebSocket({
  projectId: 1,
  userId: 1,
  token: 'your-jwt-token',
  wsUrl: 'ws://localhost:8080/ws',
  apiUrl: 'http://localhost:8080/api/v1'
});

// Connect
chatWs.connect();

// Listen for messages
const unsubscribe = chatWs.onMessage((message) => {
  console.log('New message:', message.data.message);
});

// Send message
await chatWs.sendMessage('Hello World!');

// Cleanup
unsubscribe();
chatWs.disconnect();
```

### React Component Example

Lihat `src/components/debug/ChatWebSocketExample.tsx` untuk implementasi lengkap dalam React component.

## 🔧 Integration Points

### 1. Updated WebSocket Context (`src/contexts/WebSocketContext.tsx`)

- ✅ Validasi format pesan DevSync
- ✅ Filter berdasarkan project_id
- ✅ Error handling yang lebih baik

### 2. Updated Chat Hook (`src/hooks/useChat.ts`)

- ✅ Konversi format pesan DevSync ke ChatMessage
- ✅ Duplicate message checking
- ✅ Removed fallback refresh mechanism

### 3. Updated Message Types (`src/types/project.ts`)

- ✅ Added user_id field
- ✅ Restructured data field untuk kompatibilitas DevSync

## 🧪 Testing

### Dashboard Test Component

Buka dashboard (`/dashboard`) untuk melihat "Real-time Chat Test (DevSync Compatible)" section yang menampilkan:

1. **Connection Status**: Indikator koneksi WebSocket
2. **Message Display**: Real-time messages yang diterima
3. **Send Interface**: Input untuk mengirim pesan via REST API
4. **Instructions**: Penjelasan cara kerja sistem

### Manual Testing Steps

1. **Login** ke aplikasi
2. **Buka Dashboard** - lihat section "Real-time Chat Test"
3. **Check Connection** - pastikan status "Connected to DevSync WebSocket"
4. **Send Message** - ketik pesan dan klik "Send via API"
5. **Verify Flow**:
   - Pesan dikirim via REST API
   - Backend menyimpan ke database
   - Backend broadcast via WebSocket
   - Frontend menerima dan menampilkan pesan

## 🔍 Debugging

### Browser Console Logs

```javascript
// Connection events
✅ WebSocket connected
🔌 WebSocket disconnected
❌ WebSocket error: [error details]

// Message flow
📨 New message received: [message object]
🚀 Calling API to send message: [message content]
✅ Message sent successfully, waiting for WebSocket update
```

### Network Tab Monitoring

1. **WebSocket Connection**: `ws://localhost:8080/ws`
2. **REST API Calls**: `POST /api/v1/projects/{id}/messages`
3. **Message Format Validation**: Check incoming WebSocket messages

## 🚨 Common Issues & Solutions

### 1. WebSocket Connection Failed

**Symptoms:**
- Status shows "Disconnected"
- Console error: "WebSocket connection failed"

**Solutions:**
- Pastikan backend DevSync running di `localhost:8080`
- Check CORS configuration di backend
- Verify WebSocket endpoint `/ws` tersedia

### 2. Messages Not Appearing

**Symptoms:**
- Pesan terkirim via API tapi tidak muncul di UI
- Console log: "Message sent successfully" tapi tidak ada WebSocket message

**Solutions:**
- Check backend WebSocket broadcast implementation
- Verify project_id filtering
- Check message format validation

### 3. Authentication Issues

**Symptoms:**
- API calls return 401/403
- WebSocket connection rejected

**Solutions:**
- Verify JWT token validity
- Check Authorization header format
- Ensure user has access to project

## 📝 Migration Notes

### From Old Implementation

1. **Removed Fallback Refresh**: Tidak lagi menggunakan polling/refresh mechanism
2. **Updated Message Format**: Sekarang menggunakan format DevSync yang benar
3. **Better Error Handling**: Lebih robust error handling dan logging
4. **Type Safety**: Full TypeScript support dengan proper interfaces

### Breaking Changes

- `WebSocketMessage` type structure changed
- `sendMessage` behavior changed (now uses REST API)
- Message validation logic updated

## 🔮 Future Improvements

1. **Message Persistence**: Local storage untuk offline messages
2. **Typing Indicators**: Real-time typing status
3. **Message Reactions**: Emoji reactions support
4. **File Attachments**: Support untuk file sharing
5. **Message Threading**: Reply/thread functionality

## 📚 References

- [DevSync Backend API Documentation](link-to-backend-docs)
- [WebSocket RFC 6455](https://tools.ietf.org/html/rfc6455)
- [React WebSocket Best Practices](link-to-react-websocket-guide)