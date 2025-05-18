# Hierarchical Task Manager

A comprehensive task management system with hierarchical organization, built with React, TypeScript, and Dexie.js.

## Features

- **Hierarchical Organization**: Organize tasks in a hierarchical structure (Category > Division > Tenant > Project > Task)
- **Advanced Filtering**: Filter tasks by status, priority, impact, urgency, and due date
- **Dependency Management**: Track dependencies between tasks
- **Persistent Filters**: Save and load filter presets using localStorage
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

- `/src/components`: React components
  - `/components/filters`: Filter-related components
  - `/components/layout`: Layout components
  - `/components/navigation`: Navigation components
  - `/components/views`: View components
- `/src/context`: React context providers
- `/src/db`: Database models and operations
- `/src/types`: TypeScript type definitions
- `/src/utils`: Utility functions

## Data Model

The application uses the following data model:

- **Category**: Top-level organization (e.g., Personal, Business)
- **Division**: Sub-category within a Category (e.g., Coding, Marketing, Operations)
- **Tenant**: Client or organization (e.g., FM Rug, Widmers, Arslanian)
- **Project**: A collection of related tasks
- **Task**: Individual work item with properties like impact, urgency, status, etc.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Creating a Task

1. Click the "Add Task" button in the top bar
2. Select a project (or create a new one)
3. Fill in the task details (title, description, impact, urgency, etc.)
4. Select any dependencies
5. Click "Create Task"

### Filtering Tasks

1. Use the filter bar to select filters
2. Click "Apply Filters" to filter the task list
3. Save filter presets for later use

### Managing Dependencies

1. When creating or editing a task, select dependencies from the list
2. Dependencies are displayed in the task list
3. The system prevents circular dependencies

## Technologies Used

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Dexie.js**: IndexedDB wrapper for client-side storage
- **TailwindCSS**: Utility-first CSS framework
- **Tabulator**: Interactive table library
- **Vite**: Build tool and development server

## License

MIT