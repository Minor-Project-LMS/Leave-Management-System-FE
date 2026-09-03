-- Leave Management System (LMS)
-- PostgreSQL database/schema + dummy data
-- Generated from the uploaded LMS Database Design Document
--
-- Usage in pgAdmin 4:
-- 1. Create a database named: lms_db
-- 2. Open Query Tool for lms_db
-- 3. Run this entire file.
--
-- This script creates the public schema objects and inserts development/demo data.

BEGIN;

-- ============================================================
-- 01. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS user_roles (
    role_id SERIAL PRIMARY KEY,
    role_code VARCHAR(30) UNIQUE NOT NULL,
    role_description TEXT
);

CREATE TABLE IF NOT EXISTS org_departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    department_head_id BIGINT
);

CREATE TABLE IF NOT EXISTS app_users (
    user_id BIGSERIAL PRIMARY KEY,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    department_id INT NOT NULL,
    reports_to BIGINT,
    date_of_joining DATE NOT NULL,
    employment_status VARCHAR(20) NOT NULL
        CHECK (employment_status IN ('ACTIVE', 'ON_LEAVE', 'SEPARATED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    address TEXT,
    designation VARCHAR(100),
    work_location VARCHAR(100),
    employment_type VARCHAR(50),

    CONSTRAINT fk_app_users_role
        FOREIGN KEY (role_id) REFERENCES user_roles(role_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_app_users_department
        FOREIGN KEY (department_id) REFERENCES org_departments(department_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_app_users_reports_to
        FOREIGN KEY (reports_to) REFERENCES app_users(user_id)
        ON DELETE RESTRICT
);

ALTER TABLE org_departments
    ADD CONSTRAINT fk_org_departments_head
    FOREIGN KEY (department_head_id) REFERENCES app_users(user_id)
    ON DELETE RESTRICT;

CREATE TABLE IF NOT EXISTS leave_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL,
    is_paid BOOLEAN NOT NULL,
    requires_document BOOLEAN NOT NULL,
    default_annual_quota NUMERIC(5,2) NOT NULL,
    category_code VARCHAR(20),
    category_type VARCHAR(20),
    applicable_to VARCHAR(30) DEFAULT 'ALL_EMPLOYEES',
    status VARCHAR(10) DEFAULT 'ACTIVE',
    department_id INT,

    CONSTRAINT fk_leave_category_department
        FOREIGN KEY (department_id) REFERENCES org_departments(department_id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS leave_policies (
    policy_id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    department_id INT,
    annual_quota NUMERIC(5,2) NOT NULL,
    max_carry_forward NUMERIC(5,2) NOT NULL,
    min_notice_days INT NOT NULL,
    max_consecutive_days INT NOT NULL,
    effective_from DATE NOT NULL,
    policy_name VARCHAR(100),
    policy_code VARCHAR(20),
    accrual_frequency VARCHAR(10) DEFAULT 'ANNUAL',
    status VARCHAR(10) DEFAULT 'DRAFT',

    CONSTRAINT fk_leave_policies_category
        FOREIGN KEY (category_id) REFERENCES leave_categories(category_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_leave_policies_department
        FOREIGN KEY (department_id) REFERENCES org_departments(department_id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS leave_ledger (
    ledger_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id INT NOT NULL,
    fiscal_year INT NOT NULL,
    opening_balance NUMERIC(5,2) NOT NULL,
    accrued NUMERIC(5,2) NOT NULL,
    used NUMERIC(5,2) NOT NULL,
    encashed NUMERIC(5,2) NOT NULL,
    carried_forward NUMERIC(5,2) NOT NULL,
    closing_balance NUMERIC(5,2) NOT NULL,
    transaction_date DATE,
    transaction_type VARCHAR(50),
    reference_type VARCHAR(50),
    reference_id BIGINT,
    description TEXT,

    CONSTRAINT fk_leave_ledger_user
        FOREIGN KEY (user_id) REFERENCES app_users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_leave_ledger_category
        FOREIGN KEY (category_id) REFERENCES leave_categories(category_id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_leave_ledger_user_category_year
        UNIQUE (user_id, category_id, fiscal_year)
);

CREATE TABLE IF NOT EXISTS leave_requests (
    request_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    session_type VARCHAR(15) NOT NULL
        CHECK (session_type IN ('FULL_DAY', 'FIRST_HALF', 'SECOND_HALF')),
    total_days NUMERIC(5,2) NOT NULL,
    reason TEXT,
    contact_number VARCHAR(20),
    address_during_leave TEXT,
    handover_to BIGINT,
    handover_notes TEXT,
    status VARCHAR(20) NOT NULL
        CHECK (status IN (
            'DRAFT',
            'PENDING_L1',
            'PENDING_L2',
            'APPROVED',
            'REJECTED',
            'CANCELLED',
            'WITHDRAWN'
        )),
    current_approver_id BIGINT,
    applied_at TIMESTAMP,

    CONSTRAINT fk_leave_requests_user
        FOREIGN KEY (user_id) REFERENCES app_users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_leave_requests_category
        FOREIGN KEY (category_id) REFERENCES leave_categories(category_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_leave_requests_approver
        FOREIGN KEY (current_approver_id) REFERENCES app_users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_leave_requests_handover
        FOREIGN KEY (handover_to) REFERENCES app_users(user_id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS leave_approvals (
    approval_id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL,
    approver_id BIGINT NOT NULL,
    level SMALLINT NOT NULL,
    decision VARCHAR(15) NOT NULL
        CHECK (decision IN ('APPROVED', 'REJECTED')),
    decided_at TIMESTAMP NOT NULL,
    comments TEXT,

    CONSTRAINT fk_leave_approvals_request
        FOREIGN KEY (request_id) REFERENCES leave_requests(request_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_leave_approvals_approver
        FOREIGN KEY (approver_id) REFERENCES app_users(user_id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS approval_delegations (
    delegation_id SERIAL PRIMARY KEY,
    delegator_id BIGINT NOT NULL,
    delegate_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_approval_delegations_delegator
        FOREIGN KEY (delegator_id) REFERENCES app_users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_approval_delegations_delegate
        FOREIGN KEY (delegate_id) REFERENCES app_users(user_id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS comp_off_requests (
    comp_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    worked_on DATE NOT NULL,
    reason TEXT,
    hours_worked NUMERIC(5,2),
    days_credited NUMERIC(3,2) NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
    approver_id BIGINT,

    CONSTRAINT fk_comp_off_user
        FOREIGN KEY (user_id) REFERENCES app_users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_comp_off_approver
        FOREIGN KEY (approver_id) REFERENCES app_users(user_id)
        ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- attachments: generic, polymorphic file metadata for anything
-- stored in blob storage (S3 / Azure Blob / GCS). The actual bytes
-- never touch this table or the app tier's disk beyond a stream --
-- only the resulting object location and a UI-fetchable link are
-- persisted here. Mirrors the entity_type/entity_id polymorphic
-- pattern already used by audit_trail and notification_queue.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attachments (
    attachment_id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(30) NOT NULL,
    -- LEAVE_REQUEST / COMP_OFF_REQUEST / USER_AVATAR / EMPLOYEE_IMPORT / HOLIDAY_IMPORT
    entity_id BIGINT,
    -- nullable: e.g. a presigned upload registered before the parent
    -- leave request exists, or a one-off import file with no owning row
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    storage_provider VARCHAR(20) NOT NULL DEFAULT 'S3'
        CHECK (storage_provider IN ('S3', 'AZURE_BLOB', 'GCS')),
    storage_bucket VARCHAR(150) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
        -- internal object path; never returned to the client directly
    blob_url VARCHAR(1000),
        -- CDN URL, or a cached presigned GET URL with blob_url_expires_at;
        -- this is the "link to the resource" the UI fetches/renders
    blob_url_expires_at TIMESTAMP,
    checksum VARCHAR(128),
    status VARCHAR(15) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('PENDING', 'ACTIVE', 'DELETED')),
        -- PENDING until the upload is confirmed (presigned-URL flow),
        -- then ACTIVE; soft-deleted rather than removed
    uploaded_by BIGINT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attachments_uploaded_by
        FOREIGN KEY (uploaded_by) REFERENCES app_users(user_id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_attachments_entity
    ON attachments(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by
    ON attachments(uploaded_by);

CREATE TABLE IF NOT EXISTS holiday_calendar (
    holiday_id SERIAL PRIMARY KEY,
    holiday_name VARCHAR(100) NOT NULL,
    holiday_date DATE NOT NULL,
    department_id INT,
    is_restricted BOOLEAN NOT NULL DEFAULT FALSE,
    holiday_type VARCHAR(20) DEFAULT 'NATIONAL',
    location VARCHAR(100),

    CONSTRAINT fk_holiday_department
        FOREIGN KEY (department_id) REFERENCES org_departments(department_id)
        ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- outbox_events: transactional outbox for Kafka. A state-changing
-- action (approve/reject/delegate/comp-off credit/...) inserts its
-- domain event here in the SAME db transaction as the business-row
-- change. A publisher process (or a CDC connector such as Debezium
-- reading this table's WAL changes) reads PENDING rows, publishes
-- them to the topic below, then marks them PUBLISHED -- this
-- guarantees an event is never lost even if the broker is briefly
-- unavailable, without needing a distributed transaction.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS outbox_events (
    event_id BIGSERIAL PRIMARY KEY,
    aggregate_type VARCHAR(50) NOT NULL,
        -- LEAVE_REQUEST / COMP_OFF_REQUEST / DELEGATION
    aggregate_id BIGINT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
        -- LEAVE_SUBMITTED / LEAVE_APPROVED / LEAVE_REJECTED / LEAVE_ESCALATED /
        -- COMP_OFF_SUBMITTED / COMP_OFF_APPROVED / COMP_OFF_EXPIRED /
        -- DELEGATION_CREATED / DELEGATION_REVOKED
    payload JSONB NOT NULL,
    kafka_topic VARCHAR(100) NOT NULL DEFAULT 'lms.notifications.v1',
    kafka_key VARCHAR(100),
        -- partition key (typically the recipient's user_id) so a given
        -- user's notifications stay in order within their partition
    status VARCHAR(15) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED')),
    retry_count INT NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_outbox_status_created
    ON outbox_events(status, created_at);

CREATE INDEX IF NOT EXISTS idx_outbox_aggregate
    ON outbox_events(aggregate_type, aggregate_id);

-- ------------------------------------------------------------
-- notification_queue: now fanned out by the notification worker's
-- Kafka CONSUMER (one row per recipient/channel per message) rather
-- than written inline by the API. source_event_id + channel + user_id
-- is unique so Kafka's at-least-once delivery can be safely
-- re-consumed after a rebalance/retry without double-sending.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_queue (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    channel VARCHAR(15) NOT NULL
        CHECK (channel IN ('EMAIL', 'IN_APP')),
    template_code VARCHAR(40) NOT NULL,
    payload JSONB,
    related_entity_type VARCHAR(30),
    related_entity_id BIGINT,
    status VARCHAR(15) NOT NULL
        CHECK (status IN ('QUEUED', 'SENT', 'FAILED', 'IN_PROGRESS', 'CANCELLED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    retry_count INT DEFAULT 0,
    scheduled_at TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,

    source_event_id BIGINT,
        -- the outbox_events row (i.e. Kafka message) this row fanned out from
    kafka_topic VARCHAR(100),
    kafka_partition INT,
    kafka_offset BIGINT,
    consumer_group VARCHAR(100) DEFAULT 'lms-notification-worker',

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id) REFERENCES app_users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_notification_source_event
        FOREIGN KEY (source_event_id) REFERENCES outbox_events(event_id)
        ON DELETE SET NULL,

    CONSTRAINT uq_notification_event_channel_user
        UNIQUE (source_event_id, channel, user_id)
);

CREATE TABLE IF NOT EXISTS user_notification_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    leave_request_updates BOOLEAN NOT NULL DEFAULT TRUE,
    approval_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    comp_off_updates BOOLEAN NOT NULL DEFAULT TRUE,
    policy_updates BOOLEAN NOT NULL DEFAULT FALSE,
    system_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    holiday_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_preferences_user
        FOREIGN KEY (user_id) REFERENCES app_users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_trail (
    audit_id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(30) NOT NULL,
    performed_by BIGINT NOT NULL,
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    before_state JSONB,
    after_state JSONB,
    ip_address VARCHAR(45),

    CONSTRAINT fk_audit_performed_by
        FOREIGN KEY (performed_by) REFERENCES app_users(user_id)
        ON DELETE RESTRICT
);

-- ============================================================
-- 02. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_app_users_reports_to
    ON app_users(reports_to);

CREATE INDEX IF NOT EXISTS idx_app_users_department
    ON app_users(department_id);

CREATE INDEX IF NOT EXISTS idx_leave_requests_user_status
    ON leave_requests(user_id, status);

CREATE INDEX IF NOT EXISTS idx_leave_requests_approver_status
    ON leave_requests(current_approver_id, status);

CREATE INDEX IF NOT EXISTS idx_leave_requests_dates
    ON leave_requests(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_leave_approvals_request_level
    ON leave_approvals(request_id, level);

CREATE INDEX IF NOT EXISTS idx_approval_delegations_route
    ON approval_delegations(delegator_id, is_active, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_comp_off_user_status
    ON comp_off_requests(user_id, status);

CREATE INDEX IF NOT EXISTS idx_comp_off_expiry
    ON comp_off_requests(expiry_date);

CREATE INDEX IF NOT EXISTS idx_audit_entity
    ON audit_trail(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_performed_at
    ON audit_trail(performed_at);

CREATE INDEX IF NOT EXISTS idx_notification_status_created
    ON notification_queue(status, created_at);

CREATE INDEX IF NOT EXISTS idx_notification_source_event
    ON notification_queue(source_event_id);

-- ============================================================
-- 03. DUMMY / DEVELOPMENT DATA
-- ============================================================

-- Roles
INSERT INTO user_roles (role_code, role_description)
VALUES
    ('EMPLOYEE', 'Employee'),
    ('MANAGER', 'Manager'),
    ('HR_ADMIN', 'HR Administrator')
ON CONFLICT (role_code) DO NOTHING;

-- Departments
INSERT INTO org_departments (department_name)
VALUES
    ('Engineering'),
    ('Human Resources'),
    ('Finance'),
    ('Sales')
ON CONFLICT DO NOTHING;

-- Leave categories
INSERT INTO leave_categories
    (category_name, is_paid, requires_document, default_annual_quota)
VALUES
    ('Casual Leave', TRUE, FALSE, 12.00),
    ('Sick Leave', TRUE, TRUE, 12.00),
    ('Earned Leave', TRUE, FALSE, 18.00),
    ('Maternity Leave', TRUE, TRUE, 180.00),
    ('Comp Off', TRUE, FALSE, 0.00)
ON CONFLICT (category_name) DO NOTHING;

-- Users
-- Demo BCrypt hash below corresponds to the development password:
-- Password@123
--
-- Replace it before any real/non-development use.
INSERT INTO app_users
    (employee_code, full_name, email, password_hash,
     role_id, department_id, reports_to, date_of_joining, employment_status)
VALUES
(
    'EMP001',
    'Rahul Sharma',
    'rahul.sharma@demo.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    (SELECT role_id FROM user_roles WHERE role_code = 'EMPLOYEE'),
    (SELECT department_id FROM org_departments WHERE department_name = 'Engineering'),
    NULL,
    '2024-04-15',
    'ACTIVE'
),
(
    'MGR001',
    'Priya Verma',
    'priya.verma@demo.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    (SELECT role_id FROM user_roles WHERE role_code = 'MANAGER'),
    (SELECT department_id FROM org_departments WHERE department_name = 'Engineering'),
    NULL,
    '2022-06-01',
    'ACTIVE'
),
(
    'HR001',
    'Anita Singh',
    'anita.singh@demo.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    (SELECT role_id FROM user_roles WHERE role_code = 'HR_ADMIN'),
    (SELECT department_id FROM org_departments WHERE department_name = 'Human Resources'),
    NULL,
    '2021-01-10',
    'ACTIVE'
),
(
    'EMP002',
    'Amit Kumar',
    'amit.kumar@demo.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    (SELECT role_id FROM user_roles WHERE role_code = 'EMPLOYEE'),
    (SELECT department_id FROM org_departments WHERE department_name = 'Engineering'),
    NULL,
    '2025-02-03',
    'ACTIVE'
),
(
    'EMP003',
    'Neha Gupta',
    'neha.gupta@demo.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    (SELECT role_id FROM user_roles WHERE role_code = 'EMPLOYEE'),
    (SELECT department_id FROM org_departments WHERE department_name = 'Finance'),
    NULL,
    '2023-09-18',
    'ON_LEAVE'
)
ON CONFLICT (employee_code) DO NOTHING;

-- Set Engineering manager and reporting lines after users exist
UPDATE org_departments
SET department_head_id = (
    SELECT user_id FROM app_users WHERE employee_code = 'MGR001'
)
WHERE department_name = 'Engineering';

UPDATE app_users
SET reports_to = (
    SELECT user_id FROM app_users WHERE employee_code = 'MGR001'
)
WHERE employee_code IN ('EMP001', 'EMP002');

-- HR department head
UPDATE org_departments
SET department_head_id = (
    SELECT user_id FROM app_users WHERE employee_code = 'HR001'
)
WHERE department_name = 'Human Resources';

-- Finance employee reports to manager for demo purposes
UPDATE app_users
SET reports_to = (
    SELECT user_id FROM app_users WHERE employee_code = 'MGR001'
)
WHERE employee_code = 'EMP003';

-- Leave policies
INSERT INTO leave_policies
    (category_id, department_id, annual_quota, max_carry_forward,
     min_notice_days, max_consecutive_days, effective_from)
VALUES
(
    (SELECT category_id FROM leave_categories WHERE category_name = 'Casual Leave'),
    NULL, 12.00, 6.00, 1, 5, '2026-01-01'
),
(
    (SELECT category_id FROM leave_categories WHERE category_name = 'Sick Leave'),
    NULL, 12.00, 0.00, 0, 10, '2026-01-01'
),
(
    (SELECT category_id FROM leave_categories WHERE category_name = 'Earned Leave'),
    NULL, 18.00, 10.00, 7, 15, '2026-01-01'
),
(
    (SELECT category_id FROM leave_categories WHERE category_name = 'Maternity Leave'),
    NULL, 180.00, 0.00, 0, 180, '2026-01-01'
)
ON CONFLICT DO NOTHING;

-- Leave ledger for demo employees
INSERT INTO leave_ledger
    (user_id, category_id, fiscal_year, opening_balance,
     accrued, used, encashed, carried_forward, closing_balance)
VALUES
(
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP001'),
    (SELECT category_id FROM leave_categories WHERE category_name = 'Casual Leave'),
    2026, 2.00, 10.00, 3.00, 0.00, 0.00, 9.00
),
(
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP001'),
    (SELECT category_id FROM leave_categories WHERE category_name = 'Sick Leave'),
    2026, 0.00, 12.00, 1.00, 0.00, 0.00, 11.00
),
(
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP001'),
    (SELECT category_id FROM leave_categories WHERE category_name = 'Earned Leave'),
    2026, 4.00, 14.00, 5.00, 0.00, 0.00, 13.00
),
(
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP002'),
    (SELECT category_id FROM leave_categories WHERE category_name = 'Casual Leave'),
    2026, 1.00, 11.00, 2.00, 0.00, 0.00, 10.00
),
(
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP002'),
    (SELECT category_id FROM leave_categories WHERE category_name = 'Sick Leave'),
    2026, 0.00, 12.00, 0.00, 0.00, 0.00, 12.00
)
ON CONFLICT (user_id, category_id, fiscal_year) DO NOTHING;

-- Leave requests
INSERT INTO leave_requests
    (user_id, category_id, start_date, end_date, session_type,
     total_days, reason, status, current_approver_id, applied_at)
VALUES
(
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP001'),
    (SELECT category_id FROM leave_categories WHERE category_name = 'Casual Leave'),
    '2026-08-17', '2026-08-18', 'FULL_DAY',
    2.00, 'Family function', 'PENDING_L1',
    (SELECT user_id FROM app_users WHERE employee_code = 'MGR001'),
    CURRENT_TIMESTAMP
),
(
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP002'),
    (SELECT category_id FROM leave_categories WHERE category_name = 'Sick Leave'),
    '2026-07-20', '2026-07-20', 'FIRST_HALF',
    0.50, 'Doctor appointment', 'APPROVED',
    NULL,
    '2026-07-18 10:30:00'
),
(
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP001'),
    (SELECT category_id FROM leave_categories WHERE category_name = 'Earned Leave'),
    '2026-09-01', '2026-09-03', 'FULL_DAY',
    3.00, 'Personal travel', 'REJECTED',
    NULL,
    '2026-08-20 09:00:00'
),
(
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP002'),
    (SELECT category_id FROM leave_categories WHERE category_name = 'Casual Leave'),
    '2026-09-10', '2026-09-10', 'SECOND_HALF',
    0.50, 'Personal errand', 'PENDING_L1',
    (SELECT user_id FROM app_users WHERE employee_code = 'MGR001'),
    CURRENT_TIMESTAMP
),
(
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP001'),
    (SELECT category_id FROM leave_categories WHERE category_name = 'Sick Leave'),
    '2026-08-25', '2026-08-26', 'FULL_DAY',
    2.00, 'Viral fever', 'PENDING_L1',
    (SELECT user_id FROM app_users WHERE employee_code = 'MGR001'),
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- Approval history for the approved/rejected demo requests
INSERT INTO leave_approvals
    (request_id, approver_id, level, decision, decided_at, comments)
SELECT
    lr.request_id,
    (SELECT user_id FROM app_users WHERE employee_code = 'MGR001'),
    1,
    CASE
        WHEN lr.status = 'APPROVED' THEN 'APPROVED'
        ELSE 'REJECTED'
    END,
    CURRENT_TIMESTAMP - INTERVAL '10 days',
    CASE
        WHEN lr.status = 'APPROVED' THEN 'Approved by manager'
        ELSE 'Insufficient notice for the requested dates'
    END
FROM leave_requests lr
WHERE lr.status IN ('APPROVED', 'REJECTED')
  AND NOT EXISTS (
      SELECT 1
      FROM leave_approvals la
      WHERE la.request_id = lr.request_id
  );

-- Approval delegation
INSERT INTO approval_delegations
    (delegator_id, delegate_id, start_date, end_date, is_active)
VALUES
(
    (SELECT user_id FROM app_users WHERE employee_code = 'MGR001'),
    (SELECT user_id FROM app_users WHERE employee_code = 'HR001'),
    '2026-08-10',
    '2026-08-20',
    TRUE
)
ON CONFLICT DO NOTHING;

-- Comp-off requests
INSERT INTO comp_off_requests
    (user_id, worked_on, reason, days_credited, expiry_date, status, approver_id)
VALUES
(
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP001'),
    '2026-08-15',
    'Production support on holiday',
    1.00,
    '2026-11-15',
    'PENDING',
    (SELECT user_id FROM app_users WHERE employee_code = 'MGR001')
),
(
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP002'),
    '2026-07-04',
    'Weekend release support',
    0.50,
    '2026-10-04',
    'APPROVED',
    (SELECT user_id FROM app_users WHERE employee_code = 'MGR001')
);

-- Holiday calendar
INSERT INTO holiday_calendar
    (holiday_name, holiday_date, department_id, is_restricted)
VALUES
    ('Independence Day', '2026-08-15', NULL, FALSE),
    ('Republic Day', '2027-01-26', NULL, FALSE),
    ('Engineering Team Day', '2026-09-10',
        (SELECT department_id FROM org_departments WHERE department_name = 'Engineering'),
        TRUE)
ON CONFLICT DO NOTHING;

-- Outbox events (Kafka) -- one per notification-worthy state change.
-- These are the rows a publisher/CDC connector picks up and emits onto
-- lms.notifications.v1; notification_queue rows below reference them.
INSERT INTO outbox_events
    (aggregate_type, aggregate_id, event_type, payload, kafka_key, status, published_at)
VALUES
(
    'LEAVE_REQUEST',
    (SELECT MAX(request_id) FROM leave_requests
     WHERE user_id = (SELECT user_id FROM app_users WHERE employee_code = 'EMP001')),
    'LEAVE_SUBMITTED',
    '{"status":"PENDING_L1","totalDays":2.0}'::jsonb,
    (SELECT user_id::text FROM app_users WHERE employee_code = 'EMP001'),
    'PUBLISHED',
    CURRENT_TIMESTAMP
),
(
    'LEAVE_REQUEST',
    (SELECT request_id FROM leave_requests
     WHERE user_id = (SELECT user_id FROM app_users WHERE employee_code = 'EMP001')
     AND status = 'PENDING_L1'
     ORDER BY request_id DESC LIMIT 1),
    'LEAVE_APPROVAL_REQUIRED',
    '{"priority":"NORMAL"}'::jsonb,
    (SELECT user_id::text FROM app_users WHERE employee_code = 'MGR001'),
    'PUBLISHED',
    CURRENT_TIMESTAMP
);

-- Notification queue -- as if fanned out by the Kafka consumer from the
-- outbox_events rows just inserted above.
INSERT INTO notification_queue
    (user_id, channel, template_code, payload,
     related_entity_type, related_entity_id, status,
     source_event_id, kafka_topic, kafka_partition, kafka_offset)
VALUES
(
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP001'),
    'IN_APP',
    'LEAVE_SUBMITTED',
    '{"message":"Your leave request has been submitted.","status":"PENDING_L1"}'::jsonb,
    'LEAVE_REQUEST',
    (SELECT MAX(request_id) FROM leave_requests
     WHERE user_id = (SELECT user_id FROM app_users WHERE employee_code = 'EMP001')),
    'QUEUED',
    (SELECT event_id FROM outbox_events WHERE event_type = 'LEAVE_SUBMITTED' ORDER BY event_id DESC LIMIT 1),
    'lms.notifications.v1', 0, 1001
),
(
    (SELECT user_id FROM app_users WHERE employee_code = 'MGR001'),
    'EMAIL',
    'LEAVE_APPROVAL_REQUIRED',
    '{"message":"A leave request requires your approval.","priority":"NORMAL"}'::jsonb,
    'LEAVE_REQUEST',
    (SELECT request_id FROM leave_requests
     WHERE user_id = (SELECT user_id FROM app_users WHERE employee_code = 'EMP001')
     AND status = 'PENDING_L1'
     ORDER BY request_id DESC LIMIT 1),
    'QUEUED',
    (SELECT event_id FROM outbox_events WHERE event_type = 'LEAVE_APPROVAL_REQUIRED' ORDER BY event_id DESC LIMIT 1),
    'lms.notifications.v1', 0, 1002
);

-- Attachments (blob storage) -- a supporting document on a leave
-- request and a profile photo, matching EMP-04 and EMP-09.
INSERT INTO attachments
    (entity_type, entity_id, file_name, content_type, size_bytes,
     storage_provider, storage_bucket, storage_key, blob_url, status, uploaded_by)
VALUES
(
    'LEAVE_REQUEST',
    (SELECT request_id FROM leave_requests
     WHERE user_id = (SELECT user_id FROM app_users WHERE employee_code = 'EMP001')
     AND status = 'PENDING_L1'
     ORDER BY request_id DESC LIMIT 1),
    'medical_report.pdf',
    'application/pdf',
    245760,
    'S3',
    'lms-prod-attachments',
    'leave-requests/EMP001/medical_report_20260825.pdf',
    'https://cdn.lms.example.com/leave-requests/EMP001/medical_report_20260825.pdf',
    'ACTIVE',
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP001')
),
(
    'USER_AVATAR',
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP001'),
    'avatar.jpg',
    'image/jpeg',
    52340,
    'S3',
    'lms-prod-avatars',
    'avatars/EMP001/avatar_20260101.jpg',
    'https://cdn.lms.example.com/avatars/EMP001/avatar_20260101.jpg',
    'ACTIVE',
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP001')
);

-- Keep app_users.avatar_url (denormalized "current avatar" pointer,
-- read directly by most screens) in sync with the row above.
UPDATE app_users
SET avatar_url = 'https://cdn.lms.example.com/avatars/EMP001/avatar_20260101.jpg'
WHERE employee_code = 'EMP001';

-- Audit trail
INSERT INTO audit_trail
    (entity_type, entity_id, action, performed_by,
     performed_at, before_state, after_state, ip_address)
VALUES
(
    'LEAVE_REQUEST',
    (SELECT request_id FROM leave_requests
     WHERE user_id = (SELECT user_id FROM app_users WHERE employee_code = 'EMP001')
     AND status = 'PENDING_L1'
     ORDER BY request_id DESC LIMIT 1),
    'CREATE',
    (SELECT user_id FROM app_users WHERE employee_code = 'EMP001'),
    CURRENT_TIMESTAMP,
    NULL,
    '{"status":"PENDING_L1","total_days":2.0}'::jsonb,
    '127.0.0.1'
),
(
    'DELEGATION',
    (SELECT delegation_id FROM approval_delegations
     WHERE delegator_id = (SELECT user_id FROM app_users WHERE employee_code = 'MGR001')
     ORDER BY delegation_id DESC LIMIT 1),
    'DELEGATE',
    (SELECT user_id FROM app_users WHERE employee_code = 'MGR001'),
    CURRENT_TIMESTAMP,
    NULL,
    '{"delegate":"HR001","active":true}'::jsonb,
    '127.0.0.1'
);

COMMIT;

-- ============================================================
-- 04. QUICK VERIFICATION
-- ============================================================

SELECT 'user_roles' AS table_name, COUNT(*) AS rows FROM user_roles
UNION ALL SELECT 'org_departments', COUNT(*) FROM org_departments
UNION ALL SELECT 'app_users', COUNT(*) FROM app_users
UNION ALL SELECT 'leave_categories', COUNT(*) FROM leave_categories
UNION ALL SELECT 'leave_policies', COUNT(*) FROM leave_policies
UNION ALL SELECT 'leave_ledger', COUNT(*) FROM leave_ledger
UNION ALL SELECT 'leave_requests', COUNT(*) FROM leave_requests
UNION ALL SELECT 'leave_approvals', COUNT(*) FROM leave_approvals
UNION ALL SELECT 'approval_delegations', COUNT(*) FROM approval_delegations
UNION ALL SELECT 'comp_off_requests', COUNT(*) FROM comp_off_requests
UNION ALL SELECT 'holiday_calendar', COUNT(*) FROM holiday_calendar
UNION ALL SELECT 'notification_queue', COUNT(*) FROM notification_queue
UNION ALL SELECT 'user_notification_preferences', COUNT(*) FROM user_notification_preferences
UNION ALL SELECT 'outbox_events', COUNT(*) FROM outbox_events
UNION ALL SELECT 'attachments', COUNT(*) FROM attachments
UNION ALL SELECT 'audit_trail', COUNT(*) FROM audit_trail
ORDER BY table_name;


UPDATE app_users
SET password_hash = '$2a$10$KZzw3c/pbVmAd5l/63tv3.HF06vAoDD8wSD20Ha0.i0RMxUaO1O3C',
    updated_at = CURRENT_TIMESTAMP
WHERE employee_code IN ('EMP001', 'MGR001', 'HR001', 'EMP002', 'EMP003');


SELECT current_database(),
       current_user;

	   SELECT * from app_users
