import { Route, Routes } from "react-router-dom";

import Home from "../pages/Home.tsx";
import Login from "../pages/login.tsx";
import Register from "../pages/Register.tsx";
import Dashboard from "../pages/Dashboard";
import VerifyEmail from "../pages/VerifyEmail.tsx";
import ForgotPassword from "../pages/ForgotPassword.tsx";
import ResetPassword from "../pages/ResetPassword.tsx";
import Profile from "../pages/Profile.tsx";
import AdminDashboard from "../pages/AdminDashboard.tsx";
import RentalDashboard from "../pages/rental/RentalDashboard.tsx";
import CreateRental from "../pages/rental/CreateRental.tsx";
import RentalDetails from "../pages/rental/RentalDetails.tsx";
import RentalItems from "../pages/rental/RentalItems.tsx";
import EditProfile from "../pages/EditProfile.tsx";
import Products from "../pages/Products.tsx";
import Cart from "../pages/Cart.tsx";
import Checkout from "../pages/Checkout.tsx";
import OrderConfirmation from "../pages/OrderConfirmation.tsx";
import ProtectedRoute from "../routes/ProtectedRoute.tsx";

const AppRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/rentals" element={<RentalDashboard />} />
        <Route path="/rentals/create" element={<CreateRental />} />
        <Route path="/rentals/:rentalId" element={<RentalDetails />} />
        <Route path="/rentals/:rentalId/items" element={<RentalItems />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/get-profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Route>
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;
