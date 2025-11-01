/**
 * Glossary of Technical Terms
 *
 * Centralized definitions for all technical terms used in the DAMOCLES platform.
 * Used by InfoTooltip and Glossary components for consistent explanations.
 */

export interface GlossaryEntry {
  title: string;
  description: string | React.ReactNode;
  category?: 'legal' | 'technical' | 'financial' | 'blockchain';
  learnMoreUrl?: string;
  relatedTerms?: Array<keyof typeof glossary>;
}

export const glossary = {
  // === PERSONAL DEBT INDEX (PDI) ===
  pdi_score: {
    title: 'PDI Score (Personal Debt Index)',
    description: 'Din personlige gjeldshelsescore fra 0-100. Jo høyere score, desto bedre økonomisk helse. Basert på 5 faktorer: gjeld-til-inntekt, gjeld-til-sparekonto, kredittbruk, betalingshistorikk, og likviditet.',
    category: 'financial' as const,
    learnMoreUrl: '/dashboard/pdi',
    relatedTerms: ['dti_ratio', 'dsr_ratio', 'credit_utilization'],
  },

  dti_ratio: {
    title: 'DTI (Debt-to-Income Ratio)',
    description: 'Gjeld-til-inntekt-forholdet viser hvor mye av din månedlige inntekt som går til gjeldsnedbetaling. Under 28% er godt, 28-36% er akseptabelt, over 36% kan være problematisk.',
    category: 'financial' as const,
  },

  dsr_ratio: {
    title: 'DSR (Debt Service Ratio)',
    description: 'Gjeldsbetalingsevne måler hvor mye av din månedlige inntekt som går til alle gjeldsforpliktelser, inkludert renter. Banken bruker dette for å vurdere låneevne.',
    category: 'financial' as const,
  },

  credit_utilization: {
    title: 'Kredittbruk',
    description: 'Hvor mye av din tilgjengelige kreditt du bruker. Ideelt bør dette være under 30%. Høyere bruk kan signalisere økonomisk stress.',
    category: 'financial' as const,
  },

  // === BLOCKCHAIN & TOKENS ===
  sword_token: {
    title: 'SWORD Token',
    description: 'Plattformens egen kryptovaluta (SWORD = Systematic Watchdog Oversight & Rights Defense). Du tjener SWORD ved å utøve dine rettigheter, og kan bruke dem til staking, governance, eller settlement funding.',
    category: 'blockchain' as const,
    learnMoreUrl: '/tokenomics',
    relatedTerms: ['shield_tier', 'staking'],
  },

  shield_tier: {
    title: 'Shield Tier',
    description: 'Ditt beskyttelsesnivå basert på SWORD tokens du eier: Bronze (0+), Silver (1K+), Gold (10K+), Platinum (250K+). Høyere tiers gir bedre renter på staking og prioritert support.',
    category: 'blockchain' as const,
    relatedTerms: ['sword_token', 'staking'],
  },

  staking: {
    title: 'Token Staking',
    description: 'Låse inn SWORD tokens i en periode for å tjene renter (15-100% APY avhengig av Shield Tier). Tokens er utilgjengelige under staking-perioden.',
    category: 'blockchain' as const,
  },

  blockchain_evidence: {
    title: 'Blockchain Bevis',
    description: 'Dokumenter og bevis lagret på Cardano blockchain. Dette gjør dem uforanderlige og rettsgyldig for bruk i rettssaker. Hvert dokument får en unik hash som beviser autentisitet.',
    category: 'blockchain' as const,
  },

  // === GDPR & LEGAL TERMS ===
  gdpr_article_15: {
    title: 'GDPR Artikkel 15',
    description: 'Din rett til innsyn - kreditor må gi deg kopi av alle personopplysninger de har om deg innen 30 dager. Dette er gratis og lovpålagt.',
    category: 'legal' as const,
    learnMoreUrl: 'https://gdpr-info.eu/art-15-gdpr/',
  },

  violation_score: {
    title: 'Bruddsscore',
    description: 'En tallverdi (0-5) som representerer alvorligheten av GDPR-brudd kreditor har begått. Beregnes basert på type brudd, konfidensnivå, og antall brudd.',
    category: 'legal' as const,
    relatedTerms: ['violation_types'],
  },

  violation_types: {
    title: 'Brudd-typer',
    description: '6 typer GDPR-brudd plattformen oppdager: (1) Ufullstendig svar - mangler påkrevd informasjon, (2) Overdreven oppbevaring - lagrer data for lenge, (3) Manglende samtykke - behandler data uten lovlig grunn, (4) Uautorisert deling - deler med tredjeparter uten samtykke, (5) Overdrevne gebyrer - tar urimelige avgifter, (6) Forsinket svar - svarer ikke innen 30 dager',
    category: 'legal' as const,
  },

  datatilsynet: {
    title: 'Datatilsynet',
    description: 'Norsk tilsynsmyndighet for personvern og GDPR. De håndhever GDPR-loven og kan ilegge bøter for brudd. Du kan klage til dem hvis kreditor ikke respekterer dine rettigheter.',
    category: 'legal' as const,
    learnMoreUrl: 'https://www.datatilsynet.no',
  },

  inkassoloven: {
    title: 'Inkassoloven',
    description: 'Norsk lov som regulerer hvordan inkassoselskaper kan drive innkreving. Setter strenge krav til dokumentasjon, gebyrer, og behandling av skyldnere.',
    category: 'legal' as const,
    learnMoreUrl: 'https://lovdata.no/dokument/NL/lov/1988-05-13-26',
  },

  // === SETTLEMENT & RECOVERY ===
  settlement: {
    title: 'Forlik',
    description: 'En avtale mellom deg og kreditor om å redusere gjelden i bytte mot rask betaling. Plattformen bruker AI og bevis på GDPR-brudd til å forhandle bedre avtaler.',
    category: 'financial' as const,
    relatedTerms: ['leverage_score'],
  },

  leverage_score: {
    title: 'Forhandlingsstyrke',
    description: 'En vurdering (0-100) av hvor sterk din forhandlingsposisjon er basert på: antall GDPR-brudd, alvorlighet, bevis-kvalitet, og kreditors historikk. Høyere score = bedre forlik.',
    category: 'financial' as const,
  },

  platform_fee: {
    title: 'Plattformavgift (25%)',
    description: 'Vi tar 25% av det beløpet du sparer/gjenvinner. Du betaler kun hvis vi lykkes. Hvis du sparer 10,000 kr på et forlik, tar vi 2,500 kr.',
    category: 'financial' as const,
  },

  // === TRUST & VERIFICATION ===
  bankid: {
    title: 'BankID',
    description: 'Norsk elektronisk ID for sikker identifikasjon. Vi bruker BankID for å verifisere din identitet når du oppretter GDPR-forespørsler (lovpålagt under GDPR Artikkel 12(6)).',
    category: 'technical' as const,
  },

  vipps_verification: {
    title: 'Vipps Verifisering',
    description: 'Koble til Vipps for rask identitetsbekreftelse og enkel betaling av plattformavgifter. Alternativ til BankID.',
    category: 'technical' as const,
  },

  trust_score: {
    title: 'Tillitsscore',
    description: 'Vår vurdering (0-100) av hvor pålitelig en kreditor er basert på: svar-kvalitet, GDPR-brudd, forlik-historikk, og bruker-tilbakemeldinger.',
    category: 'technical' as const,
  },

  // === PLATFORM FEATURES ===
  admission_detection: {
    title: 'Innrømmelsesdeteksjon',
    description: 'AI-algoritme som scanner kreditors svar etter ord og mønstre som indikerer de innrømmer feil eller brudd. Eksempel: "vi beklager feilen", "gebyr var feil".',
    category: 'technical' as const,
  },

  sword_protocol: {
    title: 'SWORD Protocol',
    description: 'Automatisk kollektiv søksmål-mekanisme. Når en kreditor når terskel for GDPR-brudd (f.eks. 50+ brukere), triggeres massesøksmål automatisk.',
    category: 'legal' as const,
  },

  cooldown_period: {
    title: 'Cooldown-periode',
    description: 'Ventetid (7 dager) mellom GDPR-forespørsler til samme kreditor. Dette beskytter mot spam og respekterer GDPR Artikkel 12(5) om "åpenbart grunnløse eller overdrevne" forespørsler.',
    category: 'legal' as const,
  },

  evidence_mining: {
    title: 'Evidence Mining',
    description: 'Du tjener SWORD tokens ved å sende GDPR-forespørsler og samle bevis på brudd. Jo mer bevis, desto flere tokens (100-10,000 SWORD per handling).',
    category: 'blockchain' as const,
  },

  // === RISK & COMPLIANCE ===
  gdpr_profile_complete: {
    title: 'GDPR-profil Komplett',
    description: 'For å sende GDPR-forespørsler må du oppgi: fullt navn, adresse, fødselsdato. Dette er lovpålagt under GDPR Artikkel 12(6) for identitetsverifisering.',
    category: 'legal' as const,
  },

  response_completeness: {
    title: 'Svar-fullstendighet',
    description: 'Score (0-100%) som måler hvor komplett kreditors GDPR-svar er. Vi sjekker 6 påkrevde elementer: data-kategorier, behandlingsformål, oppbevaringstid, tredjeparter, juridisk grunnlag, og rettighetsinformasjon.',
    category: 'legal' as const,
  },

  confidence_score: {
    title: 'Konfidensscore',
    description: 'Hvor sikker algoritmen er på at et brudd har skjedd (0-100%). Høyere score betyr mer pålitelig deteksjon. Under 70% kan være usikre tilfeller.',
    category: 'technical' as const,
  },
} as const;

/**
 * Get glossary entry by term
 */
export function getGlossaryEntry(term: keyof typeof glossary): GlossaryEntry | undefined {
  return glossary[term];
}

/**
 * Get all terms in a category
 */
export function getTermsByCategory(category: GlossaryEntry['category']): Array<keyof typeof glossary> {
  return Object.keys(glossary).filter(
    (key) => glossary[key as keyof typeof glossary].category === category
  ) as Array<keyof typeof glossary>;
}

/**
 * Search glossary terms
 */
export function searchGlossary(query: string): Array<keyof typeof glossary> {
  const lowerQuery = query.toLowerCase();
  return Object.keys(glossary).filter((key) => {
    const entry = glossary[key as keyof typeof glossary];
    return (
      key.toLowerCase().includes(lowerQuery) ||
      entry.title.toLowerCase().includes(lowerQuery) ||
      (typeof entry.description === 'string' && entry.description.toLowerCase().includes(lowerQuery))
    );
  }) as Array<keyof typeof glossary>;
}
