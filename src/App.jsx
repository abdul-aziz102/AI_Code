import React from 'react'
import { BrowserRouter, Route , Routes  } from 'react-router-dom'

import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Navbar from './component/Navbar'

const App = () => {
  return (

    <div className='h-full'>
      <BrowserRouter>
  
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App