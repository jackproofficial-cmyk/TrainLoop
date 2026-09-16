import { Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/public/Home'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { LogIn } from './pages/public/LogIn'
import AthleteDashboard from './pages/athlete/Dashboard'
import { Onboarding } from './pages/athlete/Onboarding'
import { RequireProfile } from './components/RequireProfile'
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardLayout } from './layouts/DashboardLayout'


function App() {

  return (
    <>
      <AuthProvider >

        <Routes>
          {/* PUBLIC ROUTES (With Landing Navbar & Footer) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LogIn />} />
          </Route>

          {/* ONBOARDING (Standalone Fullscreen view) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          {/* AUTHENTICATED APP ROUTES (With Full-Height Sidebar Layout) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RequireProfile />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<AthleteDashboard />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </>
  )
}

export default App


// TODO : ADD A REAL DASHBOARD WHERE THERE IS A PANEL TO CONFIGURE THE PROFILE OR MAKE IT AUTOMATIC TO USE THE WHOLE THING. ADD A BANNER TO CONNECT THE PHONE NUMBER CREATE CUSTOM REALISTIC DATA TO TEST GRAPHS WITH RECHARTS


// TODO : ADD PASSWROD HASH AND ADD SEMANTIC FRIENDLY AND SEO FRIENDLY TAG AND REVIEW STRUCTURE.

// TODO : THINK ON HOW TO LET COACHES INSCRIBE : OPT.1 DIFFERENT LOGIN PAGE OR SAME ONE BUT WE ASK FOR CERTIFICATION OR SOME PROOF OR SMTH AND THE ASK IS MANUALLY ACCEPTED OR REJECT ON ANOTHER SITE (like admin.trainloop.com or manager.trainloop.com) WHERE WE CAN SEE ALL REQUESTS AND OTHER THINGS LIKE COACHES PERFS AND IF THEY ARE LATE OR NOT AND COMUNICATE WITH THEM.  MAYBE ALSO MAKE A SEPARATE DOMAIN FOR THE COACH PART (like coach.trainloop.com) THAT WOULD MAKE THINGS PRETTY COOL.

// FIND A WAY TO CONNECT TO AT LEAST STRAVA AND ADD GOOGLE AUTH ??.

// FIND A SPACE WHERE WE CAN TEST THINGS ONLINE WITHOUT 2 CMDS OPEN ON PC ??
