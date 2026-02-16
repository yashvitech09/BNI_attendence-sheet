import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AttendanceForm from './Components/AttendenceForm'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AttendanceForm />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App