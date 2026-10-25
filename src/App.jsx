import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout"; // ✅ NEW: Imports the Logout component
import Profile from "./pages/Profile"; // ✅ NEW: Imports the Profile component
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PlotlyFromAPI from "./pages/Chart";
import ImageUploader from "./pages/UploadImage";
import Navbar from "./pages/Navbar";
import Rightbar from "./pages/Rightbar";
import Sidebar from "./pages/Sidebar";
import GalleryView from "./pages/Feedtwo";
import ProductDetail from "./pages/ProductDetail";
import Footer from "./components/Footer";
import MoMoCheckoutModal from "./components/MoMoCheckoutModal";
import { Stack, Box } from '@mui/material';

function App() {
  console.log('✅ App.jsx is rendering');

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  return (
    <BrowserRouter>
      <Routes>
        {/* HOME FEED */}
        <Route
          path="/"
          element={
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fbfbfb" }}>
              <Navbar onFilterClick={() => setMobileFilterOpen(true)} />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ px: { xs: 1, md: 3 }, py: 2, flexGrow: 1 }}>
                <Sidebar
                  currentCategory={selectedCategory}
                  onCategoryChange={(slug) => setSelectedCategory(slug)}
                  mobileOpen={mobileFilterOpen}
                  onMobileClose={() => setMobileFilterOpen(false)}
                />
                <GalleryView selectedCategory={selectedCategory} />
              </Stack>
              <Footer />
            </Box>
          }
        />

        {/* PRODUCT DETAILS */}
        <Route path="/product/:id" element={
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#ffffff" }}>
            <Navbar onFilterClick={() => setMobileFilterOpen(true)} />
            <Box sx={{ flexGrow: 1, width: '100%' }}>
              <ProductDetail />
            </Box>
            <Footer />
          </Box>
        } />

        {/* UPLOAD (PROTECTED) */}
        <Route path="/upload" element={
          <ProtectedRoute>
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fbfbfb" }}>
              <Navbar onFilterClick={() => setMobileFilterOpen(true)} />
              <Box sx={{ flexGrow: 1, py: 2 }}>
                <ImageUploader />
              </Box>
              <Footer />
            </Box>
          </ProtectedRoute>
        } />

        {/* PAYMENT (PROTECTED) */}
        <Route path="/payment" element={
          <ProtectedRoute>
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fafafa" }}>
              <Navbar onFilterClick={() => setMobileFilterOpen(true)} />
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 4 } }}>
                <MoMoCheckoutModal />
              </Box>
              <Footer />
            </Box>
          </ProtectedRoute>
        } />

        {/* PROFILE (PROTECTED) ✅ NEW */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fbfbfb" }}>
              <Navbar onFilterClick={() => setMobileFilterOpen(true)} />
              <Box sx={{ flexGrow: 1 }}>
                <Profile />
              </Box>
              <Footer />
            </Box>
          </ProtectedRoute>
        } />

        {/* AUTHENTICATION ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* ✅ UPDATED: Use the Logout component to clear tokens */}
        <Route path="/logout" element={<Logout />} /> 
        
        {/* 404 FALLBACK */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
