# KruMate OS
## The First AI Operating System for Thai Teachers

## Vision
KruMate OS is an AI-powered SaaS platform designed to help Thai teachers reduce administrative workload, generate educational documents automatically, save time, and focus more on teaching and student development.

---

# Tech Stack

- React + Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts
- React Router
- Zustand
- AI Integration (LLM API)

---

# Design Principles

- Modern EdTech Startup
- AI-First Experience
- Inspired by Linear, Notion, Stripe, Canva, Duolingo
- Clean & Minimal
- Teacher-Friendly
- Premium SaaS Dashboard
- Responsive Design

---

# Color Palette

| Role | Color |
|--------|--------|
| Primary | #2563EB |
| Secondary | #10B981 |
| Accent | #F59E0B |
| Background | #F8FAFC |
| Surface | #FFFFFF |
| Text | #0F172A |

---

# Information Architecture

```text
KruMate OS
│
├── Dashboard
├── AI Document Generator
├── Document History
├── Analytics
├── AI Assistant
└── Settings
```

---

# Core Features

## 1. Dashboard

### Components

- Welcome Hero
- KPI Cards
- Time Saved Analytics
- Recent Documents
- Quick Actions

### KPI Metrics

- Documents Generated
- Hours Saved
- Students Supported
- AI Tasks Completed

---

## 2. AI Document Generator

### Templates

- Lesson Plan
- Official Letter
- Activity Report
- Student Evaluation

### Workflow

1. Select Template
2. Fill Dynamic Form
3. Generate with AI
4. Review & Edit
5. Save
6. Download
7. Regenerate

---

## 3. Document History

### Features

- Search
- Filter
- Sort
- Open Document
- Duplicate
- Delete

---

## 4. Analytics

### Metrics

- Documents Generated Trend
- Time Saved Trend
- Most Used Templates
- Annual Impact Summary

---

## 5. AI Assistant

### Capabilities

- AI Chat
- Summarize Content
- Generate Documents
- Suggest Teaching Activities
- Answer Teacher Questions

---

# User Flow

```text
Login
 ↓
Dashboard
 ↓
Generate Document
 ↓
AI Creates Draft
 ↓
Edit
 ↓
Export
 ↓
Analytics Updated
```

---

# Layout Structure

## Sidebar Navigation

```text
KruMate OS

Dashboard
Generate
History
Analytics

Settings
Help
Profile
```

---

# Dashboard Layout

```text
Hero Section

KPI Cards

Analytics Chart + Quick Actions

Recent Documents
```

---

# Design System

## Typography

Font:

- Inter
- Noto Sans Thai

### Scale

- H1: 48px
- H2: 36px
- H3: 28px
- H4: 24px
- Body: 16px
- Small: 14px

### Border Radius

- Cards: 24px
- Components: 16px

### Grid System

- 8pt spacing system

---

# Responsive Layout

## Desktop

- Sidebar + Content

## Tablet

- Collapsible Sidebar

## Mobile

- Drawer Navigation
- Stacked Layouts

---

# Component Architecture

```text
src
│
├── app
├── pages
│   ├── Dashboard
│   ├── Generate
│   ├── History
│   └── Analytics
│
├── components
│   ├── layout
│   ├── dashboard
│   ├── generator
│   ├── history
│   ├── analytics
│   └── ai
│
├── hooks
├── services
├── store
└── utils
```

---

# Key React Components

## Layout

- AppShell
- Sidebar
- Header

## Dashboard

- HeroCard
- KPICard
- TimeSavedChart
- RecentDocuments
- QuickActions

## Generator

- TemplateSelector
- DynamicForm
- PreviewPanel
- GenerateButton

## History

- SearchBar
- FilterBar
- DocumentCard

## Analytics

- TrendChart
- ImpactCard
- UsageChart

## AI

- FloatingAssistant
- ChatWindow
- PromptSuggestions

---

# AI Value Proposition

### Save Time

Teachers can reduce administrative workload significantly through automated document generation.

### Improve Productivity

Generate official documents, lesson plans, reports, and evaluations in minutes.

### Focus on Students

Less paperwork means more time spent teaching and supporting students.

---

# Hackathon Winning Features

## Time Saved Counter

Example:

> You have saved 137 hours this year.

---

## AI Document Copilot

Example Prompt:

```text
Create a Grade 5 science lesson plan
about ecosystems aligned to Thai curriculum.
```

---

## Teacher Impact Dashboard

```text
137 Hours Saved
↓
342 More Students Supported
```

---

## Floating AI Assistant

Available on every page.

---

## Premium Empty States

```text
Create your first document.

Save up to 10 hours every week with AI.
```

---

# Hero Message

> Focus on teaching.
>
> Let AI handle the paperwork.

---

# Goal

Build a world-class EdTech SaaS platform that demonstrates measurable impact, AI-powered productivity, and a premium user experience for Thai teachers.
"# JUMP-Thailand-2026" 
"# JUMP-Thailand-2026" 
"# JUMP-Thailand-2026" 
