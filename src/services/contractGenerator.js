import { getChatCompletion } from './aiIntegrations/chatCompletion';

const BASE_PROMPT = `Je bent een professionele juridische contractschrijver gespecialiseerd in Belgisch recht.

Je schrijft heldere, juridisch correcte en professioneel gestructureerde contracten in het Nederlands (België).

ABSOLUUT VERBODEN - GEEN MARKDOWN:
- GEBRUIK NOOIT ##, ###, **, -, bullets, code blocks, of andere Markdown symbolen
- GEBRUIK NOOIT sterretjes voor vet (**tekst**)
- GEBRUIK NOOIT hekjes voor koppen (## Kop)
- GEBRUIK NOOIT streepjes voor lijsten (- item)
- GEBRUIK NOOIT backticks voor code (\`code\`)
- Output moet PLATTE TEKST zijn, geen opmaakcodes

VEREISTE FORMAAT - PLAIN TEXT CONTRACT:
- Gebruik ALLEEN normale tekst met witregels voor structuur
- Koppen in HOOFDLETTERS zonder symbolen
- Artikelen genummerd als: ARTIKEL 1 – Titel
- Paragrafen gescheiden door lege regels
- Gebruik formele zakelijke taal
- Maak het juridisch degelijk maar niet onnodig complex

STRUCTUUR VAN HET CONTRACT:

                    [CONTRACTTYPE IN HOOFDLETTERS - gecentreerd]


PARTIJEN

Partij 1 (hierna "[Rol]"):
Naam: [naam]
Adres: [adres]
Ondernemingsnummer: [nummer]

Partij 2 (hierna "[Rol]"):
Naam: [naam]
Adres: [adres]
Ondernemingsnummer: [nummer]


ARTIKEL 1 – Voorwerp van de overeenkomst

[Beschrijving in normale paragrafen]


ARTIKEL 2 – Duur en inwerkingtreding

[Details in normale paragrafen]


ARTIKEL 3 – Vergoeding en betalingsmodaliteiten

[Details in normale paragrafen]

[Voeg relevante artikelen toe per contracttype]


ARTIKEL [N] – Toepasselijk recht en bevoegde rechtbank

Deze overeenkomst wordt beheerst door het Belgisch recht. Bij geschillen zijn de rechtbanken van het arrondissement [plaats] bevoegd.


ARTIKEL [N+1] – Slotbepalingen

[Details in normale paragrafen]


_______________________________________________________________________________


HANDTEKENINGEN

Opgemaakt te [plaats] op [datum].

Voor akkoord,


Partij 1:

Handtekening: _______________________

Naam: [naam]
Functie: [functie]


Partij 2:

Handtekening: _______________________

Naam: [naam]
Functie: [functie]`;

