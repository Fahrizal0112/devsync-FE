// Test script untuk mensimulasikan WebSocket message
// Jalankan di browser console saat berada di halaman chat

function simulateWebSocketMessage() {
  const testMessage = {
    type: 'chat_message',
    project_id: 2,
    data: {
      id: Date.now(),
      content: 'Test message dari simulasi WebSocket - ' + new Date().toLocaleTimeString(),
      user_id: 3,
      user: {
        id: 3,
        username: 'testuser',
        name: 'Test User',
        avatar_url: '',
        github_id: 0,
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      project_id: 2,
      file_id: null,
      task_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };

  console.log('🧪 Simulating WebSocket message:', testMessage);
  
  // Dispatch custom event untuk simulasi
  window.dispatchEvent(new CustomEvent('simulate-websocket-message', {
    detail: testMessage
  }));
}

// Jalankan simulasi
simulateWebSocketMessage();

console.log('✅ WebSocket message simulation sent. Check if UI updates.');