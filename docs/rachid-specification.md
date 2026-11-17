# **MASTER SOFTWARE ENGINEERING TASK**

## **Project: Bill Splitting & Expense Management Application**

**Role:** Master Software Engineer / Senior Software Architect  
**Project Type:** Full-Stack Mobile Application  
**Project Objective:** Design, architect, develop, test, and document a scalable, secure, and user-friendly application for managing shared expenses and splitting bills between multiple people.


# **1. PROJECT VISION**

Design and develop a mobile application that simplifies the management of shared expenses between individuals and groups.

The application must allow users to:

- Create and manage groups.

- Invite participants.

- Register shared expenses.

- Split expenses equally or using customized allocation rules.

- Automatically calculate individual balances.

- Track outstanding debts and payments.

- Calculate the optimal settlement between participants.

- Generate expense reports.

The application must eliminate manual calculations and provide complete financial transparency within each group.

The application must support English, Portuguese and Spanish languages

The solution must be designed with scalability, maintainability, security, and a high-quality user experience as fundamental architectural principles.

# **2. CORE FUNCTIONAL REQUIREMENTS**

Implement the following modules.

## **2.1 User Management**

- User registration using email and password.

- Secure authentication.

- Password recovery.

- Profile management.

- Session management.

- Support for Google and Apple authentication where applicable.

## **2.2 Group Management**

- Create, edit, and delete groups.

- Define group names and descriptions.

- Invite participants.

- Accept or reject invitations.

- Add or remove participants.

- Maintain group membership history.

- Support different group categories:

  - Household.

  - Friends.

  - Travel.

  - Events.

  - Restaurants.

  - Other.

## **2.3 Expense Management**

Allow authorized group members to register expenses.

Each expense must support:

- Description.

- Total amount.

- Currency.

- Date and time.

- Expense category.

- Person responsible for payment.

- Participating members.

- Optional notes.

- Attachments or receipt images.

Implement expense editing, deletion, and historical tracking.

## **2.4 Expense Splitting Engine**

Develop a reliable financial calculation engine supporting:

**A. Equal splitting** Divide the total expense equally among selected participants.

**B. Percentage splitting** Allow users to define individual percentage allocations.

**C. Custom amount splitting** Allow users to specify the exact amount assigned to each participant.

**D. Itemized splitting** Allow individual participants to be assigned specific items from a shared receipt.

**E. Unequal participation** Allow participants to be included or excluded from individual expenses.

All calculations must:

- Use decimal-safe monetary arithmetic.

- Handle currency precision and rounding correctly.

- Guarantee that the sum of allocations equals the original expense.

- Validate allocations before saving.

- Maintain an auditable calculation history.

## **2.5 Balance Calculation Engine**

Develop a centralized service responsible for calculating financial positions.

For each participant, calculate:

- Total amount paid.

- Total amount consumed.

- Total amount owed.

- Total amount receivable.

- Net financial balance.

The system must automatically recalculate balances whenever an expense or payment is created, modified, or deleted.

Avoid storing independently editable balance values. Balances should be derived from validated financial transactions.

## **2.6 Debt Settlement Optimization**

Implement an algorithm capable of minimizing the number of transactions required to settle outstanding debts.

Example:

Four participants share expenses:

| **Participant** | **Net Balance** |
| :-: | :-: |
| Alice | +R$ 90 |
| Bob | -R$ 40 |
| Carol | -R$ 30 |
| David | -R$ 20 |

Expected settlement:

- Bob pays Alice R$ 40.

- Carol pays Alice R$ 30.

- David pays Alice R$ 20.

The application must generate settlement suggestions automatically.

The algorithm must:

- Support multiple creditors and debtors.

- Avoid unnecessary transactions.

- Guarantee that the proposed settlements clear all net balances.

- Handle monetary rounding.

- Allow users to confirm or reject suggested settlements.

## **2.7 Payment Management**

