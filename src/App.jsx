import React from "react";
import OfflineHandTracker from "./pages/Mediapipe";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Note from "./components/Note";
import PrimarySearchAppBar from "./pages/NavigationBar";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute";
import PlotlyFromAPI from "./pages/Chart"
import ImageUploader from "./pages/UploadImage";
import Navbar from "./pages/Navbar";
import Rightbar from "./pages/Rightbar";
import Sidebar from "./pages/Sidebar";
import GalleryView from "./pages/Feedtwo";
import ProductDetail from "./pages/ProductDetail"; 
import Footer from "./components/Footer"; 
import MoMoCheckoutModal from "./components/MoMoCheckoutModal";

import { Stack, Box, Button, Container, styled } from '@mui/material'
import './App.css'

// Clean layout flexbox constructor mapping
const Stacking = styled(Stack)({
  flexDirection: 'row',
  gap: '40px',
  justifyContent: 'space-between'
});

// 🌟 RESTORED SESSION CLEANUP ENGINES: Wipes invalid keys to allow clean credentials inputs
function Logout() {
  localStorage.clear();
  return <Navigate to="/login" replace />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =====================================================================
            🏪 1. PRIMARY PUBLIC MARKETPLACE SHOWCASE FEED (FREE TO VIEW)
           ===================================================================== */}
        <Route
          path="/"
          element={
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fbfbfb" }}>
              <PrimarySearchAppBar />
              <Navbar />
              
              {/* 🗲 FLAT PLATFORM MATRIX LAYOUT GRID CANVAS */}
              <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ px: { xs: 1, md: 3 }, py: 2, flexGrow: 1 }}>
                <Sidebar />
                <GalleryView />
              </Stack>

              <Footer />
            </Box>
          }
        />

        {/* =====================================================================
            🌟 2. PUBLIC DETAILED HARDWARE CAROUSEL SHEETS (FREE TO EXPLORE)
           ===================================================================== */}
        <Route 
          path="/product/:id" 
          element={
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#ffffff" }}>
              <PrimarySearchAppBar />
              <Navbar />
              <Box sx={{ flexGrow: 1 }}>
                <ProductDetail />
              </Box>
              <Footer />
            </Box>
          } 
        />

        {/* =====================================================================
            🗲 3. SECURED SELLING AND LISTING CREATION FORM GATEWAY (PROTECTED)
           ===================================================================== */}
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fbfbfb" }}>
                <PrimarySearchAppBar />
                <Navbar />
                <Box sx={{ flexGrow: 1, py: 2 }}>
                  <ImageUploader />
                </Box>
                <Footer />
              </Box>
            </ProtectedRoute>
          } 
        />

        {/* =====================================================================
            💳 4. SECURED MOBILE MONEY TRANSACTION CHECKOUT GATEWAY (PROTECTED)
           ===================================================================== */}
        <Route 
          path="/payment" 
          element={
            <ProtectedRoute>
              <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fafafa" }}>
                <PrimarySearchAppBar />
                <Navbar />
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 4 } }}>
                  <MoMoCheckoutModal />
                </Box>
                <Footer />
              </Box>
            </ProtectedRoute>
          } 
        />

        {/* =====================================================================
            📝 5. LOGISTICS GRAPHS AND TRACKING EXTENSION ENDPOINTS
           ===================================================================== */}
        <Route path="/chart" element={<PlotlyFromAPI />} />
        <Route path="/rightbar" element={<Rightbar />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/landmark" element={<OfflineHandTracker />} />
        <Route path="/search" element={<PrimarySearchAppBar />} />
        
        {/* =====================================================================
            🔐 6. PUBLIC SESSIONS SECURITY ACCESS ENGINES
           ===================================================================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
