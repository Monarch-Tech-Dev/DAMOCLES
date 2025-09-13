/**
 * DAMOCLES Terms of Service Monitor
 * Captures and monitors creditor ToS changes in real-time
 * Creates immutable evidence for legal defense
 */

import crypto from 'crypto';
import { ethers } from 'ethers';
import axios from 'axios';
import cheerio from 'cheerio';
import { create } from 'ipfs-http-client';

interface TermsSnapshot {
  companyId: string;
  companyName: string;
  captureDate: string;
  termsContent: string;
  termsHash: string;
  blockchainTx?: string;
  ipfsHash?: string;
  waybackUrl?: string;
  affectedUsers: number;
}

interface TermsChange {
  companyId: string;
  detectedAt: string;
  oldHash: string;
  newHash: string;
  changes: string[];
  legalViolations: string[];
  affectedUsers: number;
}

export class TermsMonitorService {
  private ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
  private contract: ethers.Contract;
  private monitoring = new Map<string, NodeJS.Timer>();
  
  constructor(
    private contractAddress: string,
    private provider: ethers.Provider
  ) {
    this.initializeContract();
  }
  
  private initializeContract() {
    const abi = [
      'function captureTerms(address company, string companyName, bytes32 termsHash, string ipfsHash)',
      'function reportViolation(address company, string violationType)',
      'event TermsCaptured(address indexed company, bytes32 termsHash, uint256 timestamp, string ipfsHash)',
      'event TermsViolation(address indexed company, string violationType, uint256 timestamp)'
    ];
    
    this.contract = new ethers.Contract(this.contractAddress, abi, this.provider);
  }
  
  /**
   * Start monitoring a creditor's terms of service
   */
  async startMonitoring(creditor: {
    id: string;
    name: string;
    tosUrl: string;
    checkInterval?: number;
  }) {
    // Initial capture
    const initialSnapshot = await this.captureTerms(creditor);
    await this.storeSnapshot(initialSnapshot);
    
    // Set up periodic monitoring (default: daily)
    const interval = creditor.checkInterval || 24 * 60 * 60 * 1000;
    
    const timer = setInterval(async () => {
      await this.checkForChanges(creditor);
    }, interval);
    
    this.monitoring.set(creditor.id, timer);
    
    console.log(`🔍 Monitoring started for ${creditor.name}`);
    console.log(`📸 Initial snapshot: ${initialSnapshot.termsHash}`);
    
    return initialSnapshot;
  }
  
