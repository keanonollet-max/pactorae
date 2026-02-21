import React from 'react';

const ContractDisplay = ({ content = '', loading = false }) => {
  if (loading) {
    return (
      <div className="contract-content">
        <div className="space-y-4">
          <div className="skeleton h-4 w-3/4"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-5/6"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-2/3"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-4/5"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="contract-content">
      <pre>{content}</pre>
    </div>
  );
};

export default ContractDisplay;