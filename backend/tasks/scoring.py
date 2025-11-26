from datetime import date
from typing import List, Dict, Any

def calculate_priority_score(task: Dict[str, Any], strategy: str = "smart_balance") -> float:
    due_date = task.get('due_date')
    importance = task.get('importance', 5)
    estimated_hours = task.get('estimated_hours', 1)
    dependencies = task.get('dependencies', [])
    
    # Calculate urgency
    if due_date:
        today = date.today()
        days_until_due = (due_date - today).days
        
        if days_until_due < 0:
            urgency = 10
        elif days_until_due == 0:
            urgency = 9
        elif days_until_due <= 1:
            urgency = 8
        elif days_until_due <= 3:
            urgency = 7
        elif days_until_due <= 7:
            urgency = 5
        else:
            urgency = max(1, 10 - (days_until_due // 7))
    else:
        urgency = 3
    
    # Effort factor (inverse)
    effort_factor = max(0.1, 10 - min(estimated_hours, 10))
    
    # Dependency factor
    dependency_factor = len(dependencies) * 2 if dependencies else 1
    
    # Strategy weights
    if strategy == "fastest_wins":
        weights = {'urgency': 0.2, 'importance': 0.2, 'effort': 0.6, 'dependencies': 0.1}
    elif strategy == "high_impact":
        weights = {'urgency': 0.2, 'importance': 0.6, 'effort': 0.1, 'dependencies': 0.2}
    elif strategy == "deadline_driven":
        weights = {'urgency': 0.7, 'importance': 0.2, 'effort': 0.05, 'dependencies': 0.1}
    else:  # smart_balance
        weights = {'urgency': 0.4, 'importance': 0.3, 'effort': 0.2, 'dependencies': 0.2}
    
    # Calculate score
    base_score = (
        urgency * weights['urgency'] +
        importance * weights['importance'] +
        effort_factor * weights['effort'] +
        dependency_factor * weights['dependencies']
    )
    
    normalized_score = min(100, max(0, base_score * 5))
    return round(normalized_score, 2)

def detect_circular_dependencies(tasks: List[Dict[str, Any]]) -> List[List[int]]:
    circular_deps = []
    visited = set()
    
    def check_circular_dependency(task_id, path):
        if task_id in path:
            circular_start = path.index(task_id)
            circular_deps.append(path[circular_start:] + [task_id])
            return
        
        if task_id in visited:
            return
        
        visited.add(task_id)
        path.append(task_id)
        
        task = next((t for t in tasks if t.get('id') == task_id), None)
        if task:
            for dep_id in task.get('dependencies', []):
                check_circular_dependency(dep_id, path.copy())
    
    for task in tasks:
        if task.get('id') not in visited:
            check_circular_dependency(task.get('id'), [])
    
    return circular_deps