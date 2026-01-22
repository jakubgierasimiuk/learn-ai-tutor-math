export const ThreeDShapes = () => {
  return (
    <div className="relative w-full h-full overflow-hidden pointer-events-none">
      {/* Gradient Blue Sphere */}
      <div 
        className="absolute top-20 right-32 w-40 h-40 rounded-full opacity-90 blur-sm animate-float"
        style={{
          background: 'linear-gradient(135deg, hsl(210 79% 58%), hsl(211 55% 24%))'
        }}
      />
      
      {/* Wireframe Cube (SVG) */}
      <svg 
        className="absolute top-40 left-20 w-32 h-32 animate-float" 
        style={{ animationDelay: '1s' }}
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id="cubeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(210 79% 58%)" />
            <stop offset="100%" stopColor="hsl(211 55% 24%)" />
          </linearGradient>
        </defs>
        {/* Front face */}
        <path d="M 30 40 L 70 40 L 70 80 L 30 80 Z" fill="none" stroke="url(#cubeGradient)" strokeWidth="2" />
        {/* Back face */}
        <path d="M 40 20 L 80 20 L 80 60 L 40 60 Z" fill="none" stroke="url(#cubeGradient)" strokeWidth="2" opacity="0.6" />
        {/* Connecting lines */}
        <line x1="30" y1="40" x2="40" y2="20" stroke="url(#cubeGradient)" strokeWidth="2" opacity="0.6" />
        <line x1="70" y1="40" x2="80" y2="20" stroke="url(#cubeGradient)" strokeWidth="2" opacity="0.6" />
        <line x1="70" y1="80" x2="80" y2="60" stroke="url(#cubeGradient)" strokeWidth="2" opacity="0.6" />
        <line x1="30" y1="80" x2="40" y2="60" stroke="url(#cubeGradient)" strokeWidth="2" opacity="0.6" />
      </svg>
      
      {/* Wireframe Sphere (SVG) */}
      <svg 
        className="absolute bottom-32 right-40 w-36 h-36 animate-float" 
        style={{ animationDelay: '2s' }}
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id="sphereGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(210 79% 58%)" />
            <stop offset="100%" stopColor="hsl(211 55% 24%)" />
          </linearGradient>
        </defs>
        {/* Outer circle */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#sphereGradient)" strokeWidth="2" />
        {/* Horizontal ellipses */}
        <ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="url(#sphereGradient)" strokeWidth="1.5" opacity="0.7" />
        <ellipse cx="50" cy="50" rx="40" ry="25" fill="none" stroke="url(#sphereGradient)" strokeWidth="1.5" opacity="0.5" />
        {/* Vertical ellipses */}
        <ellipse cx="50" cy="50" rx="12" ry="40" fill="none" stroke="url(#sphereGradient)" strokeWidth="1.5" opacity="0.7" />
        <ellipse cx="50" cy="50" rx="25" ry="40" fill="none" stroke="url(#sphereGradient)" strokeWidth="1.5" opacity="0.5" />
      </svg>

      {/* Small accent circles */}
      <div 
        className="absolute top-60 right-20 w-12 h-12 rounded-full opacity-40"
        style={{ background: 'hsl(210 79% 58%)' }}
      />
      <div 
        className="absolute bottom-20 left-32 w-16 h-16 rounded-full opacity-30"
        style={{ background: 'hsl(211 55% 24%)' }}
      />
    </div>
  );
};
