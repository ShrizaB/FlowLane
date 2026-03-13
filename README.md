# FlowLane

FlowLane is a modern **Kanban-based task management application** that helps teams organize, track, and complete work through a visual workflow interface. The platform provides an intuitive board system where tasks move through defined stages, enabling teams to monitor project progress and manage responsibilities efficiently.

## Overview

FlowLane implements a **Kanban workflow model** consisting of three primary columns: **To-Do**, **In Progress**, and **Done**. Tasks are represented as interactive cards containing detailed information such as title, description, due date, priority level, and assigned team member. Users can easily move tasks between stages using a **drag-and-drop interface**, allowing real-time visualization of project progress.

The application also includes a **team simulation system** with dummy members and preloaded tasks to demonstrate how collaborative task management works in a real project environment.

## Features

* Visual **Kanban board** for workflow management
* **Multiple project boards** for organizing different tasks or projects
* **Task cards** with title, markdown description, due date, priority, and assignee
* **Drag-and-drop functionality** for moving tasks between workflow stages
* **Priority labeling** (Low, Medium, High) for better task management
* **Team member assignment** for collaborative work
* **Pre-populated dataset** with 20+ tasks across different columns

## Technology Stack

**Frontend**

* React
* Vite
* JavaScript (ES6+)

**Architecture**

* Component-based UI design
* Custom React hooks
* Modular folder structure
* Centralized state management

**Backend**

* Node.js environment with local API structure (mock or extendable)

## Project Structure

```
FlowLane
│
├── backend
│   ├── src
│   └── package.json
│
└── src
    ├── api            # API services and backend communication
    ├── components     # Reusable UI components
    │   ├── board      # Kanban board and column components
    │   ├── dashboard  # Dashboard UI elements
    │   ├── layout     # Application layout and navigation
    │   ├── shared     # Generic reusable components
    │   └── team       # Team-related components
    │
    ├── hooks          # Custom React hooks
    ├── pages          # Application views and routes
    ├── store          # Global state management
    ├── styles         # Global styling and themes
    ├── utils          # Utility and helper functions
    │
    ├── App.jsx        # Root application component
    └── main.jsx       # Application entry point
```

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/flowlane.git
cd flowlane
npm install
npm run dev
```

The application will run on the local development server.

## Future Enhancements

* User authentication and authorization
* Real-time team collaboration
* Task comments and activity history
* File attachments within tasks
* Notifications and reminders

## License

This project is licensed under the **MIT License**.