Implement a payment tracking module.

Features:

- Register payments between participants.

- Define payer and receiver.

- Record amount, date, currency, and payment method.

- Support PIX as a payment method.

- Mark payments as pending, confirmed, rejected, or cancelled.

- Maintain payment history.

- Prevent duplicate payment registration.

- Recalculate balances after confirmed payments.

Important: Recording a payment in the application must not automatically imply that an external bank transaction has occurred. External payment integrations must have independent confirmation mechanisms.

## **2.8 Dashboard**

Develop a dashboard providing:

- Total amount owed by the current user.

- Total amount owed to the current user.

- Active groups.

- Recent expenses.

- Pending payments.

- Recent settlements.

- Quick access to expense registration.

## **2.9 Reporting and Analytics**

Implement reporting capabilities:

- Total expenses per group.

- Individual spending.

- Expenses by category.

- Monthly summaries.

- Payment history.

- Outstanding balances.

- Export reports to PDF and Excel.

## **2.10 Notification System**

Implement notifications for:

- New group invitations.

- New expenses.

- Changes to existing expenses.

- New payment requests.

- Payment confirmations.

- Outstanding debts.

- Completed settlements.

Support push notifications and in-app notifications.


# **3. NON-FUNCTIONAL REQUIREMENTS**

The application must comply with the following quality requirements.

| **Category** | **Requirement** |
| :-: | :-: |
| Performance | Standard API requests should target a response time below 500 ms at the 95th percentile under expected load. |
| Availability | Target 99.5% service availability. |
| Security | Use secure authentication, authorization, and encrypted communications. |
| Privacy | Users must only access information they are authorized to view. |
| Scalability | Architecture must support increasing numbers of users and transactions. |
| Maintainability | Implement modular architecture and clear separation of responsibilities. |
| Reliability | Financial operations must be transactionally consistent. |
| Compatibility | Support current Android and iOS versions. |
| Accessibility | Follow recognized mobile accessibility guidelines. |
| Localization | Support Portuguese (Brazil) and English. |
| Currency | Support BRL initially, with an extensible multi-currency architecture. |

# **4. SOFTWARE ARCHITECTURE**

Design the application using a modular, layered architecture.

Recommended architecture:

**Frontend**

- Flutter or React Native.

- Component-based interface.

- Centralized state management.

- Responsive layouts.

**Backend**

- Node.js with NestJS.

- REST API.

- Modular service architecture.

- Input validation.

- Authentication and authorization middleware.

**Database**

- PostgreSQL.

- Relational data modeling.

- Database migrations.

- Referential integrity.

- Transaction management.

**Infrastructure**

- Docker.

- CI/CD pipeline.

- Cloud hosting.

- Automated backups.

- Centralized logging.

- Monitoring and alerting.

**Integrations**

- Firebase Cloud Messaging.

- Email delivery provider.

- PIX integration through a suitable financial service provider.

- Cloud storage for receipt images.

The architecture must avoid unnecessary complexity and should be appropriate for the expected initial user base while allowing future expansion.

# **5. DATABASE DESIGN**

Design and implement a normalized relational database.

Required entities:

1. Users

2. Groups

3. GroupMembers

4. GroupInvitations

5. Expenses

6. ExpenseSplits

7. ExpenseItems

8. ExpenseItemSplits

9. Payments

10. PaymentConfirmations

11. Categories

12. Notifications

13. AuditLogs

Define:

- Primary keys.

- Foreign keys.

- Unique constraints.

- Appropriate indexes.

- Creation and modification timestamps.

- Soft deletion where appropriate.

- Referential integrity rules.

All financial records must have traceability.

Do not permanently erase financial history when an expense or payment is cancelled or reversed.

# **6. API DEVELOPMENT**

Design a REST API following consistent naming conventions and versioning.

Suggested endpoints:

**Authentication**

- POST /api/v1/auth/register

- POST /api/v1/auth/login

