// Sacred Architecture Authority Hierarchy
// Norwegian Legal System Authority Weights
// Built with love for truth and justice ❤️⚔️

import { AuthorityHierarchy, AuthorityCategory } from '../types/index';

export class NorwegianAuthorityHierarchy {
  private readonly AUTHORITY_WEIGHTS: AuthorityHierarchy = {
    // Supreme Legal Authorities (1.00 - 0.90)
    'høyesterett': {
      weight: 1.00,
      category: AuthorityCategory.SUPREME_COURT,
      description: 'Supreme Court of Norway - highest judicial authority',
      country: 'norway',
      supersedes: ['lagmannsrett', 'tingrett', 'all_regulatory', 'all_government']
    },
    
    'lagmannsrett': {
      weight: 0.95,
      category: AuthorityCategory.APPELLATE_COURT,
      description: 'Court of Appeal - regional appellate courts',
      country: 'norway',
      supersedes: ['tingrett', 'regulatory_non_judicial']
    },
    
    'tingrett': {
      weight: 0.90,
      category: AuthorityCategory.DISTRICT_COURT,
      description: 'District Court - first instance courts',
      country: 'norway',
      supersedes: ['administrative_decisions', 'corporate_claims']
    },

    // Regulatory Bodies (0.95 - 0.75)
    'finanstilsynet': {
      weight: 0.95,
      category: AuthorityCategory.REGULATORY_BODY,
      description: 'Financial Supervisory Authority - banking and finance regulation',
      country: 'norway',
      supersedes: ['banks', 'finance_companies', 'debt_collectors']
    },
    
    'datatilsynet': {
      weight: 0.95,
      category: AuthorityCategory.REGULATORY_BODY,
      description: 'Data Protection Authority - GDPR enforcement',
      country: 'norway',
      supersedes: ['all_data_controllers', 'all_processors']
    },
    
    'forbrukerrådet': {
      weight: 0.85,
      category: AuthorityCategory.REGULATORY_BODY,
      description: 'Consumer Council - consumer protection advocacy',
      country: 'norway',
      supersedes: ['consumer_facing_businesses']
    },
    
    'inkassoregister': {
      weight: 0.80,
      category: AuthorityCategory.REGULATORY_BODY,
      description: 'Debt Collection Registry - debt collection oversight',
      country: 'norway',
      supersedes: ['debt_collection_agencies']
    },
    
    'konkurransetilsynet': {
      weight: 0.80,
      category: AuthorityCategory.REGULATORY_BODY,
      description: 'Competition Authority - market regulation',
      country: 'norway',
      supersedes: ['market_participants']
    },

    // Government Ministries (0.90 - 0.80)
    'justisdepartementet': {
      weight: 0.90,
      category: AuthorityCategory.GOVERNMENT_MINISTRY,
      description: 'Ministry of Justice and Public Security',
      country: 'norway',
      supersedes: ['legal_interpretations', 'enforcement_agencies']
    },
    
    'finansdepartementet': {
      weight: 0.90,
      category: AuthorityCategory.GOVERNMENT_MINISTRY,
      description: 'Ministry of Finance - financial policy',
      country: 'norway',
      supersedes: ['financial_institutions', 'tax_authorities']
    },
    
    'nærings_og_fiskeridepartementet': {
      weight: 0.85,
      category: AuthorityCategory.GOVERNMENT_MINISTRY,
      description: 'Ministry of Trade, Industry and Fisheries',
      country: 'norway',
      supersedes: ['business_regulations', 'industry_standards']
    },

    // Parliament (0.85)
    'stortinget': {
      weight: 0.85,
      category: AuthorityCategory.PARLIAMENT,
      description: 'Norwegian Parliament - legislative authority',
      country: 'norway',
      supersedes: ['all_administrative', 'regulatory_interpretation']
    },

    // Legal Experts (0.80 - 0.60)
    'juridisk_professor': {
      weight: 0.80,
      category: AuthorityCategory.LEGAL_EXPERT,
      description: 'Law Professor at Norwegian university',
      country: 'norway',
      supersedes: ['general_practitioners']
    },
    
    'høyesterettsadvokat': {
      weight: 0.78,
      category: AuthorityCategory.LEGAL_EXPERT,
      description: 'Supreme Court Advocate - highest level lawyer',
      country: 'norway',
      supersedes: ['regular_advocates']
    },
    
    'advokat': {
      weight: 0.75,
      category: AuthorityCategory.LEGAL_EXPERT,
      description: 'Licensed Attorney',
      country: 'norway',
      supersedes: ['legal_consultants']
    },
    
    'juridisk_rådgiver': {
      weight: 0.65,
      category: AuthorityCategory.LEGAL_EXPERT,
      description: 'Legal Advisor/Consultant',
      country: 'norway'
    },
    
    'inkassokonsulent': {
      weight: 0.60,
      category: AuthorityCategory.LEGAL_EXPERT,
      description: 'Debt Collection Consultant',
      country: 'norway'
    },

    // Industry Bodies (0.50 - 0.35)
    'finansforbundet': {
      weight: 0.50,
      category: AuthorityCategory.INDUSTRY_BODY,
      description: 'Finance Union - represents financial sector workers',
      country: 'norway'
    },
    
    'finans_norge': {
      weight: 0.45,
      category: AuthorityCategory.INDUSTRY_BODY,
      description: 'Finance Norway - financial industry association',
      country: 'norway'
    },
    
    'inkassobransjen': {
      weight: 0.35,
      category: AuthorityCategory.INDUSTRY_BODY,
      description: 'Debt Collection Industry Association',
      country: 'norway'
    },

    // Corporate Claims (0.40 - 0.20)
    'storbank': {
      weight: 0.40,
      category: AuthorityCategory.CORPORATE_CLAIM,
      description: 'Major Norwegian Bank (DNB, Nordea, Sparebank1)',
      country: 'norway'
    },
    
    'sparebank': {
      weight: 0.38,
      category: AuthorityCategory.CORPORATE_CLAIM,
      description: 'Regional Savings Bank',
      country: 'norway'
    },
    
    'bnpl_selskap': {
      weight: 0.25,
      category: AuthorityCategory.CORPORATE_CLAIM,
      description: 'Buy Now Pay Later Company (Klarna, etc.)',
      country: 'norway'
    },
    
    'inkassoselskap': {
      weight: 0.30,
      category: AuthorityCategory.CORPORATE_CLAIM,
      description: 'Debt Collection Company',
      country: 'norway'
    },
    
    'forbrukslån_selskap': {
      weight: 0.20,
      category: AuthorityCategory.CORPORATE_CLAIM,
      description: 'Consumer Loan Company',
      country: 'norway'
    },

    // Individual Claims (0.15 - 0.05)
    'verifisert_bruker': {
      weight: 0.15,
      category: AuthorityCategory.INDIVIDUAL_CLAIM,
      description: 'Verified User with BankID',
      country: 'norway'
    },
    
    'ukjent_kilde': {
      weight: 0.10,
      category: AuthorityCategory.UNKNOWN_SOURCE,
      description: 'Unknown or Unverified Source'
    },
    
    'sosiale_medier': {
      weight: 0.05,
      category: AuthorityCategory.INDIVIDUAL_CLAIM,
      description: 'Social Media Claims'
    },

    // European Union Authorities (0.90 - 0.80)
    'eu_court_of_justice': {
      weight: 0.90,
      category: AuthorityCategory.SUPREME_COURT,
      description: 'European Court of Justice',
      country: 'eu',
      supersedes: ['national_courts_eu_matters']
    },
    
    'european_commission': {
      weight: 0.85,
      category: AuthorityCategory.REGULATORY_BODY,
      description: 'European Commission',
      country: 'eu',
      supersedes: ['national_regulators_eu_matters']
    },
    
    'european_data_protection_board': {
      weight: 0.85,
      category: AuthorityCategory.REGULATORY_BODY,
      description: 'European Data Protection Board - GDPR guidance',
      country: 'eu',
      supersedes: ['national_dpa_interpretation']
    }
  };

