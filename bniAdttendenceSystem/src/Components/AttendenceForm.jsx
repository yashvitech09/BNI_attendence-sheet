import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  TextField,
  MenuItem,
  Typography,
  Box,
  Button,
  CircularProgress
} from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import bniLogo from "../assets/BNI_logo.png";

const API_URL =
  "https://script.google.com/macros/s/AKfycbwHQgo8zKLS1VhxRTHFEhDS1nirTw9NaU8IJ7VjJogCMtv47qXDaWaKbALqg94pOyWBuw/exec";

function AttendanceForm() {
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    employee: "",
    email: "",
    latitude: null,
    longitude: null,
    address: "",
    date: "",
    time: ""
  });

  const [errors, setErrors] = useState({
    employee: "",
    email: ""
  });

  // ✅ Fetch Employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);
      const res = await fetch(`${API_URL}?action=getEmployee`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data);
      } else {
        toast.error("Failed to load employees");
      }
    } catch (error) {
      toast.error("Error loading employees");
    } finally {
      setEmployeeLoading(false);
    }
  };

  // ✅ Auto Date & Time
  useEffect(() => {
    const now = new Date();
    setFormData((prev) => ({
      ...prev,
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString()
    }));
  }, []);

  // ✅ Get Location + Address
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon
        }));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await response.json();
          setFormData((prev) => ({
            ...prev,
            address: data.display_name
          }));
        } catch (error) {
          console.error("Address fetch error:", error);
        }
      });
    }
  }, []);

  // ✅ Employee Change
  const handleChange = (e) => {
    const selectedEmployee = employees.find(
      (emp) => emp.name === e.target.value
    );
    setFormData((prev) => ({
      ...prev,
      employee: selectedEmployee?.name || ""
    }));
  };

  const validateForm = () => {
    let tempErrors = { employee: "", email: "" };
    let isValid = true;

    // Employee validation
    if (!formData.employee) {
      tempErrors.employee = "Please select employee";
      isValid = false;
    }

    // Email validation
    if (!formData.email) {
      tempErrors.email = "Please sign in with Google";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      tempErrors.email = "Invalid email address";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors ❌");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}?action=postForm`, {
        method: "POST",
        body: JSON.stringify(formData)
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error("API Error");
      }

      toast.success("Attendance Submitted Successfully ✅");

      setFormData((prev) => ({
        ...prev,
        employee: "",
        email: ""
      }));
    } catch (error) {
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Login
  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id:
        "1076950315812-poear3od1m34pp9shqpe956ucmc3es9k.apps.googleusercontent.com",
      callback: handleCredentialResponse
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleButton"),
      { theme: "outline", size: "large", width: "100%" }
    );
  }, []);

  const handleCredentialResponse = (response) => {
    const data = JSON.parse(atob(response.credential.split(".")[1]));
    setFormData((prev) => ({
      ...prev,
      email: data.email
    }));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#E8EBF0",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
        boxSizing: "border-box"
      }}
    >
      <Toaster position="top-right" />

      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: "460px", md: "500px" },
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          background: "#F0F2F5",
          boxSizing: "border-box"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "nowrap",
            gap: 1,
            mb: 3,
            whiteSpace: "nowrap"
          }}
        >
          <Typography
            fontWeight="bold"
            sx={{
              fontSize: { xs: "1.2rem", sm: "1.4rem" },
              color: "#1a1a2e",
              lineHeight: 1
            }}
          >
            Welcome to
          </Typography>

          <Box
            component="img"
            src={bniLogo}
            alt="BNI Logo"
            sx={{
              height: { xs: 20, sm: 24 },
              width: "auto",
              display: "block",
              objectFit: "contain",
              flexShrink: 0
            }}
          />

          <Typography
            fontWeight="bold"
            sx={{
              fontSize: { xs: "1.2rem", sm: "1.4rem" },
              color: "#1a1a2e",
              lineHeight: 1
            }}
          >
            Icons
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>

          {/* ✅ Google Login Button - full width */}
          <Box
            sx={{
              mb: 2.5,
              display: "flex",
              justifyContent: "center",
              "& > div": {
                width: "100% !important"
              },
              "& iframe": {
                width: "100% !important"
              }
            }}
          >
            <div id="googleButton" style={{ width: "100%" }}></div>
          </Box>

          {/* ✅ Employee Dropdown */}
          <TextField
            select
            fullWidth
            label="Select Employee"
            value={employeeLoading ? "Fetching employees..." : formData.employee}
            onChange={(e) => {
              handleChange(e);
              setErrors((prev) => ({ ...prev, employee: "" }));
            }}
            margin="normal"
            required
            disabled={employeeLoading}
            error={Boolean(errors.employee)}
            helperText={errors.employee}
          >
            {employeeLoading ? (
              <MenuItem value="Fetching employees...">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={16} />
                  Fetching employees...
                </Box>
              </MenuItem>
            ) : (
              employees.map((emp, index) => (
                <MenuItem key={index} value={emp.name}>
                  {emp.name}
                </MenuItem>
              ))
            )}
          </TextField>

          {/* ✅ Address */}
          <TextField
            fullWidth
            label="Current Location (Address)"
            margin="normal"
            value={formData.address ? formData.address : "Fetching address..."}
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                overflow: "hidden",
                textOverflow: "ellipsis"
              }
            }}
          />

          {/* ✅ Time */}
          <TextField
            fullWidth
            label="Current Time"
            value={formData.time}
            margin="normal"
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.875rem", sm: "1rem" }
              }
            }}
          />

          {/* ✅ Date */}
          <TextField
            fullWidth
            label="Current Date"
            value={formData.date}
            margin="normal"
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.875rem", sm: "1rem" }
              }
            }}
          />

          {/* ✅ Email */}
          <TextField
            fullWidth
            label="Email"
            value={formData.email}
            margin="normal"
            InputProps={{ readOnly: true }}
            error={Boolean(errors.email)}
            helperText={errors.email}
          />

          {/* ✅ Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: { xs: 1.4, sm: 1.6 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
              fontWeight: 700,
              letterSpacing: 1,
              borderRadius: 2,
              background: "linear-gradient(135deg, #1976d2, #1565c0)",
              boxShadow: "0 4px 15px rgba(25, 118, 210, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #1565c0, #0d47a1)",
                boxShadow: "0 6px 20px rgba(25, 118, 210, 0.5)",
                transform: "translateY(-1px)"
              },
              "&:disabled": {
                background: "#b0bec5"
              },
              transition: "all 0.2s ease"
            }}
            disabled={loading}
          >
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                Submitting...
              </Box>
            ) : (
              "Submit"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default AttendanceForm;