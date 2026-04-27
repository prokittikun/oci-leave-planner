'use client';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring delay-1"></div>
        <div className="spinner-ring delay-2"></div>
      </div>
      <p className="loading-text">{message}</p>
    </div>
  );
}
