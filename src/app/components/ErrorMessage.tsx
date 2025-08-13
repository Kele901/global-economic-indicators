import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="p-3 sm:p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
    <p className="text-sm sm:text-base">{message}</p>
  </div>
);

export default ErrorMessage; 