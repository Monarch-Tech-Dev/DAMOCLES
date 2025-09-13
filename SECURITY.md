# Security Policy

## Reporting Security Vulnerabilities

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them responsibly by emailing: **security@damocles.no**

Include the following information in your report:
- Description of the vulnerability
- Steps to reproduce  
- Potential impact assessment
- Suggested fix (if available)

We will respond to security reports within 48 hours and provide regular updates on our progress.

## Security Measures

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token handling
- **BankID integration** for verified Norwegian identity  
- **Role-based access control** for different user types
- **Session management** with automatic token refresh

### 🛡️ Data Protection  
- **GDPR compliance** by design and default
- **Data minimization** - we only collect necessary data
- **Encryption at rest** for sensitive personal information
- **Secure data transmission** via HTTPS/TLS

### 🏗️ Infrastructure Security
- **Environment separation** (development/staging/production)
- **Secret management** via environment variables
- **Database security** with parameterized queries  
- **API rate limiting** to prevent abuse

## Contact

- **Security Email**: security@damocles.no
- **General Contact**: contact@damocles.no  
- **Emergency**: Include "URGENT" in subject line

Thank you for helping keep DAMOCLES and our users secure!
