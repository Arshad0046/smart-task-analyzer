# smart-task-analyzer
Smart Task Analyzer
A Django-based web application that intelligently scores and prioritizes tasks based on multiple factors including urgency, importance, effort, and dependencies.

🚀 Features
Intelligent Priority Scoring: Custom algorithm balancing urgency, importance, effort, and dependencies

Multiple Sorting Strategies: Smart Balance, Fastest Wins, High Impact, Deadline Driven

Circular Dependency Detection: Identifies and prevents circular task dependencies

Responsive Frontend: Clean, mobile-friendly interface

RESTful API: Well-structured Django REST Framework backend

📋 Setup Instructions
Prerequisites
Python 3.8+

pip (Python package manager)

Backend Setup
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

Frontend Setup

Open frontend/index.html in your web browser

The backend should be running on http://localhost:8000

🧠 Algorithm Explanation
The priority scoring algorithm intelligently balances four key factors to determine task priority:

Urgency Factor: Evaluates how soon a task is due. Overdue tasks receive maximum urgency scores (10), while tasks due today get 9 points. The urgency gradually decreases for future deadlines, with tasks due in a week receiving 5 points and those further out receiving progressively lower scores based on weeks until due date.

Importance Factor: Directly incorporates user input on a 1-10 scale. Higher importance ratings translate to higher priority scores, respecting the user's judgment about task significance for strategic planning.

Effort Factor: Uses an inverse relationship where lower-effort tasks receive higher scores. This encourages "quick wins" by prioritizing tasks that can be completed quickly (1-2 hours get maximum scores), helping users build momentum and reduce mental clutter.

Dependency Factor: Tasks that block other work receive bonus points. Each dependency adds to the score, recognizing that completing blocking tasks enables parallel progress across multiple workstreams and unblocks team productivity.

The algorithm employs configurable weighting strategies:

Smart Balance: Balanced approach (40% urgency, 30% importance, 20% effort, 10% dependencies)

Fastest Wins: Emphasizes effort (60%) for clearing backlogs quickly

High Impact: Focuses on importance (60%) for strategic work

Deadline Driven: Prioritizes urgency (70%) for time-sensitive projects

Scores are normalized to a 0-100 scale for intuitive interpretation, and the system includes circular dependency detection to maintain logical consistency in task relationships.

🏗️ Design Decisions

Backend Architecture
Django REST Framework: Chosen for its robust API capabilities, excellent documentation, and seamless Django integration

Separate Scoring Module: Isolated algorithm logic in scoring.py for better maintainability, testing, and future enhancements

SQLite Database: Used as specified in requirements, though PostgreSQL would be preferred for production environments

Frontend Design
Vanilla JavaScript: Avoided framework complexity to demonstrate core competency and keep the application lightweight

Mobile-First Responsive Design: Implemented using CSS Grid and Flexbox to ensure accessibility across all devices

Progressive Enhancement: Core functionality works with basic HTML, enhanced with JavaScript for better user experience

API Design
RESTful Principles: Clear endpoint structure following REST conventions

Comprehensive Error Handling: Descriptive error messages for invalid inputs, missing data, and circular dependencies

Strategy Flexibility: Easy to extend with new sorting strategies by modifying weights configuration

Trade-offs Made
No Authentication: Skipped as per assignment requirements, though essential for real-world multi-user applications

In-Memory Task Storage: Tasks aren't persisted between sessions to keep the demo simple and focused on the core algorithm

Basic Styling: Implemented clean, functional UI without extensive CSS frameworks to demonstrate custom design skills




