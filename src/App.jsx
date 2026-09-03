import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Destination from './pages/Destination';
import Planner from './pages/Planner';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/destination/:id" element={<Destination />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
