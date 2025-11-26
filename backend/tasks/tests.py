from django.test import TestCase
from datetime import date, timedelta
from .scoring import calculate_priority_score, detect_circular_dependencies

class ScoringAlgorithmTests(TestCase):
    
    def test_basic_scoring(self):
        task = {
            'title': 'Test Task',
            'due_date': date.today() + timedelta(days=7),
            'estimated_hours': 2,
            'importance': 8,
            'dependencies': []
        }
        
        score = calculate_priority_score(task)
        self.assertIsInstance(score, float)
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)
    
    def test_overdue_task(self):
        overdue_task = {
            'due_date': date.today() - timedelta(days=1),
            'estimated_hours': 2,
            'importance': 5,
            'dependencies': []
        }
        
        future_task = {
            'due_date': date.today() + timedelta(days=30),
            'estimated_hours': 2,
            'importance': 5,
            'dependencies': []
        }
        
        overdue_score = calculate_priority_score(overdue_task)
        future_score = calculate_priority_score(future_task)
        self.assertGreater(overdue_score, future_score)
    
    def test_circular_dependencies(self):
        tasks = [
            {'id': 1, 'dependencies': [2]},
            {'id': 2, 'dependencies': [3]},
            {'id': 3, 'dependencies': [1]}
        ]
        
        circular_deps = detect_circular_dependencies(tasks)
        self.assertEqual(len(circular_deps), 1)
        self.assertIn(1, circular_deps[0])