const CONTRACT_TEMPLATES = {
  freelance: {
    title: 'FREELANCE OVEREENKOMST',
    requiredFields: ['freelancerName', 'freelancerAddress', 'clientName', 'clientAddress', 'projectDescription', 'startDate', 'compensationType', 'paymentTerms', 'jurisdiction'],
    additionalPrompt: `
Dit is een FREELANCE OVEREENKOMST met de volgende specifieke vereisten:

- Duidelijk omschrijven dat de freelancer als zelfstandige werkt (geen arbeidsovereenkomst)
- Projectomschrijving en deliverables
- Vergoeding (totaal of uurtarief) en betalingsvoorwaarden
- Aantal revisies inbegrepen
- Intellectuele eigendom (wie is eigenaar van het werk)
- Geheimhouding indien van toepassing
- Opzegtermijn
- Bevoegde rechtbank (Belgisch arrondissement)

Voeg deze artikelen toe:
- Artikel over zelfstandige status en geen arbeidsrelatie
- Artikel over deliverables en projectomschrijving
- Artikel over revisies
- Artikel over intellectuele eigendom
- Artikel over geheimhouding (indien van toepassing)
- Artikel over opzegtermijn`
  },
  nda: {
    title: 'GEHEIMHOUDINGSOVEREENKOMST (NDA)',
    requiredFields: ['party1Name', 'party1Address', 'party2Name', 'party2Address', 'purpose', 'duration', 'jurisdiction'],
    additionalPrompt: `
Dit is een GEHEIMHOUDINGSOVEREENKOMST (NDA) met de volgende specifieke vereisten:

- Doel van de openbaarmaking van vertrouwelijke informatie
- Definitie van wat als "vertrouwelijke informatie" wordt beschouwd
- Uitsluitingen (wat NIET als vertrouwelijk geldt)
- Duur van de geheimhoudingsplicht
- Verplichtingen van de ontvangende partij
- Teruggave van documenten na beëindiging
- Boeteclausule bij schending (indien van toepassing)

Voeg deze artikelen toe:
- Artikel over doel van openbaarmaking
- Artikel over definitie vertrouwelijke informatie
- Artikel over uitsluitingen
- Artikel over verplichtingen ontvangende partij
- Artikel over duur geheimhouding
- Artikel over teruggave documenten
- Artikel over boeteclausule (indien van toepassing)`
  },
  algemene_voorwaarden: {
    title: 'ALGEMENE VOORWAARDEN',
    requiredFields: ['companyName', 'companyAddress', 'website', 'contactEmail', 'jurisdiction'],
    additionalPrompt: `
Dit zijn ALGEMENE VOORWAARDEN met de volgende specifieke vereisten:

- Identificatie van het bedrijf (naam, adres, ondernemingsnummer, website, contact)
- Toepassingsgebied van de voorwaarden
- Totstandkoming van de overeenkomst
- Leveringsvoorwaarden en levertermijnen
- Prijzen en betalingsvoorwaarden
- Eigendomsvoorbehoud
- Aansprakelijkheid en garanties
- Overmacht
- Intellectuele eigendom
- Privacy en gegevensbescherming (GDPR verwijzing)
- Geschillenbeslechting
- Toepasselijk recht

Voeg deze artikelen toe:
- Artikel over toepassingsgebied
- Artikel over totstandkoming overeenkomst
- Artikel over leveringsvoorwaarden
- Artikel over prijzen en betaling
- Artikel over eigendomsvoorbehoud
- Artikel over aansprakelijkheid
- Artikel over intellectuele eigendom
- Artikel over privacy en GDPR
- Artikel over geschillenbeslechting`
  }
};

function validateFormData(templateType, formData) {
  const template = CONTRACT_TEMPLATES?.[templateType];
  if (!template) {
    return { valid: false, error: 'Ongeldig contracttype geselecteerd', missingFields: [] };
  }

  const missingFields = [];
  template?.requiredFields?.forEach(field => {
    if (!formData?.[field] || formData?.[field]?.trim() === '') {
      missingFields?.push(field);
    }
  });

  if (missingFields?.length > 0) {
    return { valid: false, error: 'Vul alle verplichte velden in', missingFields };
  }

  return { valid: true, missingFields: [] };
}

