# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. Project Overview

**Project Name:** CIS Department Website

**Description:** A website for the Department of Computer and Information Science, Faculty of Applied Science, King Mongkut's University of Technology North Bangkok (KMUTNB).

**Purpose:**
- Publish department news and announcements
- Display curriculum information
- Provide downloadable documents
- Showcase student projects
- Provide an AI Chatbot for answering student questions
- Provide an administration system for lecturers and administrators

## 2. Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Material UI
**Backend:** Node.js, Express.js
**Database:** PostgreSQL
**ORM:** Prisma
**Authentication:** KMUTNB SSO (OAuth2) — *currently stubbed, see Known Issues*
**Deployment:** Docker

## 3. Project Structure

```
frontend/
  src/
    pages/
    components/
    layouts/

backend/
  controllers/
  routes/
  middleware/
  prisma/
  uploads/
```

## 4. Database Schema

> Revised per advisor feedback — `backend/prisma/schema.prisma` should be updated to match this structure. See `ER_Diagram.pdf` for the source diagram.

**Core tables:**
- `users`, `lecturers`, `staff` — accounts and profile info (lecturers/staff link to `users` via `user_id`)
- `degrees` → `programs` → `curriculums` → `courses` — academic hierarchy
- `students` — linked to `curriculums`
- `advisor` — links `lecturers` ↔ `students` (with `academic_year`, `level`)

**Projects & research:**
- `projects` (linked to advisor via `advisor_id`) and `project_members` (linked to `projects` + `students`)
- `research_publications` — linked to `lecturers`, supports auto-import from external sources (`external_source`, `external_id`, `is_auto_imported`)

**Content & CMS:**
- `news`, `downloads`, `faqs`, `banners`, `site_config`
- `internships` (section/title/content)

**AI Chatbot knowledge base:**
- `student_handbooks` — Q&A with category/topic/condition detail
- `chatbot_knowledge` — generic knowledge store with `source_type` + `reference_id` (polymorphic link back to source content, e.g. news/FAQ/handbook)

## 5. ER Diagram

See `ER_Diagram.pdf` (provided by advisor). Relationships are mostly one-to-many (`0..1` to `*`), e.g.:
- `users` 1—* `lecturers` / `staff`
- `degrees` 1—* `programs` 1—* `curriculums` 1—* `courses`
- `curriculums` 1—* `students`
- `lecturers` 1—* `advisor` *—1 `students`
- `advisor` 1—* `projects` 1—* `project_members` *—1 `students`
- `lecturers` 1—* `research_publications`

## 6. API Documentation

Base pattern is REST, e.g.:

```
GET    /api/news
POST   /api/news
PUT    /api/news/:id
DELETE /api/news/:id
GET    /api/downloads
POST   /api/login
```

> Note: frontend calls currently hit hardcoded `localhost:5000` URLs per-file — there is no centralized API client yet. Keep this in mind when adding new API calls or preparing for deployment.

## 7. Existing Features

**Frontend:** Home, News, Curriculum, Downloads, Lecturers, Contact, AI Chatbot
**Backend:** Authentication, News Management, Curriculum Management, Download Management, User Management, Role Management, FAQ Management

## 8. User Roles

- **Guest** — public-facing pages only (news, curriculum, downloads, chatbot)
- **Student** — read news, download documents, use AI chatbot
- **Lecturer** — edit profile, publish news
- **Administrator** — manage news, downloads, curriculum, users

## 9. Required Features by Role

**Administrator:** Manage News, Manage Downloads, Manage Curriculum, Manage Users
**Lecturer:** Edit Profile, Publish News
**Student:** Read News, Download Documents, Use AI Chatbot

## 10. Features Still Under Development

- AI Chatbot (RAG pipeline: local embeddings + pgvector + Gemini fallback)
- Curriculum PDF Parser
- PDF Upload System
- KMUTNB SSO Login
- Permission Management
- Dashboard Analytics

## 11. Coding Standards

- **Architecture:** MVC (routes → controllers → Prisma)
- **Database:** Prisma ORM only
- **API Style:** REST API
- **Naming Convention:** camelCase
- **Frontend:** React functional components, Hooks

## 12. Environment Configuration

Template only (see `.env.example`) — never commit real secrets.

```
DATABASE_URL=
JWT_SECRET=
GEMINI_API_KEY=
```

## 13. Known Issues

- Prisma is currently pointing to a non-functional Supabase database instead of the local Docker PostgreSQL instance, so Prisma Studio can't retrieve data (incorrect `DATABASE_URL`).
- The app services in `docker-compose.yml` are commented out and unused — only the DB service is active.
- **Auth is stubbed:** `verifyToken` currently accepts any request and hardcodes an admin user. Real auth checks exist in several routes but are commented out rather than removed — do not treat current access control as real until this is fixed.
- No centralized API client on the frontend; API calls use hardcoded `localhost:5000` URLs per-file.

## 14. TODO List (Priority Order)

1. Fix Prisma database connection (point to local Docker Postgres, not Supabase)
2. Complete Authentication (replace stubbed `verifyToken`, restore commented-out auth checks)
3. Finish News CRUD
4. Complete Curriculum Management
5. Finish AI Chatbot Integration
6. Test all APIs
7. Deploy the system

## 15. Project Requirements

- AI Chatbot
- KMUTNB SSO Authentication
- Curriculum Version Management
- News Archive
- Download Center
- Responsive Design
- Role-Based Access Control

## 16. UI/UX Design

_Not yet provided — add links to Figma, wireframes, mockups, or a design system here when available._

## 17. Files Shared with Claude

Include: `frontend/`, `backend/`, `prisma/`, `package.json`, `README.md`, `schema.prisma`, ER diagram, requirement docs, API docs, Postman collection, `.env.example`

Exclude: `node_modules/`, `dist/`, `build/`, `.git/`, `.env`