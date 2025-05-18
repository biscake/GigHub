import Navbar from "./components/Navbar/Navbar"
import Sidebar from "./components/Sidebar/Sidebar"
import { useAuth } from "./hooks/useAuth"
import "./styles/App.css"

const App = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <Navbar />
      <p>{user?.username}</p>
      <button onClick={logout}>logout</button>
      <Sidebar />
    </>
  )
}

export default App
