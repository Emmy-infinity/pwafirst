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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Primary Public Marketplace Feed */}
        <Route
          path="/"
          element={
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fbfbfb" }}>
              <PrimarySearchAppBar />
              <Navbar />
              
              {/* Responsive Stack: Flips to Column on Mobile */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" sx={{ px: { xs: 1, md: 3 }, py: 2, flexGrow: 1 }}>
                <Sidebar />
                <GalleryView />
              </Stack>

              <Footer />
            </Box>
          }
        />

        {/* Public Detailed Hardware View */}
        <Route 
          path="/product/:id" 
          element={
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#ffffff" }}>
              <PrimarySearchAppBar />
              <Navbar />
              <Box sx={{ flexGrow: 1, width: '100%' }}>
                <ProductDetail />
              </Box>
              <Footer />
            </Box>
          } 
        />

        {/* Protected Listing Creation Form */}
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

        {/* Protected Mobile Money Payment */}
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

        {/* Other routes unchanged */}
        <Route path="/chart" element={<PlotlyFromAPI />} />
        <Route path="/rightbar" element={<Rightbar />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/landmark" element={<OfflineHandTracker />} />
        <Route path="/search" element={<PrimarySearchAppBar />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