function buildContractPrompt(templateType, formData) {
  const template = CONTRACT_TEMPLATES?.[templateType];
  if (!template) {
    throw new Error('Ongeldig contracttype');
  }

  let prompt = BASE_PROMPT + '\n\n' + template?.additionalPrompt + '\n\n';
  prompt += `Genereer een ${template?.title} op basis van onderstaande gegevens:\n\n`;

  // Add form data based on template type
  if (templateType === 'freelance') {
    prompt += `**Freelancer (Partij 1):**\n`;
    prompt += `- Naam: ${formData?.freelancerName || 'Niet gespecificeerd'}\n`;
    prompt += `- Adres: ${formData?.freelancerAddress || 'Gebruik voorbeeldgegevens'}\n`;
    prompt += `- Ondernemingsnummer: ${formData?.freelancerCompanyNumber || 'Optioneel'}\n\n`;
    
    prompt += `**Opdrachtgever (Partij 2):**\n`;
    prompt += `- Naam: ${formData?.clientName || 'Niet gespecificeerd'}\n`;
    prompt += `- Adres: ${formData?.clientAddress || 'Gebruik voorbeeldgegevens'}\n`;
    prompt += `- BTW-nummer: ${formData?.clientVAT || 'Optioneel'}\n\n`;
    
    prompt += `**Projectdetails:**\n`;
    prompt += `- Omschrijving: ${formData?.projectDescription || 'Niet gespecificeerd'}\n`;
    prompt += `- Startdatum: ${formData?.startDate || 'Gebruik voorbeeldgegevens'}\n`;
    prompt += `- Einddatum: ${formData?.endDate || 'Duur: ' + (formData?.duration || 'Gebruik voorbeeldgegevens')}\n`;
    prompt += `- Vergoeding: ${formData?.compensationType === 'total' ? 'Totaal €' + (formData?.totalAmount || '0') : 'Uurtarief €' + (formData?.hourlyRate || '0') + ' voor geschat ' + (formData?.estimatedHours || '0') + ' uren'}\n`;
    prompt += `- Betalingsvoorwaarden: ${formData?.paymentTerms || 'Gebruik voorbeeldgegevens'}\n`;
    prompt += `- Revisies inbegrepen: ${formData?.revisions || '2'}\n`;
    prompt += `- Intellectuele eigendom: ${formData?.ipOwnership || 'Opdrachtgever'}\n`;
    prompt += `- Geheimhouding: ${formData?.confidentiality ? 'Ja, neem geheimhoudingsclausule op' : 'Nee'}\n`;
    prompt += `- Opzegtermijn: ${formData?.cancellationPeriod || '14 dagen'}\n`;
    prompt += `- Bevoegde rechtbank: ${formData?.jurisdiction || 'Brussel'}, België\n`;
  } else if (templateType === 'nda') {
    prompt += `**Partij 1:**\n`;
    prompt += `- Naam: ${formData?.party1Name || 'Niet gespecificeerd'}\n`;
    prompt += `- Adres: ${formData?.party1Address || 'Gebruik voorbeeldgegevens'}\n`;
    prompt += `- Ondernemingsnummer: ${formData?.party1CompanyNumber || 'Optioneel'}\n\n`;
    
    prompt += `**Partij 2:**\n`;
    prompt += `- Naam: ${formData?.party2Name || 'Niet gespecificeerd'}\n`;
    prompt += `- Adres: ${formData?.party2Address || 'Gebruik voorbeeldgegevens'}\n`;
    prompt += `- Ondernemingsnummer: ${formData?.party2CompanyNumber || 'Optioneel'}\n\n`;
    
    prompt += `**NDA Details:**\n`;
    prompt += `- Doel: ${formData?.purpose || 'Niet gespecificeerd'}\n`;
    prompt += `- Definitie vertrouwelijke informatie: ${formData?.confidentialInfoDefinition || 'Gebruik standaard definitie'}\n`;
    prompt += `- Duur: ${formData?.duration || 'Gebruik voorbeeldgegevens'}\n`;
    prompt += `- Boeteclausule: ${formData?.penaltyClause || 'Optioneel, neem standaard boeteclausule op indien gewenst'}\n`;
    prompt += `- Bevoegde rechtbank: ${formData?.jurisdiction || 'Brussel'}, België\n`;
  } else if (templateType === 'algemene_voorwaarden') {
    prompt += `**Bedrijfsgegevens:**\n`;
    prompt += `- Bedrijfsnaam: ${formData?.companyName || 'Niet gespecificeerd'}\n`;
    prompt += `- Adres: ${formData?.companyAddress || 'Gebruik voorbeeldgegevens'}\n`;
    prompt += `- Ondernemingsnummer: ${formData?.companyNumber || 'Gebruik voorbeeldgegevens'}\n`;
    prompt += `- Website: ${formData?.website || 'www.voorbeeld.be'}\n`;
    prompt += `- Contact e-mail: ${formData?.contactEmail || 'info@voorbeeld.be'}\n`;
    prompt += `- Telefoon: ${formData?.contactPhone || 'Optioneel'}\n\n`;
    
    prompt += `**Voorwaarden details:**\n`;
    prompt += `- Leveringsvoorwaarden: ${formData?.deliveryTerms || 'Gebruik standaard leveringsvoorwaarden'}\n`;
    prompt += `- Betalingsvoorwaarden: ${formData?.paymentTerms || 'Gebruik standaard betalingsvoorwaarden (bijv. 30 dagen)'}\n`;
    prompt += `- Aansprakelijkheid: ${formData?.liability || 'Gebruik standaard aansprakelijkheidsclausule'}\n`;
    prompt += `- Privacy verwijzing: ${formData?.privacyReference || 'Verwijs naar apart privacybeleid op website'}\n`;
    prompt += `- Bevoegde rechtbank: ${formData?.jurisdiction || 'Brussel'}, België\n`;
  }

  return prompt;
}