- POST /api/v1/auth/logout

- POST /api/v1/auth/forgot-password

**Groups**

- GET /api/v1/groups

- POST /api/v1/groups

- GET /api/v1/groups/:id

- PUT /api/v1/groups/:id

- DELETE /api/v1/groups/:id

- POST /api/v1/groups/:id/members

**Expenses**

- GET /api/v1/groups/:id/expenses

- POST /api/v1/groups/:id/expenses

- GET /api/v1/expenses/:id

- PUT /api/v1/expenses/:id

- DELETE /api/v1/expenses/:id

**Balances**

- GET /api/v1/groups/:id/balances

- GET /api/v1/groups/:id/settlements

**Payments**

- POST /api/v1/payments

- GET /api/v1/payments/:id

- POST /api/v1/payments/:id/confirm

- POST /api/v1/payments/:id/cancel

**Reports**

- GET /api/v1/groups/:id/reports

- GET /api/v1/groups/:id/reports/export

Document all endpoints using OpenAPI/Swagger.

# **7. SECURITY REQUIREMENTS**

Implement security following industry best practices.

Mandatory controls:

- Secure password hashing.

- Token-based authentication.

- Role-based or permission-based authorization.

- Input validation and sanitization.

- Protection against SQL injection.

- Protection against unauthorized access to group resources.

- Rate limiting.

- Secure secret management.

- HTTPS.

- Audit logging.

- Secure file uploads.

- Data backup and recovery procedures.

Pay particular attention to financial data integrity and authorization boundaries between groups.

For Brazilian operations, evaluate applicable LGPD requirements.

# **8. USER INTERFACE AND EXPERIENCE**

Create a clean, modern, intuitive interface.

Design principles:

- Minimalist design.

- Simple navigation.

- Clear financial indicators.

- Easy expense registration.

- Visual distinction between amounts owed and amounts receivable.

- Accessible typography.

- Consistent colors and components.

Recommended primary navigation:

1. Home

2. Groups

3. Add Expense

4. Balances

5. Profile

The user must be able to register a basic shared expense in as few steps as reasonably possible.

# **9. TESTING STRATEGY**

Develop a comprehensive automated testing strategy.

**Unit Testing**

- Expense splitting calculations.

- Percentage allocations.

- Custom allocations.

- Currency rounding.

- Balance calculations.

- Settlement optimization.

**Integration Testing**

- Authentication.

- Group management.

- Expense registration.

- Payment registration.

- Database consistency.

- Notifications.

**End-to-End Testing**

- User registration.

- Group creation.

- Participant invitations.

- Expense registration.

- Bill splitting.

- Balance visualization.

- Debt settlement.

**Security Testing**

- Authentication bypass attempts.

- Unauthorized group access.

- Permission escalation.

- Input validation.

- API rate limiting.

Financial calculation tests must include edge cases involving fractional currency values, zero balances, multiple creditors, and partially settled expenses.

# **10. DEVELOPMENT PHASES**

Execute the project in the following phases.

| **Phase** | **Deliverable** |
| :-: | :-: |
| 1. Discovery | Requirements analysis and technical specifications. |
| 2. Architecture | System architecture, database schema, and API contracts. |
| 3. UX/UI | Wireframes, prototypes, and design system. |
| 4. Foundation | Project setup, authentication, and infrastructure. |
| 5. Core Development | Groups, participants, expenses, and splitting engine. |
| 6. Financial Engine | Balance calculation and debt settlement optimization. |
| 7. Payments | Payment tracking and PIX integration assessment. |
| 8. Dashboard | Reports, analytics, and notifications. |
| 9. Quality Assurance | Automated testing, security testing, and performance validation. |
| 10. Deployment | Production deployment, monitoring, and documentation. |

# **11. MVP ACCEPTANCE CRITERIA**

The first production-ready version will only be considered complete when:

1. Users can register and authenticate securely.

