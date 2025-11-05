import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import About from './pages/About'
import BuyCars from './pages/BuyCars'
import Home from './pages/Home'
import Login from './pages/Login'
import ProductDetail from './pages/ProductDetail'
import Register from './pages/Register'
import Search from './pages/Search'
import SellCars from './pages/SellCars'
import UserProfile from './pages/UserProfile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/buy" element={<BuyCars />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/sell" element={<SellCars />} />
        <Route path="/search" element={<Search />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  )
}

export default App