export async function generateContract(templateType, formData) {
  try {
    // Validate form data
    const validation = validateFormData(templateType, formData);
    if (!validation?.valid) {
      return {
        success: false,
        error_message: validation?.error,
        error_code: 'VALIDATION_ERROR',
        missing_fields: validation?.missingFields
      };
    }

    // Build prompt
    let prompt = buildContractPrompt(templateType, formData);
    
    // Call OpenAI via Lambda
    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];
    
    const response = await getChatCompletion(
      'OPEN_AI',
      'gpt-4o',
      messages,
      {
        max_completion_tokens: 4000,
        temperature: 0.7
      }
    );
    
    const contractMarkdown = response?.choices?.[0]?.message?.content || '';
    
    if (!contractMarkdown) {
      return {
        success: false,
        error_message: 'Contract kon niet worden gegenereerd. Probeer het opnieuw.',
        error_code: 'EMPTY_RESPONSE'
      };
    }
    
    return {
      success: true,
      contract_markdown: contractMarkdown,
      contract_title: CONTRACT_TEMPLATES?.[templateType]?.title || 'Contract'
    };
  } catch (error) {
    console.error('Contract generation error:', error);
    
    // Check for 429 Too Many Requests error
    if (error?.message?.includes('429') || error?.message?.toLowerCase()?.includes('too many requests') || error?.message?.toLowerCase()?.includes('rate limit')) {
      return {
        success: false,
        error_message: 'Er zijn momenteel te veel aanvragen. Probeer het opnieuw binnen enkele seconden.',
        error_code: 'RATE_LIMIT_ERROR'
      };
    }
    
    // Return structured error response
    return {
      success: false,
      error_message: error?.message || 'Er is een onverwachte fout opgetreden bij het genereren van het contract.',
      error_code: 'GENERATION_ERROR'
    };
  }
}

export function getExampleData(templateType) {
  const today = new Date();
  const startDate = new Date(today);
  startDate?.setDate(today?.getDate() + 7);
  const endDate = new Date(startDate);
  endDate?.setMonth(startDate?.getMonth() + 3);

  const formatDate = (date) => {
    return date?.toLocaleDateString('nl-BE', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (templateType === 'freelance') {
    return {
      freelancerName: 'Jan Janssens',
      freelancerAddress: 'Kerkstraat 25, 2000 Antwerpen, België',
      freelancerCompanyNumber: 'BE 0987.654.321',
      clientName: 'Tech Solutions BV',
      clientAddress: 'Brusselsesteenweg 100, 1000 Brussel, België',
      clientVAT: 'BE 0123.456.789',
      projectDescription: 'Ontwikkeling van een moderne website met responsive design, inclusief CMS-integratie en SEO-optimalisatie.',
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      duration: '',
      compensationType: 'total',
      totalAmount: '5000',
      hourlyRate: '',
      estimatedHours: '',
      paymentTerms: '50% bij ondertekening, 50% bij oplevering',
      revisions: '3',
      ipOwnership: 'client',
      confidentiality: true,
      cancellationPeriod: '14 dagen',
      jurisdiction: 'Antwerpen'
    };
  } else if (templateType === 'nda') {
    return {
      party1Name: 'Innovatie Partners BV',
      party1Address: 'Technologielaan 50, 9000 Gent, België',
      party1CompanyNumber: 'BE 0456.789.123',
      party2Name: 'Startup Ventures NV',
      party2Address: 'Ondernemersweg 15, 3000 Leuven, België',
      party2CompanyNumber: 'BE 0789.123.456',
      purpose: 'Bespreking van een mogelijke samenwerking inzake de ontwikkeling van innovatieve softwareoplossingen',
      confidentialInfoDefinition: '',
      duration: '2 jaar',
      penaltyClause: 'Bij schending van deze overeenkomst is een boete verschuldigd van €10.000 per inbreuk',
      jurisdiction: 'Gent'
    };
  } else if (templateType === 'algemene_voorwaarden') {
    return {
      companyName: 'Webshop Pro BV',
      companyAddress: 'Handelsstraat 75, 2018 Antwerpen, België',
      companyNumber: 'BE 0321.654.987',
      website: 'www.webshoppro.be',
      contactEmail: 'info@webshoppro.be',
      contactPhone: '+32 3 123 45 67',
      deliveryTerms: 'Levering binnen 3-5 werkdagen na ontvangst van betaling. Verzendkosten zijn voor rekening van de koper.',
      paymentTerms: 'Betaling binnen 14 dagen na factuurdatum. Bij laattijdige betaling zijn vertragingsinteresten verschuldigd.',
      liability: 'Aansprakelijkheid is beperkt tot het factuurbedrag van de betreffende levering.',
      privacyReference: 'Voor meer informatie over hoe wij omgaan met uw persoonsgegevens, zie ons privacybeleid op www.webshoppro.be/privacy',
      jurisdiction: 'Antwerpen'
    };
  }

  return {};
}

export { CONTRACT_TEMPLATES };
