import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    localStorage.removeItem("USERNAME");
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <CircularProgress sx={{ mb: 2 }} />
      <Typography variant="h6">Logging out securely...</Typography>
    </Box>
  );
}

export default Logout;
