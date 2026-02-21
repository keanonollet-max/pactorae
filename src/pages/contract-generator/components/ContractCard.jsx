import React from 'react';
import ContractDisplay from '../../../components/ui/ContractDisplay';
import ActionPanel from '../../../components/ui/ActionPanel';

const ContractCard = ({ 
  contract, 
  loading = false,
  onDownloadPDF,
  onCopyText 
}) => {
  if (!contract && !loading) {
    return null;
  }

  return (
    <div className="mt-8 md:mt-12 lg:mt-16">
      <div className="bg-card rounded-xl border border-border shadow-elevation-2 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4 md:px-8 md:py-5">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            Uw Gegenereerd Contract
          </h2>
        </div>
        
        <div className="p-6 md:p-8">
          <ContractDisplay content={contract} loading={loading} />
        </div>
      </div>

      {contract && !loading && (
        <ActionPanel
          contractContent={contract}
          onDownloadPDF={onDownloadPDF}
          onCopyText={onCopyText}
        />
      )}
    </div>
  );
};

export default ContractCard;