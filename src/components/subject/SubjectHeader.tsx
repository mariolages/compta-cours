import React from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';

const SubjectHeader = () => {
  const isMobile = useMobile();

  return (
    <header className={`flex items-center justify-between p-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
      <h1 className="text-2xl font-bold">Subject Header</h1>
      <nav>
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/about" className="mr-4">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>
    </header>
  );
};

export default SubjectHeader;
