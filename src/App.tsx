import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ChatProvider } from './context/ChatContext';
import MainLayout from './components/Layout/MainLayout';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import DownloadsPage from './pages/DownloadsPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <LanguageProvider>
      <ChatProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="downloads" element={<DownloadsPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>
          </Routes>
        </Router>
      </ChatProvider>
    </LanguageProvider>
  );
}

export default App;