import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import HeroSection from './components/HeroSection';
import ContractForm from './components/ContractForm';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';
import { getChatCompletion } from '../../services/aiIntegrations/chatCompletion';

const ContractGenerator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [contractData, setContractData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [contractText, setContractText] = useState(''); // Current text (live in edit mode)
  const [savedContractText, setSavedContractText] = useState(''); // Last saved version
  const [aiAdjustmentRequest, setAiAdjustmentRequest] = useState('');
  const [isAiAdjusting, setIsAiAdjusting] = useState(false);

  // Helper function to strip Markdown syntax from text
  const stripMarkdown = (text) => {
    if (!text) return '';
    
    return (
      // Clean up extra whitespace but preserve paragraph breaks
      // Remove horizontal rules
      // Remove links [text](url)
      // Remove bullet points and list markers
      // Remove bold/italic (**text**, *text*, __text__, _text_)
      // Remove headers (##, ###, etc.)
      // Remove inline code
      // Remove code fences
      text?.replace(/```[\s\S]*?```/g, '')?.replace(/`([^`]+)`/g, '$1')?.replace(/^#{1,6}\s+/gm, '')?.replace(/\*\*([^*]+)\*\*/g, '$1')?.replace(/\*([^*]+)\*/g, '$1')?.replace(/__([^_]+)__/g, '$1')?.replace(/_([^_]+)_/g, '$1')?.replace(/^[\s]*[-*+]\s+/gm, '')?.replace(/^[\s]*\d+\.\s+/gm, '')?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')?.replace(/^[-*_]{3,}$/gm, '')?.replace(/\n{3,}/g, '\n\n')?.trim()
    );
  };

  const handleFormSubmit = async (result) => {
    setLoading(true);
    try {
      if (result?.success) {
        // Strip any Markdown from the generated contract
        const plainText = stripMarkdown(result?.contract_markdown);
        
        setContractData(result);
        setSavedContractText(plainText);
        setContractText(plainText);
        setIsEditMode(false);
        setCurrentStep(2);
        toast?.success('Contract succesvol gegenereerd!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setContractData(null);
    setIsEditMode(false);
    setContractText('');
    setSavedContractText('');
    setAiAdjustmentRequest('');
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setContractText(savedContractText);
  };

  const handleSaveEdit = () => {
    setSavedContractText(contractText);
    setContractData(prev => ({
      ...prev,
      contract_markdown: contractText
    }));
    setIsEditMode(false);
    toast?.success('Wijzigingen opgeslagen!');
  };

  const handleCancelEdit = () => {
    setContractText(savedContractText);
    setIsEditMode(false);
    toast?.info('Wijzigingen geannuleerd');
  };

  const handleAiAdjustment = async () => {
    if (!aiAdjustmentRequest?.trim()) {
      toast?.error('Voer een wijzigingsverzoek in');
      return;
    }

    setIsAiAdjusting(true);
    try {
      const messages = [
        {
          role: 'system',
          content: 'Je bent een juridisch assistent die contracten aanpast op basis van specifieke verzoeken. Pas ALLEEN de gevraagde wijziging toe in het bestaande contract. Behoud de originele structuur en formatting. BELANGRIJK: Geef het volledige aangepaste contract terug als PLATTE TEKST zonder Markdown syntax (geen ##, **, -, bullets). Gebruik normale paragrafen en witregels voor structuur.'
        },
        {
          role: 'user',
          content: `Hier is het huidige contract:\n\n${savedContractText}\n\nPas het volgende aan: ${aiAdjustmentRequest}`
        }
      ];

      const response = await getChatCompletion(
        'OPENAI',
        'gpt-4o-mini',
        messages,
        {
          temperature: 0.3,
          max_tokens: 4000
        }
      );

      if (response?.choices?.[0]?.message?.content) {
        // Strip Markdown if AI returns it anyway
        const adjustedContract = stripMarkdown(response?.choices?.[0]?.message?.content);
        
        setSavedContractText(adjustedContract);
        setContractText(adjustedContract);
        setContractData(prev => ({
          ...prev,
          contract_markdown: adjustedContract
        }));
        setAiAdjustmentRequest('');
        toast?.success('Contract aangepast met AI!');
      } else {
        throw new Error('Geen response van AI');
      }
    } catch (error) {
      console.error('AI adjustment error:', error);
      toast?.error('Fout bij AI-aanpassing. Probeer het opnieuw.');
    } finally {
      setIsAiAdjusting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document?.getElementById('contract-preview');
      if (!element) {
        toast?.error('Contract preview niet gevonden');
        return;
      }

      const opt = {
        margin: [15, 15, 15, 15],
        filename: `${contractData?.contract_title || 'contract'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf()?.set(opt)?.from(element)?.save();
      toast?.success('PDF gedownload!');
    } catch (error) {
      console.error('PDF download error:', error);
      toast?.error('Fout bij downloaden PDF');
    }
  };

  const handlePrint = () => {
    try {
      const element = document?.getElementById('contract-preview');
      if (!element) {
        toast?.error('Contract preview niet gevonden');
        return;
      }

      const printWindow = window?.open('', '_blank');
      if (!printWindow) {
        toast?.error('Pop-up geblokkeerd. Sta pop-ups toe om te printen.');
        return;
      }

      printWindow?.document?.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${contractData?.contract_title || 'Contract'}</title>
            <style>
              @media print {
                @page {
                  margin: 2cm;
                  size: A4;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
              }
              body {
                font-family: Georgia, 'Times New Roman', serif;
                font-size: 12pt;
                line-height: 1.6;
                color: #000000;
                background: #ffffff;
                max-width: 800px;
                margin: 0 auto;
                padding: 48px;
              }
              .contract-content {
                white-space: pre-wrap;
                word-wrap: break-word;
              }
            </style>
          </head>
          <body>
            <div class="contract-content">${savedContractText}</div>
          </body>
        </html>
      `);
      printWindow?.document?.close();
      printWindow?.focus();
      
      setTimeout(() => {
        printWindow?.print();
        printWindow?.close();
      }, 250);
    } catch (error) {
      console.error('Print error:', error);
      toast?.error('Fout bij printen');
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator?.clipboard?.writeText(savedContractText || '');
      toast?.success('Contract gekopieerd naar klembord!');
    } catch (error) {
      console.error('Copy error:', error);
      toast?.error('Fout bij kopiëren');
    }
  };

  const steps = [
    { number: 1, label: 'Gegevens', icon: 'FileEdit' },
    { number: 2, label: 'Voorbeeld', icon: 'Eye' },
    { number: 3, label: 'Download', icon: 'Download' }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps?.map((step, index) => (
        <React.Fragment key={step?.number}>
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                currentStep >= step?.number
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {currentStep > step?.number ? (
                <Icon name="Check" size={20} />
              ) : (
                <Icon name={step?.icon} size={20} />
              )}
            </div>
            <span
              className={`mt-2 text-sm font-medium ${
                currentStep >= step?.number ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {step?.label}
            </span>
          </div>
          {index < steps?.length - 1 && (
            <div
              className={`w-16 md:w-24 h-1 mx-2 transition-all ${
                currentStep > step?.number ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Contract Generator - Professionele Contracten in Minuten</title>
        <meta
          name="description"
          content="Genereer juridisch correcte contracten snel en eenvoudig. Kies uit verschillende contracttypes en pas ze aan naar uw behoeften."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <HeroSection />

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {renderStepIndicator()}

          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Contractgegevens
                </h2>
                <ContractForm onSubmit={handleFormSubmit} loading={loading} />
              </div>
            </div>
          )}

          {currentStep === 2 && contractData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Contract Preview or Edit Mode */}
              <div className="bg-background rounded-2xl shadow-lg overflow-auto max-h-[800px]">
                <div className="flex items-center justify-between p-6 border-b border-border bg-card">
                  <h2 className="text-2xl font-bold text-foreground">
                    {isEditMode ? 'Contract Bewerken' : 'Contract Voorbeeld'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="X"
                    onClick={handleReset}
                  >
                    Sluiten
                  </Button>
                </div>

                {/* Edit Mode Buttons */}
                {!isEditMode && (
                  <div className="flex gap-2 p-4 border-b border-border bg-card">
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Edit"
                      iconPosition="left"
                      onClick={handleEditClick}
                    >
                      Bewerk
                    </Button>
                  </div>
                )}

                {isEditMode && (
                  <div className="flex gap-2 p-4 border-b border-border bg-card">
                    <Button
                      variant="default"
                      size="sm"
                      iconName="Save"
                      iconPosition="left"
                      onClick={handleSaveEdit}
                    >
                      Opslaan
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="X"
                      iconPosition="left"
                      onClick={handleCancelEdit}
                    >
                      Annuleer
                    </Button>
                  </div>
                )}

                {/* Contract Content */}
                {isEditMode ? (
                  <div className="p-6">
                    <textarea
                      value={contractText}
                      onChange={(e) => setContractText(e?.target?.value)}
                      className="w-full h-[600px] p-4 border border-border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Contract tekst..."
                    />
                  </div>
                ) : (
                  <div className="flex justify-center bg-muted p-6">
                    <div
                      id="contract-preview"
                      className="bg-white shadow-xl"
                      style={{
                        maxWidth: '800px',
                        width: '100%',
                        padding: '48px',
                        minHeight: '1000px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'Georgia, "Times New Roman", serif',
                          fontSize: '12pt',
                          lineHeight: '1.6',
                          color: '#000000',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word'
                        }}
                      >
                        {savedContractText}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Actions */}
              <div className="space-y-6">
                {/* AI Adjustment Feature */}
                <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    AI-aanpassing
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Vraag de AI om specifieke wijzigingen aan te brengen in het contract.
                  </p>
                  <div className="space-y-3">
                    <textarea
                      value={aiAdjustmentRequest}
                      onChange={(e) => setAiAdjustmentRequest(e?.target?.value)}
                      placeholder="Bijv: voeg 14 dagen betalingstermijn toe"
                      className="w-full h-24 p-3 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={isAiAdjusting}
                    />
                    <Button
                      variant="default"
                      size="md"
                      iconName="Sparkles"
                      iconPosition="left"
                      onClick={handleAiAdjustment}
                      loading={isAiAdjusting}
                      disabled={isAiAdjusting || !aiAdjustmentRequest?.trim()}
                      fullWidth
                    >
                      {isAiAdjusting ? 'AI past aan...' : 'Pas aan met AI'}
                    </Button>
                  </div>
                </div>

                {/* Export Actions */}
                <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Exporteer uw contract
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Download het contract als PDF of kopieer de tekst naar uw klembord.
                  </p>
                  <div className="space-y-3">
                    <Button
                      variant="default"
                      size="lg"
                      iconName="Printer"
                      iconPosition="left"
                      onClick={handlePrint}
                      fullWidth
                    >
                      Print / Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      iconName="Download"
                      iconPosition="left"
                      onClick={handleDownloadPDF}
                      fullWidth
                    >
                      Download als PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      iconName="Copy"
                      iconPosition="left"
                      onClick={handleCopyText}
                      fullWidth
                    >
                      Kopieer tekst
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      iconName="RotateCcw"
                      iconPosition="left"
                      onClick={handleReset}
                      fullWidth
                    >
                      Nieuw contract maken
                    </Button>
                  </div>
                </div>

                <div className="bg-accent/10 rounded-xl p-6 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-accent mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        Belangrijk
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Dit contract is automatisch gegenereerd. Laat het altijd nakijken door een juridisch adviseur voordat u het ondertekent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContractGenerator;