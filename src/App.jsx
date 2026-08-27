import React, { useState } from "react";
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

import { Stack, Box } from '@mui/material'
import './App.css'

function App() {
  // Single source of truth for the mobile filter drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fbfbfb" }}>
              <PrimarySearchAppBar />
              <Navbar onFilterClick={() => setMobileFilterOpen(true)} />
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" sx={{ px: { xs: 1, md: 3 }, py: 2, flexGrow: 1 }}>
                <Sidebar 
                  mobileOpen={mobileFilterOpen} 
                  onMobileClose={() => setMobileFilterOpen(false)} 
                />
                <GalleryView />
              </Stack>

              <Footer />
            </Box>
          }
        />
        
        {/* ... (Keep the rest of your App.js routes exactly as they are) ... */}
        <Route path="/product/:id" element={
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#ffffff" }}>
            <PrimarySearchAppBar />
            <Navbar onFilterClick={() => setMobileFilterOpen(true)} />
            <Box sx={{ flexGrow: 1, width: '100%' }}><ProductDetail /></Box>
            <Footer />
          </Box>
        } />
        {/* Add onFilterClick to other Navbars too */}
        {/* ... */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
