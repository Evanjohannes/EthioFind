import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Discover from './pages/Discover'
import Saved from './pages/Saved'
import Account from './pages/Account'
import BusinessProfile from './pages/BusinessProfile'
import Signup from './pages/Signup'
import VerifyOtp from './pages/VerifyOtp'
import Login from './pages/Login'
import AddBusiness from './pages/AddBusiness'
import MyBusinesses from './pages/MyBusinesses'
import ManagePhotos from './pages/ManagePhotos'
import EditBusiness from './pages/EditBusiness'
import ManageBranches from './pages/ManageBranches'
import ResubmitPayment from './pages/ResubmitPayment'
import MapView from './pages/MapView'
import AdminLayout from './pages/AdminLayout'
import AdminOverview from './pages/AdminOverview'
import AdminBusinesses from './pages/AdminBusinesses'
import AdminPayments from './pages/AdminPayments'
import AdminSettings from './pages/AdminSettings'
import BottomNav from './components/BottomNav'
import BranchProfile from './pages/BranchProfile'
import AdminBusinessDetail from './pages/AdminBusinessDetail'
import Contact from './pages/Contact'
import Notifications from './pages/Notifications'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/account" element={<Account />} />
          <Route path="/business/:id" element={<BusinessProfile />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add-business" element={<AddBusiness />} />
          <Route path="/account/my-businesses" element={<MyBusinesses />} />
          <Route path="/account/my-businesses/:id/photos" element={<ManagePhotos />} />
          <Route path="/account/my-businesses/:id/edit" element={<EditBusiness />} />
          <Route path="/account/my-businesses/:id/branches" element={<ManageBranches />} />
          <Route path="/account/my-businesses/:id/resubmit" element={<ResubmitPayment />} />

          <Route path="/contact" element={<Contact />} />
<Route path="/account/notifications" element={<Notifications />} />

          <Route path="/branch/:id" element={<BranchProfile />} />
<Route path="/account/my-businesses/:id/branches/:branchId/photos" element={<ManagePhotos />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="businesses" element={<AdminBusinesses />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="businesses/:id" element={<AdminBusinessDetail />} />
          </Route>
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App