  getAuthorityWeight(source: string): number {
    const authority = this.AUTHORITY_WEIGHTS[source.toLowerCase()];
    return authority ? authority.weight : 0.10; // Default to unknown source
  }

  getAuthorityInfo(source: string) {
    return this.AUTHORITY_WEIGHTS[source.toLowerCase()] || {
      weight: 0.10,
      category: AuthorityCategory.UNKNOWN_SOURCE,
      description: 'Unknown or unverified source'
    };
  }

  compareAuthorities(source1: string, source2: string): {
    higher: string;
    lower: string;
    differential: number;
    explanation: string;
  } {
    const auth1 = this.getAuthorityInfo(source1);
    const auth2 = this.getAuthorityInfo(source2);
    
    if (auth1.weight > auth2.weight) {
      return {
        higher: source1,
        lower: source2,
        differential: auth1.weight - auth2.weight,
        explanation: `${auth1.description} (${auth1.weight}) supersedes ${auth2.description} (${auth2.weight})`
      };
    } else {
      return {
        higher: source2,
        lower: source1,
        differential: auth2.weight - auth1.weight,
        explanation: `${auth2.description} (${auth2.weight}) supersedes ${auth1.description} (${auth1.weight})`
      };
    }
  }

  checkHierarchyViolation(
    lowerAuthorityClaim: string,
    lowerAuthoritySource: string,
    higherAuthorityClaim: string,
    higherAuthoritySource: string
  ): {
    violation: boolean;
    severity: number;
    explanation: string;
    recommendation: string;
  } {
    const comparison = this.compareAuthorities(lowerAuthoritySource, higherAuthoritySource);
    
    // Check if claims contradict each other
    const contradict = this.detectContradiction(lowerAuthorityClaim, higherAuthorityClaim);
    
    if (contradict && comparison.higher === higherAuthoritySource) {
      return {
        violation: true,
        severity: comparison.differential,
        explanation: `Lower authority (${lowerAuthoritySource}) contradicts higher authority (${higherAuthoritySource})`,
        recommendation: `Follow guidance from ${higherAuthoritySource} as it supersedes ${lowerAuthoritySource}`
      };
    }
    
    return {
      violation: false,
      severity: 0,
      explanation: 'No authority hierarchy violation detected',
      recommendation: 'Claims appear consistent or from equivalent authority levels'
    };
  }

