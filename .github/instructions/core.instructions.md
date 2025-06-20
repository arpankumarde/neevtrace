# Core Coding Instructions & Best Practices

## Code Quality Standards

### 1. Code Structure & Organization

- **Single Responsibility Principle**: Each function/class should have one clear purpose
- **DRY (Don't Repeat Yourself)**: Extract common logic into reusable functions/modules
- **Consistent naming conventions**: Use descriptive, self-documenting variable and function names
- **Proper file organization**: Group related functionality into logical modules/directories
- Keep functions small and focused on a single task
- Use descriptive variable and function names

### 2. Consistent Style & Formatting

- Follow a consistent coding style (indentation, spacing, brackets)
- Use linters and formatters (ESLint, Prettier) to enforce style rules
- Stick to a naming convention (camelCase for JS, snake_case for Python)
- Keep lines under 80-120 characters
- Organize imports logically and consistently

### 3. Error Handling & Validation

- Always validate and sanitize user input
- Use try-catch blocks to handle exceptions gracefully
- Provide meaningful, actionable error messages
- Implement proper HTTP status codes for API responses
- Log errors with sufficient context for debugging

### 4. Security Best Practices

- **Input validation**: Sanitize all user inputs to prevent injection attacks
- **Authentication & Authorization**: Implement proper access controls
- **Environment variables**: Store sensitive data securely, never in code
- **SQL injection prevention**: Use parameterized queries
- **XSS protection**: Escape output and validate inputs
- Regularly update dependencies to patch vulnerabilities

### 5. Testing & Quality Assurance

- Write unit tests for critical functions
- Use test-driven development (TDD) practices when appropriate
- Include integration tests for component interactions
- Test edge cases and error scenarios
- Maintain meaningful test coverage (80%+ for critical paths)
- Regularly run tests to catch regressions

### 6. Documentation & Comments

- Maintain clear and up-to-date documentation
- Write comments to explain complex logic and business rules
- Use JSDoc or similar for function documentation
- Include API documentation with parameters and responses
- Provide setup, usage, and deployment instructions in README
- Include examples and use cases in documentation

### 7. Performance & Optimization

- Optimize algorithms for efficiency where needed
- Avoid premature optimization; focus on readability first
- Use profiling tools to identify actual bottlenecks
- Implement appropriate caching strategies
- Use lazy loading for data when applicable
- Manage memory properly and clean up resources

### 8. Version Control & Collaboration

- Use Git for all code changes with atomic commits
- Write clear, descriptive commit messages
- Use meaningful branch names (feature/, bugfix/, hotfix/)
- Conduct code reviews for all changes before merging
- Share knowledge and improve quality through collaborative reviews

### 9. Environment & Configuration Management

- Maintain separate configurations for dev/staging/production
- Use environment variables for configuration
- Never commit sensitive information to version control
- Keep dependencies updated and minimal
- Use dependency managers appropriately

### 10. Monitoring & Observability

- Implement structured logging with appropriate levels
- Set up health checks and endpoint monitoring
- Track key performance indicators and metrics
- Implement error monitoring and alerting systems

## Technology-Specific Guidelines

### Node.js/JavaScript

- Use modern ES6+ features appropriately
- Implement proper async/await error handling
- Consider TypeScript for type safety in larger projects
- Follow npm security best practices

### Database Operations

- Use migrations for schema changes
- Implement proper connection pooling
- Use transactions for related operations
- Plan for backup and recovery procedures

### API Development

- Follow RESTful principles and conventions
- Implement proper rate limiting
- Use appropriate HTTP methods and status codes
- Version APIs properly for backward compatibility

## Code Review Checklist

- [ ] Code follows project conventions and standards
- [ ] Security vulnerabilities have been addressed
- [ ] Error handling is comprehensive and appropriate
- [ ] Performance implications have been considered
- [ ] Tests are included and passing
- [ ] Documentation is updated where necessary
- [ ] No sensitive information is exposed
- [ ] Code is readable and maintainable
