import React, { useState, useEffect } from 'react';
import { debug } from '../utils/debug';

interface Props {
  title: string;
}

export const DebugExample: React.FC<Props> = ({ title }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    debug.lifecycle('Component mounted');
    debug.props('Initial props', { title });

    return () => {
      debug.lifecycle('Component will unmount');
    };
  }, [title]);

  const handleClick = () => {
    try {
      debug.state('Before count update', { count });
      setCount(prev => prev + 1);
      debug.state('After count update', { count: count + 1 });
      
      if (count > 5) {
        throw new Error('Count is too high!');
      }
    } catch (err) {
      debug.error('Error in handleClick', err);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="mb-4">Count: {count}</p>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Increment
      </button>
    </div>
  );
};