import { useMobile } from '@/hooks/use-mobile';
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const isMobile = useMobile();

  return (
    <div className={`sidebar ${isMobile ? 'mobile' : ''}`}>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/messages">Messages</Link>
          </li>
          <li>
            <Link to="/subjects">Subjects</Link>
          </li>
          <li>
            <Link to="/admin">Admin</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
