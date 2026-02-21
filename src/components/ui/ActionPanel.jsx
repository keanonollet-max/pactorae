import React, { useState } from 'react';
import Button from './Button';


const ActionPanel = ({ 
  contractContent = '', 
  onDownloadPDF, 
  onCopyText 
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(contractContent);
      setCopySuccess(true);
      if (onCopyText) onCopyText();
      
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      if (onDownloadPDF) {
        await onDownloadPDF();
      }
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="action-panel">
      <h3 className="action-panel-title">Export Your Contract</h3>
      <div className="action-panel-buttons">
        <Button
          variant="default"
          size="lg"
          iconName="Download"
          iconPosition="left"
          onClick={handleDownload}
          loading={downloadLoading}
          disabled={!contractContent}
        >
          Download PDF
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          iconName={copySuccess ? "CheckCircle2" : "Copy"}
          iconPosition="left"
          onClick={handleCopy}
          disabled={!contractContent}
        >
          {copySuccess ? 'Copied!' : 'Copy Text'}
        </Button>
      </div>
    </div>
  );
};

export default ActionPanel;