  /**
   * Capture current terms of service
   */
  private async captureTerms(creditor: any): Promise<TermsSnapshot> {
    try {
      // Scrape current terms
      const response = await axios.get(creditor.tosUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DAMOCLES/1.0; +https://damocles.no/bot)'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Extract terms content (adjust selectors as needed)
      const termsContent = $('body').text()
        .replace(/\s+/g, ' ')
        .trim();
      
      // Generate hash
      const termsHash = crypto
        .createHash('sha256')
        .update(termsContent)
        .digest('hex');
      
      // Store on IPFS
      const ipfsResult = await this.ipfs.add(termsContent);
      const ipfsHash = ipfsResult.path;
      
      // Archive on Wayback Machine
      const waybackUrl = await this.archiveOnWayback(creditor.tosUrl);
      
      // Store on blockchain
      const blockchainTx = await this.storeOnBlockchain(
        creditor.id,
        creditor.name,
        termsHash,
        ipfsHash
      );
      
      return {
        companyId: creditor.id,
        companyName: creditor.name,
        captureDate: new Date().toISOString(),
        termsContent,
        termsHash,
        blockchainTx,
        ipfsHash,
        waybackUrl,
        affectedUsers: await this.getAffectedUserCount(creditor.id)
      };
      
    } catch (error) {
      console.error(`Failed to capture terms for ${creditor.name}:`, error);
      throw error;
    }
  }
  
  /**
   * Check for terms changes
   */
  private async checkForChanges(creditor: any) {
    try {
      const currentSnapshot = await this.captureTerms(creditor);
      const storedSnapshot = await this.getStoredSnapshot(creditor.id);
      
      if (currentSnapshot.termsHash !== storedSnapshot.termsHash) {
        console.log(`⚠️  TERMS CHANGE DETECTED for ${creditor.name}!`);
        
        const change = await this.analyzeChange(
          storedSnapshot,
          currentSnapshot
        );
        
        // Trigger automated response
        await this.handleTermsChange(creditor, change);
      }
      
    } catch (error) {
      console.error(`Error checking ${creditor.name}:`, error);
    }
  }
  
  /**
   * Analyze what changed in the terms
   */
  private async analyzeChange(
    oldSnapshot: TermsSnapshot,
    newSnapshot: TermsSnapshot
  ): Promise<TermsChange> {
    const changes: string[] = [];
    const legalViolations: string[] = [];
    
    // Check for specific problematic changes
    const problematicPatterns = [
      {
        pattern: /automated\s+tools?\s+prohibited/i,
        violation: 'Attempting to block GDPR Article 20 (data portability)'
      },
      {
        pattern: /waive\s+gdpr\s+rights/i,
        violation: 'GDPR rights cannot be waived (Article 7)'
      },
      {
        pattern: /mandatory\s+arbitration/i,
        violation: 'May violate Norwegian consumer protection law'
      },
      {
        pattern: /class\s+action\s+waiver/i,
        violation: 'Collective action rights protected under Norwegian law'
      },
      {
        pattern: /retroactive/i,
        violation: 'Retroactive terms require new consideration'
      }
    ];
    
    for (const { pattern, violation } of problematicPatterns) {
      if (pattern.test(newSnapshot.termsContent) && 
          !pattern.test(oldSnapshot.termsContent)) {
        changes.push(`Added: ${pattern.source}`);
        legalViolations.push(violation);
      }
    }
    
    return {
      companyId: oldSnapshot.companyId,
      detectedAt: new Date().toISOString(),
      oldHash: oldSnapshot.termsHash,
      newHash: newSnapshot.termsHash,
      changes,
      legalViolations,
      affectedUsers: await this.getAffectedUserCount(oldSnapshot.companyId)
    };
  }
  
  /**
   * Handle detected terms change
   */
  private async handleTermsChange(creditor: any, change: TermsChange) {
    console.log('🚨 INITIATING LEGAL DEFENSE PROTOCOL');
    
    // 1. Store evidence on blockchain
    await this.reportViolation(creditor.id, 'TERMS_CHANGE_ATTEMPT');
    
    // 2. Send legal notice
    await this.sendLegalNotice(creditor, change);
    
    // 3. Notify affected users
    await this.notifyUsers(creditor, change);
    
    // 4. File regulatory complaint
    await this.fileRegulatoryComplaint(creditor, change);
    
    // 5. Trigger media campaign
    await this.triggerMediaCampaign(creditor, change);
    
    // 6. Prepare class action
    if (change.affectedUsers >= 100) {
      await this.prepareClassAction(creditor, change);
    }
    
    console.log('✅ Legal defense protocol executed');
  }
  
  /**
   * Send automated legal notice
   */
  private async sendLegalNotice(creditor: any, change: TermsChange) {
    const notice = `
LEGAL NOTICE - INVALID TERMS MODIFICATION

To: ${creditor.name}
Date: ${new Date().toISOString()}
Re: Unauthorized Terms of Service Modification

This automated notice is sent on behalf of ${change.affectedUsers} affected users.

YOUR TERMS MODIFICATION IS LEGALLY VOID

Original Terms Hash: ${change.oldHash}
Modified Terms Hash: ${change.newHash}
Blockchain Evidence: ${this.contractAddress}

LEGAL VIOLATIONS IDENTIFIED:
${change.legalViolations.map((v, i) => `${i + 1}. ${v}`).join('\n')}

DEMANDS:
1. Immediately revert to original terms
2. Notify all users of invalid modification
3. Cease enforcement of new terms

NON-COMPLIANCE CONSEQUENCES:
- Regulatory complaints to Datatilsynet and Finanstilsynet
- Media exposure campaign
- Class action lawsuit
- Criminal fraud complaint

You have 24 hours to comply.

DAMOCLES Legal Defense System
Automated Response Protocol v1.0
    `;
    
    // Send via email, API, or registered mail
    await this.deliverLegalNotice(creditor, notice);
    
    // Log for evidence
    await this.logLegalAction('LEGAL_NOTICE_SENT', creditor.id, notice);
  }
  
  /**
   * Archive terms on Wayback Machine
   */
  private async archiveOnWayback(url: string): Promise<string> {
    try {
      const saveUrl = `https://web.archive.org/save/${url}`;
      await axios.get(saveUrl);
      
      return `https://web.archive.org/web/*/${url}`;
    } catch (error) {
      console.error('Wayback Machine archive failed:', error);
      return '';
    }
  }
  
  /**
   * Store evidence on blockchain
   */
  private async storeOnBlockchain(
    companyId: string,
    companyName: string,
    termsHash: string,
    ipfsHash: string
  ): Promise<string> {
    try {
      const tx = await this.contract.captureTerms(
        companyId,
        companyName,
        termsHash,
        ipfsHash
      );
      
      const receipt = await tx.wait();
      return receipt.transactionHash;
      
    } catch (error) {
      console.error('Blockchain storage failed:', error);
      return '';
    }
  }
  
  /**
   * Report ToS violation to blockchain
   */
  private async reportViolation(companyId: string, violationType: string) {
    try {
      const tx = await this.contract.reportViolation(companyId, violationType);
      await tx.wait();
      
      console.log(`📝 Violation reported on blockchain: ${violationType}`);
    } catch (error) {
      console.error('Failed to report violation:', error);
    }
  }
  
  // Stub methods for full implementation
  private async storeSnapshot(snapshot: TermsSnapshot) {
    // Store in database
  }
  
  private async getStoredSnapshot(companyId: string): Promise<TermsSnapshot> {
    // Retrieve from database
    return {} as TermsSnapshot;
  }
  
  private async getAffectedUserCount(companyId: string): Promise<number> {
    // Get count from database
    return 0;
  }
  
  private async notifyUsers(creditor: any, change: TermsChange) {
    // Send notifications to affected users
  }
  
  private async fileRegulatoryComplaint(creditor: any, change: TermsChange) {
    // File with Datatilsynet, Finanstilsynet, etc.
  }
  
  private async triggerMediaCampaign(creditor: any, change: TermsChange) {
    // Contact media outlets
  }
  
  private async prepareClassAction(creditor: any, change: TermsChange) {
    // Initiate class action preparation
  }
  
  private async deliverLegalNotice(creditor: any, notice: string) {
    // Send via multiple channels
  }
  
  private async logLegalAction(action: string, companyId: string, details: string) {
    // Log for audit trail
  }
}

// Auto-start monitoring for known creditors
export async function initializeTermsMonitoring() {
  const knownCreditors = [
    {
      id: 'lindorff',
      name: 'Lindorff',
      tosUrl: 'https://lindorff.no/terms'
    },
    {
      id: 'kredinor',
      name: 'Kredinor',
      tosUrl: 'https://kredinor.no/vilkar'
    },
    {
      id: 'intrum',
      name: 'Intrum',
      tosUrl: 'https://intrum.no/terms'
    }
    // Add more creditors
  ];
  
  const monitor = new TermsMonitorService(
    process.env.EVIDENCE_CONTRACT_ADDRESS!,
    new ethers.JsonRpcProvider(process.env.ETH_RPC_URL)
  );
  
  for (const creditor of knownCreditors) {
    await monitor.startMonitoring(creditor);
  }
  
  console.log('⚔️ Terms monitoring activated for all known creditors');
}