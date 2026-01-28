# IO-ERP (Internal Operations ERP)
## System Design Document

---

## 1. Problem Statement

In many organizations, internal operational tasks are handled through informal channels such as emails, spreadsheets, or verbal instructions. These approaches lack visibility, consistency, and accountability. There is often no structured approval mechanism, no enforced workflow, and no reliable audit trail to track who created, executed, reviewed, or approved a task.

This leads to:
- Unauthorized task execution
- Missing or delayed approvals
- Poor traceability
- Compliance and accountability risks

The purpose of IO-ERP is to provide a controlled, auditable, and role-based internal task management system that enforces workflows and approvals at the system level rather than relying on trust or manual processes.

---

## 2. Objectives

The primary objectives of the IO-ERP system are:

- Enforce structured task workflows
- Implement role-based access control (RBAC)
- Ensure managerial approval before task completion
- Maintain a complete and immutable audit trail
- Provide visibility through role-specific dashboards
- Support document-based internal tasks
- Enforce data retention policies for completed work

---

## 3. Scope Definition

### 3.1 In Scope

The following features are included in the system:

- Creation and assignment of internal tasks
- Document attachment to tasks
- Submission of tasks for review
- Approval and rejection workflows
- Mandatory rejection comments
- Role-based dashboards (Employee, Manager/HR/Leader, Admin)
- Department-level task ownership
- Audit logging of all critical actions
- Task escalation for prolonged pending states
- Retention and cleanup of completed tasks

---

### 3.2 Out of Scope

The following features are intentionally excluded:

- Payroll or salary management
- Attendance tracking
- Inventory or asset management
- Accounting or billing
- External customer or vendor access
- Payment processing
- Advanced analytics or BI reporting

---

## 4. User Roles & Permissions

The system follows a strict Role-Based Access Control (RBAC) model. All authorization checks are enforced on the server side.

### 4.1 User Roles

**Employee**
- Executes assigned tasks
- Submits tasks for review
- Cannot approve or reject tasks

**Manager / Team Leader / HR**
- Creates tasks
- Assigns tasks to employees
- Reviews submitted tasks
- Approves or rejects tasks within their department

**Admin**
- Manages users and departments
- Has system-wide visibility
- Can view complete audit logs
- Does not execute tasks

---

### 4.2 Role–Action Matrix

|      Action               | Employee  | Manager / HR / Leader  | Admin |
|---------------------------|-----------|------------------------|-------|
| Create task               |    No     |          Yes           |  Yes  |
| Assign task               |    No     |          Yes           |   No  |
| Work on task              |   Yes     |           No           |   No  |
| Submit task               |   Yes     |           No           |   No  |
| Approve task              |    No     |          Yes           |   No  |
| Reject task (with reason) |    No     |          Yes           |   No  |
| Complete task             |    No     |          Yes           |   No  |
| View own tasks            |   Yes     |          Yes           |  Yes  |
| View department tasks     |    No     |          Yes           |  Yes  |
| Manage users/departments  |    No     |           No           |  Yes  |
| View audit logs           |    No     |         Limited        |  Yes  |

---

## 5. Task Workflow (Finite State Machine)

Tasks follow a strict finite state machine (FSM). State transitions are validated on the server and cannot be bypassed.

### 5.1 Task States

- **DRAFT** – Task created but not yet submitted
- **ASSIGNED** – Task assigned to an employee
- **IN_PROGRESS** – Employee working on task
- **SUBMITTED** – Task submitted for review
- **APPROVED** – Task approved by authorized reviewer
- **REJECTED** – Task rejected with comments
- **COMPLETED** – Task execution finished

---

### 5.2 State Transition Rules

- Tasks are created in `DRAFT` by Manager/HR/Leader
- Only assigned employees can move tasks to `SUBMITTED`
- Only authorized reviewers can approve or reject tasks
- Rejection requires a mandatory comment
- Rejected tasks return to `IN_PROGRESS`
- Approved tasks can be marked `COMPLETED`
- Core task details become read-only after submission
- Invalid state transitions are rejected by the server

---

## 6. Task Ownership Model

Each task maintains two distinct ownership fields:

- **created_by** – User who initiated the task
- **assigned_to** – User responsible for execution

Approval authority is determined by department ownership, not by task creator.

This separation reflects real organizational workflows.

---

## 7. Data Model Overview

A relational data model is used to enforce consistency, ownership, and traceability.

### 7.1 Core Entities

**User**
- id
- name
- email
- role
- department_id

**Department**
- id
- name
- manager_id

**Task**
- id
- title
- description
- status
- priority
- due_date
- created_by
- assigned_to
- department_id

**Approval**
- id
- task_id
- reviewer_id
- decision
- comment
- decided_at

**AuditLog**
- id
- task_id
- performed_by
- action
- previous_state
- new_state
- timestamp

---

### 7.2 Data Separation Principles

- Task table stores only current task state
- Approval table stores review decisions
- AuditLog stores complete historical activity
- Audit logs are immutable
- Tasks use soft delete to preserve history

---

## 8. Audit Logging Strategy

Every significant action generates an audit log entry, including:

- Task creation
- Assignment
- Submission
- Approval or rejection
- Escalation
- Completion

Audit logs capture:
- Who performed the action
- What action occurred
- State before and after
- Timestamp

Audit logs cannot be edited or deleted.

---

## 9. Escalation Rules

To prevent tasks from remaining pending indefinitely:

- Tasks in `SUBMITTED` or `IN_PROGRESS` beyond a threshold are escalated
- Escalation triggers notifications and audit entries
- Escalation does not auto-approve tasks

---

## 10. Retention Policy

- Completed tasks are retained for 12 months
- After retention expiry:
  - Tasks are automatically deleted
  - Associated documents are removed
- Audit logs are retained permanently

---

## 11. System Architecture

The system follows a server-centric architecture:

- Frontend handles presentation only
- Backend enforces:
  - Authentication
  - Authorization
  - Workflow rules
  - State transitions
  - Audit logging
- Database is the single source of truth
- All critical operations are transactional

---

## 12. Assumptions & Constraints

### Assumptions
- System is for internal organizational use only
- Each user belongs to exactly one department
- Each department has one manager
- Approvals are department-bound

### Constraints
- No external access
- No financial processing
- No workflow bypass
- No direct database manipulation from client

---

## 13. Implementation Phases

- **Week 1:** Design & setup (current phase)
- **Week 2:** Database schema & constraints
- **Week 3:** Authentication & authorization
- **Week 4–5:** Task and approval workflows
- **Week 6:** Audit logs, notifications, escalation
- **Week 7:** Dashboards & reporting
- **Week 8:** Retention, cleanup, testing

---

## 14. Design Freeze

This document represents the finalized system design.  
No functional changes will be introduced after this phase without explicit review and approval.

---