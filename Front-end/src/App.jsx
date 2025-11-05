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
import OrdersPayment from './pages/OrdersPayment'
import AdminDashboard from './pages/AdminDashboard'
import UserManagement from './pages/UserManagement'
import { GoogleOAuthProvider } from '@react-oauth/google';
import MyListings from './pages/MyListings'; // Thêm dòng này

function App() {
  return (
    <GoogleOAuthProvider clientId="668404152143-6oofthiqpc6bi493q4rmd5l2ggqob609.apps.googleusercontent.com">
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
          <Route path="/orders-payment" element={<OrdersPayment />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/my-listings" element={<MyListings />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App