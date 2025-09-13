// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DAMOCLES Developer Incentive System
 * @notice Rewards developers with SWORD tokens for contributions and security findings
 * @dev Implements comprehensive incentive structure for open source contributors
 */
contract DeveloperIncentives is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    IERC20 public immutable swordToken;
    
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR");
    bytes32 public constant CORE_DEV_ROLE = keccak256("CORE_DEV");
    bytes32 public constant SECURITY_LEAD_ROLE = keccak256("SECURITY_LEAD");
    
    // Contribution types
    enum ContributionType {
        BUG_FIX,
        FEATURE_DEVELOPMENT,
        SECURITY_FINDING,
        DOCUMENTATION,
        PERFORMANCE_OPTIMIZATION,
        CODE_REVIEW,
        COMMUNITY_SUPPORT,
        INFRASTRUCTURE
    }
    
    // Severity levels for security findings and bug fixes
    enum Severity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL,
        LEGENDARY
    }
    
    // Developer ranks
    enum DeveloperRank {
        NEWCOMER,
        CONTRIBUTOR,
        TRUSTED_DEVELOPER,
        CORE_DEVELOPER,
        LEAD_DEVELOPER,
        CHIEF_ARCHITECT,
        SECURITY_RESEARCHER,
        SECURITY_EXPERT,
        SECURITY_LEGEND
    }
    
    struct Contribution {
        address contributor;
        ContributionType contributionType;
        Severity severity;
        uint256 linesOfCode;
        uint256 complexityScore;
        uint256 impactScore;
        uint256 qualityScore;
        bool audited;
        uint256 reward;
        string githubPR;
        string description;
        uint256 timestamp;
        address validator;
    }
    
    struct DeveloperProfile {
        address developer;
        DeveloperRank rank;
        uint256 totalContributions;
        uint256 totalRewards;
        uint256 securityFindings;
        uint256 criticalFindings;
        uint256 codeQualityScore;
        uint256 communityScore;
        uint256 reputationScore;
        bool isCoreDeveloper;
        string specialization;
        uint256 joinDate;
        uint256 lastActiveDate;
        uint256 mentorshipPoints;
        uint256[] achievements;
    }
    
    struct SecurityBounty {
        uint256 id;
        address researcher;
        Severity severity;
        string vulnerabilityType;
        string description;
        bool hasPoC;
        bool hasFix;
        bool affectsUserFunds;
        uint256 baseReward;
        uint256 finalReward;
        uint256 reportDate;
        bool verified;
        address verifier;
    }
    
    // Storage
    mapping(address => DeveloperProfile) public developers;
    mapping(uint256 => Contribution) public contributions;
    mapping(uint256 => SecurityBounty) public securityBounties;
    mapping(address => uint256[]) public developerContributions;
    mapping(address => uint256) public monthlyAllocations; // For core developers
    mapping(uint256 => bool) public achievements; // Achievement ID -> exists
    
    Counters.Counter private contributionCounter;
    Counters.Counter private bountyCounter;
    
    // Reward constants (in SWORD tokens)
    uint256 public constant BASE_REWARD = 100;
    uint256 public constant SECURITY_MULTIPLIER = 5;
    uint256 public constant CRITICAL_MULTIPLIER = 20;
    uint256 public constant CORE_DEV_MONTHLY = 5000;
    uint256 public constant MAX_QUALITY_BONUS = 200; // 100% bonus for perfect quality
    
    // Security bounty base rewards
    uint256[5] public securityBaseRewards = [500, 1000, 5000, 15000, 50000];
    
    // Events
    event ContributionSubmitted(
        uint256 indexed contributionId,
        address indexed contributor,
        ContributionType contributionType,
        uint256 reward
    );
    
    event SecurityBountySubmitted(
        uint256 indexed bountyId,
        address indexed researcher,
        Severity severity,
        uint256 reward
    );
    
    event DeveloperRankUpdated(
        address indexed developer,
        DeveloperRank oldRank,
        DeveloperRank newRank
    );
    
    event CoreDeveloperAdded(address indexed developer, uint256 monthlyAllocation);
    event AchievementUnlocked(address indexed developer, uint256 achievementId);
    event RewardDistributed(address indexed recipient, uint256 amount, string reason);
    
    constructor(address _swordToken) {
        swordToken = IERC20(_swordToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
    }
    
    /**
     * @notice Submit a contribution for reward
     * @dev Can only be called by validators
     */
    function submitContribution(
        address contributor,
        ContributionType contributionType,
        Severity severity,
        uint256 linesOfCode,
        uint256 qualityScore,
        string memory githubPR,
        string memory description
    ) external onlyRole(VALIDATOR_ROLE) nonReentrant {
        require(contributor != address(0), "Invalid contributor");
        require(qualityScore <= 100, "Quality score must be <= 100");
        
        // Calculate reward
        uint256 reward = calculateContributionReward(
            contributionType,
            severity,
            linesOfCode,
            qualityScore,
            developers[contributor].isCoreDeveloper
        );
        
        // Create contribution record
        contributionCounter.increment();
        uint256 contributionId = contributionCounter.current();
        
        contributions[contributionId] = Contribution({
            contributor: contributor,
            contributionType: contributionType,
            severity: severity,
            linesOfCode: linesOfCode,
            complexityScore: calculateComplexity(linesOfCode, severity),
            impactScore: calculateImpact(contributionType, severity),
            qualityScore: qualityScore,
            audited: false,
            reward: reward,
            githubPR: githubPR,
            description: description,
            timestamp: block.timestamp,
            validator: msg.sender
        });
        
        // Update developer profile
        _updateDeveloperProfile(contributor, contributionType, reward, severity);
        
        // Add to developer's contribution list
        developerContributions[contributor].push(contributionId);
        
        // Distribute reward
        require(swordToken.transfer(contributor, reward), "Reward transfer failed");
        
        emit ContributionSubmitted(contributionId, contributor, contributionType, reward);
        emit RewardDistributed(contributor, reward, "Contribution");
        
        // Check for rank promotion and achievements
        _checkRankPromotion(contributor);
        _checkAchievements(contributor);
    }
    
    /**
     * @notice Submit security bounty for reward
     * @dev Enhanced rewards for security findings
     */
    function submitSecurityBounty(
        address researcher,
        Severity severity,
        string memory vulnerabilityType,
        string memory description,
        bool hasPoC,
        bool hasFix,
        bool affectsUserFunds
    ) external onlyRole(SECURITY_LEAD_ROLE) nonReentrant {
        require(researcher != address(0), "Invalid researcher");
        
        bountyCounter.increment();
        uint256 bountyId = bountyCounter.current();
        
        uint256 baseReward = securityBaseRewards[uint256(severity)];
        uint256 finalReward = calculateSecurityReward(
            baseReward,
            hasPoC,
            hasFix,
            affectsUserFunds
        );
        
        securityBounties[bountyId] = SecurityBounty({
            id: bountyId,
            researcher: researcher,
            severity: severity,
            vulnerabilityType: vulnerabilityType,
            description: description,
            hasPoC: hasPoC,
            hasFix: hasFix,
            affectsUserFunds: affectsUserFunds,
            baseReward: baseReward,
            finalReward: finalReward,
            reportDate: block.timestamp,
            verified: false,
            verifier: msg.sender
        });
        
        // Update researcher profile
        DeveloperProfile storage profile = developers[researcher];
        if (profile.developer == address(0)) {
            _initializeDeveloperProfile(researcher);
        }
        
        profile.securityFindings++;
        profile.totalRewards += finalReward;
        profile.lastActiveDate = block.timestamp;
        
        if (severity >= Severity.CRITICAL) {
            profile.criticalFindings++;
        }
        
        // Distribute reward
        require(swordToken.transfer(researcher, finalReward), "Bounty transfer failed");
        
        emit SecurityBountySubmitted(bountyId, researcher, severity, finalReward);
        emit RewardDistributed(researcher, finalReward, "Security Bounty");
        
        // Check for achievements and promotions
        _checkSecurityAchievements(researcher);
        _checkRankPromotion(researcher);
    }
    
    /**
     * @notice Add developer to core team
     */
    function addCoreDeveloper(
        address developer,
        uint256 monthlyAllocation,
        string memory specialization
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!developers[developer].isCoreDeveloper, "Already core developer");
        require(monthlyAllocation >= CORE_DEV_MONTHLY, "Insufficient allocation");
        
        developers[developer].isCoreDeveloper = true;
        developers[developer].rank = DeveloperRank.CORE_DEVELOPER;
        developers[developer].specialization = specialization;
        
        monthlyAllocations[developer] = monthlyAllocation;
        
        _grantRole(CORE_DEV_ROLE, developer);
        
        emit CoreDeveloperAdded(developer, monthlyAllocation);
        emit DeveloperRankUpdated(
            developer,
            developers[developer].rank,
            DeveloperRank.CORE_DEVELOPER
        );
    }
    
    /**
     * @notice Distribute monthly salaries to core developers
     */
    function distributeMonthlySalaries() external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Get list of core developers (implementation would iterate through them)
        // For gas efficiency, this would typically be done off-chain with a list
        
        // Placeholder for monthly distribution logic
        // In practice, this would be called by a scheduled job
    }
    
    /**
     * @notice Calculate contribution reward
     */
    function calculateContributionReward(
        ContributionType contributionType,
        Severity severity,
        uint256 linesOfCode,
        uint256 qualityScore,
        bool isCoreDev
    ) public pure returns (uint256) {
        uint256 reward = BASE_REWARD;
        
        // Severity multiplier
        uint256 severityMultiplier = 1;
        if (severity == Severity.LOW) severityMultiplier = 2;
        else if (severity == Severity.MEDIUM) severityMultiplier = 5;
        else if (severity == Severity.HIGH) severityMultiplier = 15;
        else if (severity == Severity.CRITICAL) severityMultiplier = 50;
        else if (severity == Severity.LEGENDARY) severityMultiplier = 200;
        
        reward *= severityMultiplier;
        
        // Type multiplier
        if (contributionType == ContributionType.SECURITY_FINDING) {
            reward *= SECURITY_MULTIPLIER;
        } else if (contributionType == ContributionType.BUG_FIX && severity >= Severity.HIGH) {
            reward *= 3;
        } else if (contributionType == ContributionType.FEATURE_DEVELOPMENT) {
            reward *= 2;
        }
        
        // Lines of code bonus (with diminishing returns)
        uint256 locBonus = linesOfCode > 1000 ? 1000 : linesOfCode;
        reward += locBonus / 10;
        
        // Quality bonus (0-100% bonus based on quality score)
        uint256 qualityBonus = (reward * qualityScore * MAX_QUALITY_BONUS) / (100 * 100);
        reward += qualityBonus;
        
        // Core developer bonus
        if (isCoreDev) {
            reward = (reward * 150) / 100; // 50% bonus
        }
        
        return reward;
    }
    
    /**
     * @notice Calculate security bounty reward with multipliers
     */
    function calculateSecurityReward(
        uint256 baseReward,
        bool hasPoC,
        bool hasFix,
        bool affectsUserFunds
    ) public pure returns (uint256) {
        uint256 reward = baseReward;
        
        if (hasPoC) reward = (reward * 150) / 100; // 50% bonus
        if (hasFix) reward = (reward * 200) / 100; // 100% bonus
        if (affectsUserFunds) reward = (reward * 500) / 100; // 400% bonus
        
        return reward;
    }
    
    /**
     * @notice Update developer profile after contribution
     */
    function _updateDeveloperProfile(
        address developer,
        ContributionType contributionType,
        uint256 reward,
        Severity severity
    ) internal {
        DeveloperProfile storage profile = developers[developer];
        
        // Initialize if new developer
        if (profile.developer == address(0)) {
            _initializeDeveloperProfile(developer);
        }
        
        profile.totalContributions++;
        profile.totalRewards += reward;
        profile.lastActiveDate = block.timestamp;
        
        // Update type-specific metrics
        if (contributionType == ContributionType.SECURITY_FINDING) {
            profile.securityFindings++;
            if (severity >= Severity.CRITICAL) {
                profile.criticalFindings++;
            }
        }
        
        // Update scores (simplified scoring system)
        profile.codeQualityScore = (profile.codeQualityScore + 85) / 2; // Moving average
        profile.communityScore += contributionType == ContributionType.CODE_REVIEW ? 5 : 1;
        profile.reputationScore = _calculateReputationScore(profile);
    }
    
    /**
     * @notice Initialize new developer profile
     */
    function _initializeDeveloperProfile(address developer) internal {
        developers[developer] = DeveloperProfile({
            developer: developer,
            rank: DeveloperRank.NEWCOMER,
            totalContributions: 0,
            totalRewards: 0,
            securityFindings: 0,
            criticalFindings: 0,
            codeQualityScore: 75, // Starting score
            communityScore: 0,
            reputationScore: 0,
            isCoreDeveloper: false,
            specialization: "",
            joinDate: block.timestamp,
            lastActiveDate: block.timestamp,
            mentorshipPoints: 0,
            achievements: new uint256[](0)
        });
    }
    
    /**
     * @notice Check and update developer rank
     */
    function _checkRankPromotion(address developer) internal {
        DeveloperProfile storage profile = developers[developer];
        DeveloperRank oldRank = profile.rank;
        DeveloperRank newRank = _calculateRank(profile);
        
        if (newRank != oldRank) {
            profile.rank = newRank;
            emit DeveloperRankUpdated(developer, oldRank, newRank);
        }
    }
    
    /**
     * @notice Calculate developer rank based on contributions
     */
    function _calculateRank(DeveloperProfile memory profile) internal pure returns (DeveloperRank) {
        // Security track
        if (profile.securityFindings >= 100) return DeveloperRank.SECURITY_LEGEND;
        if (profile.securityFindings >= 25) return DeveloperRank.SECURITY_EXPERT;
        if (profile.securityFindings >= 10) return DeveloperRank.SECURITY_RESEARCHER;
        
        // Development track
        if (profile.isCoreDeveloper) return DeveloperRank.CORE_DEVELOPER;
        if (profile.totalContributions >= 50 && profile.codeQualityScore >= 90) {
            return DeveloperRank.TRUSTED_DEVELOPER;
        }
        if (profile.totalContributions >= 20) return DeveloperRank.CONTRIBUTOR;
        if (profile.totalContributions >= 5) return DeveloperRank.CONTRIBUTOR;
        
        return DeveloperRank.NEWCOMER;
    }
    
    /**
     * @notice Check and award achievements
     */
    function _checkAchievements(address developer) internal {
        DeveloperProfile storage profile = developers[developer];
        
        // First contribution achievement
        if (profile.totalContributions == 1) {
            _awardAchievement(developer, 1); // FIRST_BLOOD
        }
        
        // Major milestones
        if (profile.totalContributions == 10) {
            _awardAchievement(developer, 2); // DEDICATED_CONTRIBUTOR
        }
        
        if (profile.totalContributions == 100) {
            _awardAchievement(developer, 3); // CENTURION
        }
        
        // Quality achievements
        if (profile.codeQualityScore >= 95) {
            _awardAchievement(developer, 4); // QUALITY_CHAMPION
        }
    }
    
    /**
     * @notice Check security-specific achievements
     */
    function _checkSecurityAchievements(address researcher) internal {
        DeveloperProfile storage profile = developers[researcher];
        
        if (profile.securityFindings == 1) {
            _awardAchievement(researcher, 10); // SECURITY_SCOUT
        }
        
        if (profile.criticalFindings == 1) {
            _awardAchievement(researcher, 11); // CRITICAL_FINDER
        }
        
        if (profile.securityFindings == 25) {
            _awardAchievement(researcher, 12); // SECURITY_GUARDIAN
        }
    }
    
    /**
     * @notice Award achievement to developer
     */
    function _awardAchievement(address developer, uint256 achievementId) internal {
        developers[developer].achievements.push(achievementId);
        emit AchievementUnlocked(developer, achievementId);
        
        // Award bonus tokens for achievements
        uint256 bonus = _getAchievementBonus(achievementId);
        if (bonus > 0) {
            require(swordToken.transfer(developer, bonus), "Achievement bonus failed");
            emit RewardDistributed(developer, bonus, "Achievement");
        }
    }
    
    /**
     * @notice Calculate reputation score
     */
    function _calculateReputationScore(DeveloperProfile memory profile) internal pure returns (uint256) {
        uint256 score = 0;
        score += profile.totalContributions * 10;
        score += profile.securityFindings * 50;
        score += profile.criticalFindings * 200;
        score += profile.codeQualityScore;
        score += profile.communityScore * 5;
        
        return score;
    }
    
    /**
     * @notice Get achievement bonus amount
     */
    function _getAchievementBonus(uint256 achievementId) internal pure returns (uint256) {
        if (achievementId == 1) return 500;  // First contribution
        if (achievementId == 2) return 2000; // 10 contributions
        if (achievementId == 3) return 10000; // 100 contributions
        if (achievementId == 4) return 5000;  // Quality champion
        if (achievementId == 10) return 1000; // First security finding
        if (achievementId == 11) return 5000; // First critical finding
        if (achievementId == 12) return 25000; // Security guardian
        
        return 0;
    }
    
    // Helper functions for complexity and impact calculation
    function calculateComplexity(uint256 linesOfCode, Severity severity) public pure returns (uint256) {
        return linesOfCode * (uint256(severity) + 1);
    }
    
    function calculateImpact(ContributionType contributionType, Severity severity) public pure returns (uint256) {
        uint256 baseImpact = uint256(severity) + 1;
        
        if (contributionType == ContributionType.SECURITY_FINDING) {
            return baseImpact * 3;
        } else if (contributionType == ContributionType.BUG_FIX) {
            return baseImpact * 2;
        }
        
        return baseImpact;
    }
    
    // View functions
    function getDeveloperProfile(address developer) external view returns (DeveloperProfile memory) {
        return developers[developer];
    }
    
    function getDeveloperContributions(address developer) external view returns (uint256[] memory) {
        return developerContributions[developer];
    }
    
    function getContribution(uint256 contributionId) external view returns (Contribution memory) {
        return contributions[contributionId];
    }
    
    function getSecurityBounty(uint256 bountyId) external view returns (SecurityBounty memory) {
        return securityBounties[bountyId];
    }
}