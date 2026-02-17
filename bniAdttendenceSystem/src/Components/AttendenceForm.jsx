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
      employee: selectedEmployee?.name || "",
      email: selectedEmployee?.email || ""
    }));
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee) {
      toast.error("Please select employee ❌");
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

  return (
    <Container maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
      <Toaster position="top-right" />

      <Paper elevation={4} sx={{ p: 4, mt: 5, borderRadius: 3 }}>
        <Typography
          variant="h5"
          textAlign="center"
          mb={3}
          fontWeight={700}
        >
          Welcome to BNI Icons
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>

          {/* ✅ Employee with Loader */}
          <TextField
            select
            fullWidth
            label="Select Employee"
            value={
              employeeLoading
                ? "Fetching employees..."
                : formData.employee
            }
            onChange={handleChange}
            margin="normal"
            required
            disabled={employeeLoading}
          >

            {employeeLoading ? (
              <MenuItem value="Fetching employees...">
                Fetching employees...
              </MenuItem>
            ) : (
              employees.map((emp, index) => (
                <MenuItem key={index} value={emp.name}>
                  {emp.name}
                </MenuItem>
              ))
            )}

          </TextField>

          {/* Address */}
          <TextField
            fullWidth
            label="Current Location (Address)"
            margin="normal"
            value={
              formData.address
                ? formData.address
                : "Fetching address..."
            }
            InputProps={{ readOnly: true }}
          />

          {/* Time */}
          <TextField
            fullWidth
            label="Current Time"
            value={formData.time}
            margin="normal"
            InputProps={{ readOnly: true }}
          />

          {/* Date */}
          <TextField
            fullWidth
            label="Current Date"
            value={formData.date}
            margin="normal"
            InputProps={{ readOnly: true }}
          />

          {/* Email */}
          <TextField
            fullWidth
            label="Email"
            value={formData.email}
            margin="normal"
            InputProps={{ readOnly: true }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>

        </Box>
      </Paper>
    </Container>
  );
}

export default AttendanceForm;