2. Users can create groups and invite participants.

3. Users can register shared expenses.

4. Expenses can be split equally or using customized amounts.

5. The application calculates balances correctly.

6. Participants can see who owes whom.

7. The application generates settlement suggestions.

8. Payments can be registered and tracked.

9. Balances are updated consistently after confirmed payments.

10. Users cannot access unauthorized groups or financial records.

11. Automated tests cover the critical financial calculation logic.

12. API and technical documentation are available.

13. The application can be deployed to a production environment.

# **12. ENGINEERING EXECUTION INSTRUCTIONS**

Act as the principal software architect and lead engineer responsible for the entire project.

Follow these instructions:

1. Analyze the complete requirements before implementation.

2. Identify ambiguities, technical risks, and missing requirements.

3. Define the system architecture before writing application code.

4. Produce the database schema and entity relationships.

5. Define API contracts before implementing frontend integration.

6. Establish coding standards and project conventions.

7. Implement functionality in small, independently testable modules.

8. Prioritize financial correctness and data integrity.

9. Write automated tests alongside implementation.

10. Review security and authorization at every development stage.

11. Maintain technical documentation throughout development.

12. Avoid unnecessary dependencies and overengineering.

13. Do not implement mock functionality as if it were production-ready.

14. Never consider a feature complete without appropriate tests.

15. Report implementation progress, outstanding issues, and technical decisions.

# **13. FINAL DELIVERABLES**

The completed project must include:

- Fully functional mobile application.

- Backend application.

- Database schema and migrations.

- REST API.

- OpenAPI/Swagger documentation.

- Automated test suite.

- Deployment configuration.

- Environment configuration documentation.

- Architecture documentation.

- Database relationship diagram.

- User documentation.

- Production deployment instructions.

# **14. DEFINITION OF SUCCESS**

The project is successful when a group of people can use the application to manage shared expenses from beginning to end without requiring manual calculations.

The application must guarantee that:

- Every expense is traceable.

- Every participant's financial position is transparent.

- Every split is mathematically correct.

- Every confirmed payment is properly recorded.

- Every balance can be independently reconstructed from financial records.

- Every settlement suggestion preserves the group's financial equilibrium.

**FINAL ENGINEERING PRINCIPLE:**

Build this application as a reliable financial management product, not merely as a calculator with a graphical interface.

Prioritize correctness, transparency, simplicity, security, and long-term maintainability.


# ADDENDUM 01 – MULTILINGUAL SUPPORT & DB-LESS ALPHA RELEASE

## 15. THREE-LANGUAGE SUPPORT (MANDATORY)

The application must support three languages from its initial development.

### 15.1 Supported Languages

The initial supported languages are:

1. Portuguese (Brazil) – pt-BR (Default language).

2. English – en-US.

3. Spanish – es-ES.

The architecture must allow additional languages to be introduced without modifying the application's business logic.

### 15.2 Internationalization (i18n) Requirements

Implement a centralized internationalization architecture.

Requirements:

- All user-facing text must be externalized into translation resource files.

- No hardcoded interface text is permitted.

- All screens, menus, buttons, notifications, error messages, and validation messages must support all three languages.

- Language selection must be available in application settings.

- Automatically detect the device's preferred language on first launch.

- Allow users to override the automatically detected language.

- Persist the selected language between application sessions.

- Support language changes without requiring application reinstallation.

- Provide a fallback mechanism when a translation is missing.

### 15.3 Localization Requirements

Language support must include more than translating text.

The application must correctly handle:

| **Element** | **pt-BR** | **en-US** | **es-ES** |
| :-: | :-: | :-: | :-: |
| Currency | R$ 1.250,50 | $1,250.50 | 1.250,50 € |
| Date | 16/11/2026 | 11/16/2026 | 16/11/2026 |
| Decimal separator | , | . | , |
| Thousands separator | . | , | . |
| Language | Portuguese | English | Spanish |

