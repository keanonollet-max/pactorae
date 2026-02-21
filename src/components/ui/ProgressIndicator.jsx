import React from 'react';
import Icon from '../AppIcon';

const ProgressIndicator = ({ currentStep = 'form' }) => {
  const steps = [
    { id: 'form', label: 'Contract Details', icon: 'FileEdit' },
    { id: 'generating', label: 'Generating', icon: 'Loader2' },
    { id: 'complete', label: 'Complete', icon: 'CheckCircle2' }
  ];

  const getStepStatus = (stepId) => {
    const stepIndex = steps?.findIndex(s => s?.id === stepId);
    const currentIndex = steps?.findIndex(s => s?.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="progress-container">
      <div className="progress-steps">
        {steps?.map((step, index) => {
          const status = getStepStatus(step?.id);
          const isLast = index === steps?.length - 1;
          
          return (
            <React.Fragment key={step?.id}>
              <div className="progress-step">
                <div className={`progress-step-circle ${status}`}>
                  {status === 'completed' ? (
                    <Icon name="Check" size={20} />
                  ) : status === 'active' && step?.id === 'generating' ? (
                    <Icon name={step?.icon} size={20} className="animate-spin" />
                  ) : (
                    <Icon name={step?.icon} size={20} />
                  )}
                </div>
                <span className={`progress-step-label ${status}`}>
                  {step?.label}
                </span>
              </div>
              {!isLast && (
                <div className={`progress-connector ${status === 'completed' ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;