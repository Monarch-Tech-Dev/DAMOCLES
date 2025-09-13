# Contributing to DAMOCLES

Thank you for your interest in contributing to DAMOCLES! We welcome contributions from developers, legal experts, consumer advocates, and community members who share our mission of empowering consumers through technology.

## Code of Conduct

This project adheres to our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues as you might find that someone else has already reported the same problem.

**When filing a bug report, please include:**
- A clear and descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node.js version)
- Error logs or console output

### 💡 Suggesting Features

We encourage feature suggestions that align with our mission of consumer protection and transparency.

**Feature requests should include:**
- A clear description of the problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered
- How this benefits consumer protection

### 🔧 Code Contributions

#### Development Setup

1. **Fork the repository**
   ```bash
   gh repo fork Monarch-Tech-Dev/DAMOCLES
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/DAMOCLES.git
   cd DAMOCLES
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

#### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow our coding standards
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Commit your changes**
   ```bash
   git commit -m "feat: add description of your feature"
   ```
   
   Follow [Conventional Commits](https://conventionalcommits.org/) format:
   - `feat:` new features
   - `fix:` bug fixes
   - `docs:` documentation changes
   - `style:` formatting changes
   - `refactor:` code refactoring
   - `test:` adding tests
   - `chore:` maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use our PR template
   - Link related issues
   - Provide clear description of changes
   - Include testing instructions

### 📚 Documentation

Help improve our documentation by:
- Fixing typos or unclear explanations
- Adding examples and use cases
- Translating docs to other languages
- Creating video tutorials or guides

### 🔒 Security

Please report security vulnerabilities privately via email to security@damocles.no. See our [Security Policy](SECURITY.md) for details.

## Development Guidelines

### 🎨 Coding Standards

#### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Prefer functional programming patterns
- Write self-documenting code with clear variable names

#### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Follow component naming conventions
- Write comprehensive prop types
- Ensure accessibility compliance

#### API Design
- Follow RESTful conventions
- Use proper HTTP status codes
- Implement comprehensive error handling
- Document all endpoints
- Validate input data

#### Database
- Use Prisma schema for all changes
- Write reversible migrations
- Follow naming conventions
- Index frequently queried fields
- Consider data privacy implications

### 🧪 Testing Requirements

- **Unit tests**: Required for all business logic
- **Integration tests**: Required for API endpoints
- **E2E tests**: Required for critical user flows
- **Security tests**: Required for authentication and data handling
- **Performance tests**: Required for database queries

Aim for 80%+ test coverage on new code.

### 📦 Pull Request Process

1. **PR Checklist:**
   - [ ] Tests pass locally
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] Breaking changes documented

2. **Review Process:**
   - Code reviewed by at least one maintainer
   - Security review for authentication/data changes
   - Performance review for database changes
   - All CI checks must pass

3. **Merge Requirements:**
   - Approved by maintainer
   - All checks passing
   - No conflicts with base branch
   - Squash merge preferred

## SWORD Token Rewards

Contributors can earn SWORD tokens for valuable contributions:

### 🏆 Reward Tiers

| Contribution Type | Reward Range | Criteria |
|------------------|--------------|----------|
| Critical bug fixes | 500-10,000 SWORD | Severity and impact |
| New features | 1,000-25,000 SWORD | Complexity and value |
| Security improvements | 1,000-250,000 SWORD | Risk prevented |
| Documentation | 100-2,000 SWORD | Quality and completeness |
| Community support | 50-1,000 SWORD | Helpfulness |

### 📊 Evaluation Criteria

- **Impact**: How much does this benefit users?
- **Quality**: Code quality, testing, documentation
- **Innovation**: Creative solutions to complex problems
- **Alignment**: Fits with project mission and values

## Community

### 💬 Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord** (Coming soon): Real-time community chat
- **Email**: security@damocles.no for security issues

### 🤝 Recognition

Outstanding contributors may be:
- Featured in release notes
- Invited to join core team
- Recognized in community channels
- Eligible for governance participation

## Getting Help

- Check our [documentation](docs/)
- Search existing [issues](https://github.com/Monarch-Tech-Dev/DAMOCLES/issues)
- Join community discussions
- Reach out to maintainers

## License

By contributing to DAMOCLES, you agree that your contributions will be licensed under the AGPL-3.0 License.

---

**Together, we're building technology that empowers consumers and ensures fair treatment. Every contribution, no matter how small, helps create a more transparent and just financial system.**

*Last updated: September 2024*