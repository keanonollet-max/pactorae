import React, { useState, useEffect, useRef } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';
import { generateContract, getExampleData } from '../../../services/contractGenerator';

const ContractForm = ({ 
  onSubmit, 
  loading = false 
}) => {
  const [templateType, setTemplateType] = useState('');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const isSubmittingRef = useRef(false);

  const contractTypes = [
    { value: 'freelance', label: 'Freelance overeenkomst' },
    { value: 'nda', label: 'NDA (Geheimhoudingsverklaring)' },
    { value: 'algemene_voorwaarden', label: 'Algemene voorwaarden' }
  ];

  const jurisdictionOptions = [
    { value: 'Antwerpen', label: 'Antwerpen' },
    { value: 'Brussel', label: 'Brussel' },
    { value: 'Gent', label: 'Gent' },
    { value: 'Leuven', label: 'Leuven' },
    { value: 'Brugge', label: 'Brugge' },
    { value: 'Charleroi', label: 'Charleroi' },
    { value: 'Luik', label: 'Luik' },
    { value: 'Mechelen', label: 'Mechelen' },
    { value: 'Hasselt', label: 'Hasselt' }
  ];

  const paymentTermsOptions = [
    { value: '50% bij ondertekening, 50% bij oplevering', label: '50/50 (ondertekening/oplevering)' },
    { value: '100% bij ondertekening', label: '100% vooraf' },
    { value: '100% bij oplevering', label: '100% bij oplevering' },
    { value: '33% bij ondertekening, 33% halverwege, 34% bij oplevering', label: '33/33/34 (in drie delen)' },
    { value: 'custom', label: 'Aangepast (vul zelf in)' }
  ];

  const ipOwnershipOptions = [
    { value: 'client', label: 'Opdrachtgever' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'shared', label: 'Gezamenlijk' }
  ];

  const cancellationPeriodOptions = [
    { value: '7 dagen', label: '7 dagen' },
    { value: '14 dagen', label: '14 dagen' },
    { value: '30 dagen', label: '30 dagen' },
    { value: '60 dagen', label: '60 dagen' }
  ];

  const fillExampleData = () => {
    if (!templateType) {
      toast?.error('Selecteer eerst een contracttype');
      return;
    }

    const exampleData = getExampleData(templateType);
    setFormData(exampleData);
    setErrors({});
    toast?.success('Voorbeeldgegevens ingevuld');
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e?.target?.value
    }));
    // Clear error for this field
    if (errors?.[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors?.[field];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors?.[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors?.[field];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e?.target?.checked
    }));
  };

  const handleTemplateChange = (value) => {
    setTemplateType(value);
    setFormData({});
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Debounce protection: ignore if already submitting
    if (isSubmittingRef?.current || isGenerating) {
      return;
    }
    
    if (!templateType) {
      toast?.error('Selecteer een contracttype');
      return;
    }
    
    // Set flags immediately to prevent double submission
    isSubmittingRef.current = true;
    setIsGenerating(true);
    
    try {
      const result = await generateContract(templateType, formData);
      
      if (!result?.success) {
        // Handle validation errors
        if (result?.error_code === 'VALIDATION_ERROR' && result?.missing_fields) {
          const newErrors = {};
          result?.missing_fields?.forEach(field => {
            newErrors[field] = 'Dit veld is verplicht';
          });
          setErrors(newErrors);
        }
        toast?.error(result?.error_message || 'Er is een fout opgetreden');
        return;
      }
      
      // Success - pass to parent
      onSubmit(result);
    } finally {
      // Always reset flags after completion (success or error)
      isSubmittingRef.current = false;
      setIsGenerating(false);
    }
  };

  const renderFreelanceFields = () => (
    <>
      <div className="col-span-2">
        <h3 className="text-lg font-semibold text-foreground mb-4">Freelancer (Partij 1)</h3>
      </div>
      <Input
        label="Naam freelancer"
        type="text"
        placeholder="Bijv. Jan Janssens"
        value={formData?.freelancerName || ''}
        onChange={handleInputChange('freelancerName')}
        error={errors?.freelancerName}
        required
        disabled={loading}
      />
      <Input
        label="Adres freelancer"
        type="text"
        placeholder="Bijv. Kerkstraat 25, 2000 Antwerpen, België"
        value={formData?.freelancerAddress || ''}
        onChange={handleInputChange('freelancerAddress')}
        error={errors?.freelancerAddress}
        required
        disabled={loading}
      />
      <Input
        label="Ondernemingsnummer (optioneel)"
        type="text"
        placeholder="Bijv. BE 0987.654.321"
        value={formData?.freelancerCompanyNumber || ''}
        onChange={handleInputChange('freelancerCompanyNumber')}
        disabled={loading}
      />

      <div className="col-span-2 mt-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Opdrachtgever (Partij 2)</h3>
      </div>
      <Input
        label="Naam opdrachtgever"
        type="text"
        placeholder="Bijv. Tech Solutions BV"
        value={formData?.clientName || ''}
        onChange={handleInputChange('clientName')}
        error={errors?.clientName}
        required
        disabled={loading}
      />
      <Input
        label="Adres opdrachtgever"
        type="text"
        placeholder="Bijv. Brusselsesteenweg 100, 1000 Brussel, België"
        value={formData?.clientAddress || ''}
        onChange={handleInputChange('clientAddress')}
        error={errors?.clientAddress}
        required
        disabled={loading}
      />
      <Input
        label="BTW-nummer (optioneel)"
        type="text"
        placeholder="Bijv. BE 0123.456.789"
        value={formData?.clientVAT || ''}
        onChange={handleInputChange('clientVAT')}
        disabled={loading}
      />

      <div className="col-span-2 mt-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Projectdetails</h3>
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-foreground mb-2">
          Projectomschrijving <span className="text-destructive">*</span>
        </label>
        <textarea
          className={`w-full min-h-[100px] px-4 py-3 rounded-lg border ${errors?.projectDescription ? 'border-destructive' : 'border-input'} bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth resize-none disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder="Beschrijf het project, de deliverables en verwachtingen..."
          value={formData?.projectDescription || ''}
          onChange={handleInputChange('projectDescription')}
          disabled={loading}
        />
        {errors?.projectDescription && (
          <p className="text-sm text-destructive mt-1">{errors?.projectDescription}</p>
        )}
      </div>

      <Input
        label="Startdatum"
        type="date"
        value={formData?.startDate || ''}
        onChange={handleInputChange('startDate')}
        error={errors?.startDate}
        required
        disabled={loading}
      />
      <Input
        label="Einddatum (of vul duur in)"
        type="date"
        value={formData?.endDate || ''}
        onChange={handleInputChange('endDate')}
        disabled={loading}
        description="Of vul hieronder de duur in"
      />
      <Input
        label="Duur (indien geen einddatum)"
        type="text"
        placeholder="Bijv. 3 maanden"
        value={formData?.duration || ''}
        onChange={handleInputChange('duration')}
        disabled={loading}
      />

      <div className="col-span-2 mt-2">
        <label className="block text-sm font-medium text-foreground mb-2">
          Vergoeding <span className="text-destructive">*</span>
        </label>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="compensationType"
              value="total"
              checked={formData?.compensationType === 'total'}
              onChange={handleInputChange('compensationType')}
              disabled={loading}
              className="h-4 w-4"
            />
            <span className="text-sm">Totaalbedrag</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="compensationType"
              value="hourly"
              checked={formData?.compensationType === 'hourly'}
              onChange={handleInputChange('compensationType')}
              disabled={loading}
              className="h-4 w-4"
            />
            <span className="text-sm">Uurtarief</span>
          </label>
        </div>
      </div>

      {formData?.compensationType === 'total' && (
        <Input
          label="Totaalbedrag (€)"
          type="number"
          placeholder="Bijv. 5000"
          value={formData?.totalAmount || ''}
          onChange={handleInputChange('totalAmount')}
          error={errors?.totalAmount}
          required
          disabled={loading}
          min="0"
          step="0.01"
        />
      )}

      {formData?.compensationType === 'hourly' && (
        <>
          <Input
            label="Uurtarief (€)"
            type="number"
            placeholder="Bijv. 75"
            value={formData?.hourlyRate || ''}
            onChange={handleInputChange('hourlyRate')}
            error={errors?.hourlyRate}
            required
            disabled={loading}
            min="0"
            step="0.01"
          />
          <Input
            label="Geschatte uren"
            type="number"
            placeholder="Bijv. 80"
            value={formData?.estimatedHours || ''}
            onChange={handleInputChange('estimatedHours')}
            error={errors?.estimatedHours}
            required
            disabled={loading}
            min="0"
          />
        </>
      )}

      <div className="col-span-2">
        <Select
          label="Betalingsvoorwaarden"
          placeholder="Selecteer betalingsvoorwaarden"
          options={paymentTermsOptions}
          value={formData?.paymentTerms || ''}
          onChange={handleSelectChange('paymentTerms')}
          error={errors?.paymentTerms}
          required
          disabled={loading}
        />
      </div>

      {formData?.paymentTerms === 'custom' && (
        <div className="col-span-2">
          <Input
            label="Aangepaste betalingsvoorwaarden"
            type="text"
            placeholder="Beschrijf de betalingsvoorwaarden"
            value={formData?.customPaymentTerms || ''}
            onChange={handleInputChange('customPaymentTerms')}
            required
            disabled={loading}
          />
        </div>
      )}

      <Input
        label="Aantal revisies inbegrepen"
        type="number"
        placeholder="Bijv. 3"
        value={formData?.revisions || ''}
        onChange={handleInputChange('revisions')}
        disabled={loading}
        min="0"
      />

      <Select
        label="Intellectuele eigendom"
        placeholder="Wie is eigenaar van het werk?"
        options={ipOwnershipOptions}
        value={formData?.ipOwnership || ''}
        onChange={handleSelectChange('ipOwnership')}
        disabled={loading}
        description="Wie behoudt de rechten op het geleverde werk?"
      />

      <div className="col-span-2">
        <Checkbox
          id="confidentiality"
          label="Geheimhoudingsclausule opnemen"
          checked={formData?.confidentiality || false}
          onChange={handleCheckboxChange('confidentiality')}
          disabled={loading}
        />
      </div>

      <Select
        label="Opzegtermijn"
        placeholder="Selecteer opzegtermijn"
        options={cancellationPeriodOptions}
        value={formData?.cancellationPeriod || ''}
        onChange={handleSelectChange('cancellationPeriod')}
        disabled={loading}
      />

      <Select
        label="Bevoegde rechtbank (arrondissement)"
        placeholder="Selecteer arrondissement"
        options={jurisdictionOptions}
        value={formData?.jurisdiction || ''}
        onChange={handleSelectChange('jurisdiction')}
        error={errors?.jurisdiction}
        required
        disabled={loading}
      />
    </>
  );

  const renderNDAFields = () => (
    <>
      <div className="col-span-2">
        <h3 className="text-lg font-semibold text-foreground mb-4">Partij 1</h3>
      </div>
      <Input
        label="Naam partij 1"
        type="text"
        placeholder="Bijv. Innovatie Partners BV"
        value={formData?.party1Name || ''}
        onChange={handleInputChange('party1Name')}
        error={errors?.party1Name}
        required
        disabled={loading}
      />
      <Input
        label="Adres partij 1"
        type="text"
        placeholder="Bijv. Technologielaan 50, 9000 Gent, België"
        value={formData?.party1Address || ''}
        onChange={handleInputChange('party1Address')}
        error={errors?.party1Address}
        required
        disabled={loading}
      />
      <Input
        label="Ondernemingsnummer (optioneel)"
        type="text"
        placeholder="Bijv. BE 0456.789.123"
        value={formData?.party1CompanyNumber || ''}
        onChange={handleInputChange('party1CompanyNumber')}
        disabled={loading}
      />

      <div className="col-span-2 mt-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Partij 2</h3>
      </div>
      <Input
        label="Naam partij 2"
        type="text"
        placeholder="Bijv. Startup Ventures NV"
        value={formData?.party2Name || ''}
        onChange={handleInputChange('party2Name')}
        error={errors?.party2Name}
        required
        disabled={loading}
      />
      <Input
        label="Adres partij 2"
        type="text"
        placeholder="Bijv. Ondernemersweg 15, 3000 Leuven, België"
        value={formData?.party2Address || ''}
        onChange={handleInputChange('party2Address')}
        error={errors?.party2Address}
        required
        disabled={loading}
      />
      <Input
        label="Ondernemingsnummer (optioneel)"
        type="text"
        placeholder="Bijv. BE 0789.123.456"
        value={formData?.party2CompanyNumber || ''}
        onChange={handleInputChange('party2CompanyNumber')}
        disabled={loading}
      />

      <div className="col-span-2 mt-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">NDA Details</h3>
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-foreground mb-2">
          Doel van openbaarmaking <span className="text-destructive">*</span>
        </label>
        <textarea
          className={`w-full min-h-[100px] px-4 py-3 rounded-lg border ${errors?.purpose ? 'border-destructive' : 'border-input'} bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth resize-none disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder="Bijv. Bespreking van een mogelijke samenwerking inzake..."
          value={formData?.purpose || ''}
          onChange={handleInputChange('purpose')}
          disabled={loading}
        />
        {errors?.purpose && (
          <p className="text-sm text-destructive mt-1">{errors?.purpose}</p>
        )}
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-foreground mb-2">
          Definitie vertrouwelijke informatie (optioneel)
        </label>
        <textarea
          className="w-full min-h-[80px] px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Laat leeg voor standaard definitie"
          value={formData?.confidentialInfoDefinition || ''}
          onChange={handleInputChange('confidentialInfoDefinition')}
          disabled={loading}
        />
      </div>

      <Input
        label="Duur van geheimhouding"
        type="text"
        placeholder="Bijv. 2 jaar"
        value={formData?.duration || ''}
        onChange={handleInputChange('duration')}
        error={errors?.duration}
        required
        disabled={loading}
      />

      <Input
        label="Boeteclausule (optioneel)"
        type="text"
        placeholder="Bijv. €10.000 per inbreuk"
        value={formData?.penaltyClause || ''}
        onChange={handleInputChange('penaltyClause')}
        disabled={loading}
      />

      <Select
        label="Bevoegde rechtbank (arrondissement)"
        placeholder="Selecteer arrondissement"
        options={jurisdictionOptions}
        value={formData?.jurisdiction || ''}
        onChange={handleSelectChange('jurisdiction')}
        error={errors?.jurisdiction}
        required
        disabled={loading}
      />
    </>
  );

  const renderAlgemeneVoorwaardenFields = () => (
    <>
      <div className="col-span-2">
        <h3 className="text-lg font-semibold text-foreground mb-4">Bedrijfsgegevens</h3>
      </div>
      <Input
        label="Bedrijfsnaam"
        type="text"
        placeholder="Bijv. Webshop Pro BV"
        value={formData?.companyName || ''}
        onChange={handleInputChange('companyName')}
        error={errors?.companyName}
        required
        disabled={loading}
      />
      <Input
        label="Adres"
        type="text"
        placeholder="Bijv. Handelsstraat 75, 2018 Antwerpen, België"
        value={formData?.companyAddress || ''}
        onChange={handleInputChange('companyAddress')}
        error={errors?.companyAddress}
        required
        disabled={loading}
      />
      <Input
        label="Ondernemingsnummer"
        type="text"
        placeholder="Bijv. BE 0321.654.987"
        value={formData?.companyNumber || ''}
        onChange={handleInputChange('companyNumber')}
        disabled={loading}
      />
      <Input
        label="Website"
        type="text"
        placeholder="Bijv. www.webshoppro.be"
        value={formData?.website || ''}
        onChange={handleInputChange('website')}
        error={errors?.website}
        required
        disabled={loading}
      />
      <Input
        label="Contact e-mail"
        type="email"
        placeholder="Bijv. info@webshoppro.be"
        value={formData?.contactEmail || ''}
        onChange={handleInputChange('contactEmail')}
        error={errors?.contactEmail}
        required
        disabled={loading}
      />
      <Input
        label="Telefoon (optioneel)"
        type="text"
        placeholder="Bijv. +32 3 123 45 67"
        value={formData?.contactPhone || ''}
        onChange={handleInputChange('contactPhone')}
        disabled={loading}
      />

      <div className="col-span-2 mt-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Voorwaarden</h3>
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-foreground mb-2">
          Leveringsvoorwaarden
        </label>
        <textarea
          className="w-full min-h-[80px] px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Bijv. Levering binnen 3-5 werkdagen na ontvangst van betaling..."
          value={formData?.deliveryTerms || ''}
          onChange={handleInputChange('deliveryTerms')}
          disabled={loading}
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-foreground mb-2">
          Betalingsvoorwaarden
        </label>
        <textarea
          className="w-full min-h-[80px] px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Bijv. Betaling binnen 14 dagen na factuurdatum..."
          value={formData?.paymentTerms || ''}
          onChange={handleInputChange('paymentTerms')}
          disabled={loading}
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-foreground mb-2">
          Aansprakelijkheid
        </label>
        <textarea
          className="w-full min-h-[80px] px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Bijv. Aansprakelijkheid is beperkt tot het factuurbedrag..."
          value={formData?.liability || ''}
          onChange={handleInputChange('liability')}
          disabled={loading}
        />
      </div>

      <div className="col-span-2">
        <Input
          label="Privacy verwijzing"
          type="text"
          placeholder="Bijv. Zie ons privacybeleid op www.webshoppro.be/privacy"
          value={formData?.privacyReference || ''}
          onChange={handleInputChange('privacyReference')}
          disabled={loading}
        />
      </div>

      <Select
        label="Bevoegde rechtbank (arrondissement)"
        placeholder="Selecteer arrondissement"
        options={jurisdictionOptions}
        value={formData?.jurisdiction || ''}
        onChange={handleSelectChange('jurisdiction')}
        error={errors?.jurisdiction}
        required
        disabled={loading}
      />
    </>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-8">
        <Select
          label="Type contract"
          placeholder="Selecteer een contracttype"
          options={contractTypes}
          value={templateType}
          onChange={handleTemplateChange}
          required
          disabled={loading}
        />
      </div>

      {templateType && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {templateType === 'freelance' && renderFreelanceFields()}
          {templateType === 'nda' && renderNDAFields()}
          {templateType === 'algemene_voorwaarden' && renderAlgemeneVoorwaardenFields()}
        </div>
      )}

      {templateType && (
        <div className="flex flex-col items-center gap-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="lg"
            iconName="FileText"
            iconPosition="left"
            onClick={fillExampleData}
            disabled={loading}
            className="min-w-[280px]"
          >
            Vul voorbeeldgegevens
          </Button>
          <Button
            type="submit"
            variant="default"
            size="lg"
            iconName="Sparkles"
            iconPosition="left"
            loading={isGenerating || loading}
            disabled={isGenerating || loading}
            className="min-w-[280px]"
          >
            {(isGenerating || loading) ? 'Contract wordt opgesteld…' : 'Genereer contract'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default ContractForm;