import { Dashboard } from "./components/Dashboard"
import Sidebar from "./components/Sidebar"
import "./styles/App.css"

const App = () => {

  return (
    <div style={{ backgroundImage: "url('/Home.png')" }} className="bg-cover">
      <Sidebar />
      <Dashboard />
    </div>
  )
}

export default App
