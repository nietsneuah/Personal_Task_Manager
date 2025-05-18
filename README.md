# Personal Task Managers

This repository contains two complementary task management applications designed for different organizational approaches:

1. **Priority Tracker** - A single-level task management system focused on priority categories
2. **Hierarchical Task Manager** - A comprehensive task management system with multi-level hierarchical organization

Both applications are built with modern web technologies and designed to be self-hosted, local-first solutions for personal and business task management.

## Project Overview

### Priority Tracker

The Priority Tracker is a streamlined task management application that organizes tasks by priority categories:

- **Primary** - High-priority tasks that require immediate attention
- **Strategic** - Important tasks that contribute to long-term goals
- **Ongoing** - Recurring or maintenance tasks

Key features:
- Simple, flat organization structure
- Impact and urgency metrics for task prioritization
- Week-based planning
- Tenant/client organization
- Status tracking (Planned, In Progress, Done)

### Hierarchical Task Manager

The Hierarchical Task Manager is a comprehensive task management system that organizes tasks in a multi-level hierarchy:

- **Category** - Top-level organization (e.g., Personal, Business)
- **Division** - Sub-category within a Category (e.g., Coding, Marketing, Operations)
- **Tenant** - Client or organization (e.g., FM Rug, Widmers, Arslanian)
- **Project** - A collection of related tasks
- **Task** - Individual work item with properties like impact, urgency, status, etc.

Key features:
- Hierarchical organization with five levels
- Advanced filtering by status, priority, impact, urgency, and due date
- Dependency management between tasks
- Persistent filter presets
- List and Gantt view options
- Responsive design for desktop and mobile

## Technology Stack

Both applications share a common technology stack:

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Local Database**: Dexie.js (IndexedDB wrapper)
- **Data Visualization**: 
  - Priority Tracker: ApexCharts
  - Hierarchical Task Manager: Tabulator.js
- **Data Tables**: Tabulator.js

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation and Setup

#### Priority Tracker

1. Navigate to the priority-tracker directory:
   ```bash
   cd priority-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

#### Hierarchical Task Manager

1. Navigate to the hierarchical-task-manager directory:
   ```bash
   cd hierarchical-task-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage Comparison

| Feature | Priority Tracker | Hierarchical Task Manager |
|---------|-----------------|---------------------------|
| Organization | Flat structure with priority categories | Multi-level hierarchy |
| Task Properties | Title, category, impact, urgency, tenant, status, week, notes | Title, description, impact, urgency, status, due date, dependencies |
| Views | List view | List view and Gantt view |
| Filtering | Basic filtering | Advanced filtering with persistent presets |
| Dependencies | Not supported | Supported with visualization |
| Best For | Simple task tracking, weekly planning | Complex projects, team coordination, dependency management |

## License

MIT