Currency and number formatting must use locale-aware libraries.

Important: Currency must be stored independently from its display format. Never use localized strings for financial calculations.

### 15.4 Translation Management

Create separate translation resources for each supported language.

Suggested structure:

- locales/pt-BR.json

- locales/en-US.json

- locales/es-ES.json

Organize translations into logical sections:

- Common elements.

- Authentication.

- Dashboard.

- Groups.

- Participants.

- Expenses.

- Payments.

- Balances.

- Reports.

- Notifications.

- Validation messages.

- Error messages.

### 15.5 Acceptance Criteria

The multilingual implementation is complete when:

1. All application screens are available in all three languages.

2. Users can manually change languages.

3. Language preferences persist after restarting the application.

4. Device language detection works correctly.

5. Dates, numbers, and currencies follow the selected locale.

6. No hardcoded user-facing strings remain.

7. Missing translations are handled gracefully.


# 16. DB-LESS ALPHA / EVALUATION RELEASE

## 16.1 Objective

Before implementing the complete production architecture, develop a simplified Alpha/Evaluation version of the application.

The purpose is to validate:

- Product concept.

- User experience.

- Application navigation.

- Expense registration workflow.

- Bill splitting calculations.

- Balance visualization.

- Settlement suggestions.

- Multilingual functionality.

This version must be lightweight, fast to implement, and suitable for demonstrations and early user feedback.

**Critical requirement: The Alpha version must operate without a database or backend infrastructure.**

## 16.2 Technical Architecture

Implement a standalone application using:

- Flutter or React Native.

- Local in-memory application state.

- Preconfigured demonstration data.

- Local calculation services.

- No backend API.

- No database.

- No authentication server.

- No cloud infrastructure.

All calculations must run locally on the device.

The architecture must separate the business logic from the user interface to facilitate future migration to the production architecture.

## 16.3 Alpha Features

Implement only the essential functionality.

### A. Dashboard

- Overview of expenses.

- Total amount owed.

- Total amount receivable.

- Active demonstration groups.

- Recent transactions.

### B. Group Management

- Create groups.

- Add participants.

- Edit group information.

- Remove participants.

Groups and participants should exist only in application memory during the Alpha session.

### C. Expense Management

- Register expenses.

- Select the person who paid.

- Select participants.

- Define expense descriptions.

- Set expense amounts.

- Select expense categories.

### D. Expense Splitting

Implement:

- Equal splitting.

- Custom amount splitting.

- Percentage splitting.

### E. Balance Calculation

- Calculate individual balances.

- Display who owes whom.

- Update balances immediately when expenses change.

### F. Settlement Suggestions

- Calculate optimized payment suggestions.

- Minimize the number of transactions.

- Allow demonstration of payment settlements.

- Update balances after simulated payments.

### G. Multilingual Interface

All three supported languages must be functional:

- Portuguese (Brazil).

- English.

- Spanish.

### H. Demo Data

Include preconfigured examples to make application evaluation easier.

Suggested demonstration scenario:

A group of four friends sharing:

- Dinner.

- Transportation.

- Accommodation.

- Groceries.

Allow evaluators to explore the application immediately without creating an account.

## 16.4 Data Persistence

The Alpha version must not require a database.

Default behavior:

- Application state is stored in memory.

- Data is initialized using predefined demonstration scenarios.

- A reset function restores the original demonstration data.

- Restarting the application resets the session.

Local persistence should not be introduced unless explicitly approved as a separate requirement.

## 16.5 Alpha User Experience

The Alpha version must look and feel like a real application, not a technical prototype.

Requirements:

- Professional interface.

- Consistent visual identity.

- Responsive layouts.

- Functional navigation.

- Interactive controls.

- Real-time calculation updates.

- Clear financial indicators.

- Language switching.

- No non-functional buttons.

- No unnecessary registration screens.

All financial calculations must use the same business rules intended for the production application.

