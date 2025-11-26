class TaskAnalyzer {
    constructor() {
        this.tasks = [];
        this.apiBase = 'http://localhost:8000/api/tasks';
        this.initializeEventListeners();
        this.updateTaskList();
        this.testConnection();
    }

    initializeEventListeners() {
        document.getElementById('singleTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSingleTask();
        });

        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeTasks();
        });

        document.getElementById('suggestBtn').addEventListener('click', () => {
            this.getSuggestions();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAllTasks();
        });

        document.getElementById('bulkInput').addEventListener('input', (e) => {
            this.validateJSONInput(e.target);
        });
    }

    validateJSONInput(textarea) {
        const value = textarea.value.trim();
        if (!value) return;

        try {
            JSON.parse(value);
            textarea.style.borderColor = '#27ae60';
        } catch (error) {
            textarea.style.borderColor = '#e74c3c';
        }
    }

    addSingleTask() {
        const form = document.getElementById('singleTaskForm');
        const formData = new FormData(form);
        
        const task = {
            title: formData.get('title'),
            due_date: formData.get('due_date'),
            estimated_hours: parseFloat(formData.get('estimated_hours')),
            importance: parseInt(formData.get('importance')),
            dependencies: this.parseDependencies(formData.get('dependencies'))
        };

        if (!task.title || !task.due_date || isNaN(task.estimated_hours) || isNaN(task.importance)) {
            this.showError('Please fill all required fields correctly');
            return;
        }

        this.tasks.push(task);
        this.showSuccess(`Task "${task.title}" added successfully!`);
        form.reset();
        this.updateTaskList();
    }

    parseDependencies(depsString) {
        if (!depsString.trim()) return [];
        return depsString.split(',')
            .map(dep => parseInt(dep.trim()))
            .filter(id => !isNaN(id) && id > 0);
    }

    updateTaskList() {
        const taskList = document.getElementById('taskList');
        if (this.tasks.length === 0) {
            taskList.innerHTML = '<p class="no-tasks">No tasks added yet</p>';
            return;
        }

        taskList.innerHTML = this.tasks.map((task, index) => `
            <div class="task-list-item">
                <strong>${index + 1}. ${task.title}</strong>
                <div style="font-size: 0.9em; color: #666;">
                    Due: ${task.due_date} | Importance: ${task.importance}/10 | 
                    Hours: ${task.estimated_hours} | Dependencies: ${task.dependencies.length}
                </div>
            </div>
        `).join('');
    }

    clearAllTasks() {
        this.tasks = [];
        this.updateTaskList();
        this.showSuccess('All tasks cleared!');
    }

    async analyzeTasks() {
        const bulkInput = document.getElementById('bulkInput').value.trim();
        let tasksToAnalyze = [...this.tasks];

        if (bulkInput) {
            try {
                const bulkTasks = JSON.parse(bulkInput);
                if (Array.isArray(bulkTasks)) {
                    tasksToAnalyze = tasksToAnalyze.concat(bulkTasks);
                } else {
                    throw new Error('Bulk input must be a JSON array');
                }
            } catch (error) {
                this.showError('Invalid JSON in bulk input: ' + error.message);
                return;
            }
        }

        if (tasksToAnalyze.length === 0) {
            this.showError('Please add at least one task to analyze');
            return;
        }

        const strategy = document.getElementById('strategy').value;
        
        this.showLoading();
        this.hideError();

        try {
            const response = await fetch(`${this.apiBase}/analyze/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tasks: tasksToAnalyze,
                    strategy: strategy
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Analysis failed');
            }

            this.displayResults(data.tasks, data.strategy);
        } catch (error) {
            this.showError('Analysis failed: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async getSuggestions() {
        this.showLoading('suggestions');
        
        try {
            const response = await fetch(`${this.apiBase}/suggest/`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get suggestions');
            }

            this.displaySuggestions(data.suggestions);
        } catch (error) {
            this.showError('Failed to get suggestions: ' + error.message);
        } finally {
            this.hideLoading('suggestions');
        }
    }

    displayResults(tasks, strategy) {
        const resultsDiv = document.getElementById('results');
        
        if (tasks.length === 0) {
            resultsDiv.innerHTML = '<p class="no-results">No tasks to display</p>';
            return;
        }

        const strategyNames = {
            'smart_balance': 'Smart Balance',
            'fastest_wins': 'Fastest Wins', 
            'high_impact': 'High Impact',
            'deadline_driven': 'Deadline Driven'
        };

        let html = `
            <div class="results-header">
                <h3>Sorted by: ${strategyNames[strategy]}</h3>
                <p>Total tasks analyzed: ${tasks.length}</p>
            </div>
        `;

        tasks.forEach((task, index) => {
            const priorityClass = this.getPriorityClass(task.priority_score);
            const priorityText = this.getPriorityText(task.priority_score);
            
            html += `
                <div class="task-item">
                    <div class="task-header">
                        <div class="task-title">${index + 1}. ${task.title}</div>
                        <div class="priority-score ${priorityClass}">
                            Score: ${task.priority_score} (${priorityText})
                        </div>
                    </div>
                    <div class="task-details">
                        <div><strong>Due Date:</strong> ${task.due_date}</div>
                        <div><strong>Estimated Hours:</strong> ${task.estimated_hours}</div>
                        <div><strong>Importance:</strong> ${task.importance}/10</div>
                        <div><strong>Dependencies:</strong> ${task.dependencies?.length || 0}</div>
                    </div>
                    <div class="task-explanation">
                        ${this.generateExplanation(task, priorityText)}
                    </div>
                </div>
            `;
        });
        
        resultsDiv.innerHTML = html;
    }

    displaySuggestions(suggestions) {
        const suggestionsDiv = document.getElementById('suggestions');
        
        if (!suggestions || suggestions.length === 0) {
            suggestionsDiv.innerHTML = '<p>No suggestions available</p>';
            return;
        }

        let html = '<div class="suggestions-list">';
        
        suggestions.forEach((suggestion, index) => {
            html += `
                <div class="suggestion-item">
                    <div class="suggestion-header">
                        <strong>${index + 1}. ${suggestion.task}</strong>
                        <span class="suggestion-priority ${suggestion.priority.toLowerCase()}">
                            ${suggestion.priority}
                        </span>
                    </div>
                    <div class="suggestion-reason">${suggestion.reason}</div>
                    <div class="suggestion-hours">Estimated: ${suggestion.estimated_hours} hours</div>
                </div>
            `;
        });
        
        html += '</div>';
        suggestionsDiv.innerHTML = html;
    }

    getPriorityClass(score) {
        if (score >= 70) return 'priority-high';
        if (score >= 40) return 'priority-medium';
        return 'priority-low';
    }

    getPriorityText(score) {
        if (score >= 70) return 'High Priority';
        if (score >= 40) return 'Medium Priority';
        return 'Low Priority';
    }

    generateExplanation(task, priority) {
        const explanations = [];
        
        const dueDate = new Date(task.due_date);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue < 0) {
            explanations.push('OVERDUE - needs immediate attention');
        } else if (daysUntilDue === 0) {
            explanations.push('due TODAY');
        } else if (daysUntilDue <= 1) {
            explanations.push('due tomorrow');
        } else if (daysUntilDue <= 3) {
            explanations.push('due in 3 days');
        } else if (daysUntilDue <= 7) {
            explanations.push('due this week');
        }
        
        if (task.importance >= 9) {
            explanations.push('very high importance');
        } else if (task.importance >= 7) {
            explanations.push('high importance');
        }
        
        if (task.estimated_hours <= 1) {
            explanations.push('quick win (≤1 hour)');
        } else if (task.estimated_hours <= 2) {
            explanations.push('low effort (≤2 hours)');
        } else if (task.estimated_hours >= 8) {
            explanations.push('high effort task');
        }
        
        if (task.dependencies && task.dependencies.length > 0) {
            explanations.push(`blocks ${task.dependencies.length} other task(s)`);
        }
        
        return `This task has ${priority.toLowerCase()} because it's ${explanations.join(', ')}.`;
    }

    async testConnection() {
        try {
            const response = await fetch(`${this.apiBase}/`);
            if (response.ok) {
                console.log('✅ Backend connection successful');
            } else {
                this.showError('Backend connection failed. Make sure Django server is running on port 8000.');
            }
        } catch (error) {
            this.showError(`Cannot connect to backend: ${error.message}. Start the server with: python manage.py runserver`);
        }
    }

    showLoading(context = 'analyze') {
        const loadingElement = context === 'analyze' ? 
            document.getElementById('loading') : 
            document.getElementById('suggestions');
        loadingElement.classList.remove('hidden');
        if (context === 'suggestions') {
            loadingElement.innerHTML = 'Loading suggestions...';
        }
    }

    hideLoading(context = 'analyze') {
        const loadingElement = context === 'analyze' ? 
            document.getElementById('loading') : 
            document.getElementById('suggestions');
        loadingElement.classList.add('hidden');
    }

    showError(message) {
        const errorElement = document.getElementById('error');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    hideError() {
        document.getElementById('error').classList.add('hidden');
    }

    showSuccess(message) {
        const existingSuccess = document.querySelector('.success');
        if (existingSuccess) {
            existingSuccess.remove();
        }

        const successDiv = document.createElement('div');
        successDiv.className = 'success';
        successDiv.textContent = message;
        
        document.querySelector('.input-section').insertBefore(successDiv, document.querySelector('.strategy-selection'));
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TaskAnalyzer();
});