import React, { useState } from 'react';

function App() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!inputText.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

      // Отправляем POST запрос через встроенный fetch
      const res = await fetch(`${apiUrl}/sample`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText })
      });

      const data = await res.json();

      // Проверяем, успешен ли статус (200-299)
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при ответе сервера');
      }

      setResponse({ type: 'success', text: data.message });
      setInputText(''); // Очищаем поле ввода
      
    } catch (error) {
      console.error(error);
      setResponse({ 
        type: 'error', 
        text: error.message || 'Произошла ошибка при соединении с сервером.' 
      });
    } finally {
      setLoading(false); // Выключаем анимацию загрузки
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>Тест базы данных (5 сек)</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Введите любые символы..."
          disabled={loading}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          style={{ 
            padding: '10px', 
            fontSize: '16px', 
            backgroundColor: loading ? '#9ca3af' : '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'wait' : 'pointer'
          }}
        >
          {loading ? 'Отправка (ожидание 5 сек)...' : 'Отправить в БД'}
        </button>
      </form>

      {/* Блок для отображения ответа от сервера */}
      {response && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          borderRadius: '4px',
          backgroundColor: response.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: response.type === 'success' ? '#166534' : '#991b1b'
        }}>
          <strong>Ответ сервера:</strong> <br/>
          {response.text}
        </div>
      )}
    </div>
  );
}

export default App;