import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Header from "./partials/Header.jsx"
import Footer from './partials/Footer.jsx'
import Login from './pages/Login.jsx'
import OAuthSuccess from './pages/OAuth.jsx'
import Predict from './pages/Predict.jsx'
import Profile from './pages/Profile.jsx'

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header></Header>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/oauth-success" element={<OAuthSuccess/>} />
          <Route path="/predict" element={<Predict/>}></Route>
          <Route path="/profile" element={<Profile/>}/>
        </Routes>
        <Footer></Footer>
      </div>
    </BrowserRouter>
  )
}

export default App