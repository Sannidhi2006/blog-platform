import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateBlog from './pages/CreateBlog';
import EditPost from './pages/EditPost';
import MyBlogs from './pages/MyBlogs';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <Router>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/post/:id" element={<PostDetail />} />
                  <Route path="/search" element={<SearchResults />} />

                  {/* Protected Routes */}
                  <Route
                    path="/create"
                    element={
                      <ProtectedRoute>
                        <CreateBlog />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/edit/:id"
                    element={
                      <ProtectedRoute>
                        <EditPost />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-blogs"
                    element={
                      <ProtectedRoute>
                        <MyBlogs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
