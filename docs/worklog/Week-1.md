# Week 1 Worklog – IO-ERP (Internal Operations ERP)


## Week Objective
Finalize requirements, system design, and begin project setup and understanding implemention of business logic and UI.


---


## Day 1 – Problem Definition & Scope
- Identified problems with informal internal task handling (emails, spreadsheets)
- Defined need for controlled workflows, approvals, and auditability
- Finalized problem statement
- Defined project scope (in-scope and out-of-scope features)


---


## Day 2 – Roles, Workflow & Data Design
- Defined user roles: Employee, Manager, Team Leader, HR, Admin
- Created role–action matrix for permissions
- Designed task lifecycle as a finite state machine (FSM)
- Defined rules for task approval, rejection, and completion
- Designed data model at a conceptual level
- Identified core entities: User, Department, Task, Approval, AuditLog
- Defined task ownership model (created_by vs assigned_to)
- Finalized escalation rules and retention requirements


---


## Day 3 – Project Setup
- Initialized Next.js project with TypeScript
- Created Supabase project
- Configured environment variables
- Set up Supabase client in the codebase
- Initialized Git repository and verified project structure


---


## Day 4 – Database Schema Implementation (Supabase)
- Implemented full PostgreSQL schema in Supabase based on finalized design
- Created enums for roles, task status, priority, and approval decisions
- Implemented core tables: organizations, departments, users, tasks, approvals, audit_logs, notifications, attachments
- Linked application users with Supabase Auth (auth.users)
- Handled circular dependencies (department manager relationship)
- Added soft delete support and audit-ready fields
- Implemented updated_at auto-update triggers
- Added performance indexes for frequently queried fields
- Validated schema using Supabase Schema Visualizer
- Enabled Row Level Security (RLS) on all tables


---