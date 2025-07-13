// frontend/src/components/SplineScene.jsx
import React from 'react';
// Correct import for a standard React app (not Next.js)
import Spline from '@splinetool/react-spline'; 

const SplineScene = ({ splineUrl }) => {
  // Add a check just in case the URL isn't passed, though Dashboard.jsx will now pass it
  if (!splineUrl) {
    console.error("SplineScene: splineUrl prop is missing or empty. Please provide a valid Spline Viewer URL.");
    return <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red'}}>Error: Spline model URL not provided.</div>;
  }

  return (
    <div style={{
      width: '100%', /* Take full width of its parent container */
      height: '100%', /* Take full height of its parent container */
      overflow: 'hidden', /* Ensure no scrollbars from the 3D model */
    }}>
      {/* Use the splineUrl prop directly */}
      <Spline scene={splineUrl} />
    </div>
  );
};

export default SplineScene;