## 16.6 Alpha Acceptance Criteria

The Alpha release is accepted when:

1. The application can run without a backend.

2. No database is required.

3. Users can create demonstration groups.

4. Users can register expenses.

5. Users can split expenses using the three supported methods.

6. Balances are calculated correctly.

7. Settlement suggestions work correctly.

8. Simulated payments update balances.

9. All three languages are functional.

10. Demonstration data can be reset.

11. Core functionality works without an internet connection.

12. The application can be installed and demonstrated on target mobile devices.


# 17. TWO-STAGE DEVELOPMENT STRATEGY

The project must be executed in two distinct stages.

## STAGE 1 – ALPHA / EVALUATION RELEASE

**Objective:** Validate the product concept and user experience.

Deliverables:

- Functional mobile application.

- Database-free architecture.

- In-memory data management.

- Core bill splitting engine.

- Balance calculations.

- Settlement optimization.

- Three-language support.

- Demonstration scenarios.

- Installable evaluation build.

Success criteria:

The application must demonstrate the complete expense-sharing workflow without requiring accounts, servers, or external infrastructure.

## STAGE 2 – PRODUCTION RELEASE

**Objective:** Transform the validated Alpha application into a complete production-grade financial management platform.

Implement:

- Backend services.

- PostgreSQL database.

- User authentication.

- Cloud synchronization.

- Group invitations.

- Persistent expense history.

- Payment tracking.

- PIX integration assessment.

- Notifications.

- Reporting and analytics.

- Security controls.

- Automated deployment.

- Production monitoring.

The production application must preserve the business logic and user experience validated during Stage 1.


# 18. ARCHITECTURAL CONSTRAINTS AND MIGRATION STRATEGY

The Alpha release must be designed with future production migration in mind.

Mandatory engineering principles:

1. Separate UI components from business logic.

2. Implement expense calculations as independent services.

3. Define clear interfaces for data access.

4. Use repository abstractions even when the Alpha implementation operates entirely in memory.

5. Avoid direct database dependencies in business logic.

6. Keep localization independent from application functionality.

7. Maintain consistent financial calculation rules across Alpha and Production.

8. Avoid implementing temporary shortcuts that compromise future architecture.

### Recommended architecture

**Alpha:**

UI → Application Services → Domain Logic → In-Memory Repository

**Production:**

UI → Application Services → Domain Logic → API → Backend Services → PostgreSQL

The domain logic should remain reusable between both versions wherever practical.


# 19. UPDATED PROJECT PRIORITIES

The development priority is now:

| **Priority** | **Deliverable** |
| :-: | :-: |
| P0 | Define architecture and core financial calculation rules |
| P0 | Establish three-language infrastructure |
| P0 | Develop database-free Alpha |
| P0 | Implement expense splitting and balance calculations |
| P0 | Implement settlement optimization |
| P1 | Conduct user evaluation and collect feedback |
| P1 | Refine UX/UI based on evaluation |
| P1 | Design production database and backend |
| P1 | Implement production authentication and persistence |
| P2 | Implement notifications and reporting |
| P2 | Assess PIX integration |
| P2 | Production deployment and monitoring |

# 20. FINAL INSTRUCTIONS TO THE MASTER SOFTWARE ENGINEER

Do not begin by building the complete production infrastructure.

First, deliver a fully interactive, database-free Alpha application that demonstrates the essential product functionality.

The Alpha version must be sufficiently polished to be presented to potential users, stakeholders, and investors.

Use the Alpha development process to validate product assumptions, identify usability problems, and refine the financial workflows.

After evaluation and approval, proceed with the production implementation.

**The three-language architecture is mandatory from the beginning and must not be postponed to a future development phase.**

**The Alpha and Production versions must share the same financial business rules to prevent discrepancies between evaluation and production behavior.**

The ultimate goal is to minimize initial development costs and technical risk while preserving a clear path toward a scalable, production-ready application.