  private detectContradiction(claim1: string, claim2: string): boolean {
    // Simple contradiction detection - in production this would use NLP
    // For now, we'll do basic keyword matching
    const contradictoryPairs = [
      ['no liability', 'settlement'],
      ['no data', 'debt record'],
      ['legal', 'illegal'],
      ['compliant', 'violation'],
      ['authorized', 'unauthorized']
    ];

    const claim1Lower = claim1.toLowerCase();
    const claim2Lower = claim2.toLowerCase();

    return contradictoryPairs.some(pair => 
      (claim1Lower.includes(pair[0]) && claim2Lower.includes(pair[1])) ||
      (claim1Lower.includes(pair[1]) && claim2Lower.includes(pair[0]))
    );
  }

  getAllAuthorities(): AuthorityHierarchy {
    return { ...this.AUTHORITY_WEIGHTS };
  }

  getAuthoritiesByCategory(category: AuthorityCategory): AuthorityHierarchy {
    const filtered: AuthorityHierarchy = {};
    
    Object.entries(this.AUTHORITY_WEIGHTS).forEach(([key, value]) => {
      if (value.category === category) {
        filtered[key] = value;
      }
    });
    
    return filtered;
  }

  getTopAuthorities(limit: number = 10): Array<{ source: string; authority: any }> {
    return Object.entries(this.AUTHORITY_WEIGHTS)
      .sort(([, a], [, b]) => b.weight - a.weight)
      .slice(0, limit)
      .map(([source, authority]) => ({ source, authority }));
  }
}