import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import Browse from './Browse';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Browse />} />
      </Routes>
    </Router>
  );
}
