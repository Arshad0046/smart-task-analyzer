from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import date
from .scoring import calculate_priority_score, detect_circular_dependencies
from .serializers import TaskSerializer

@api_view(['GET'])
def task_list(request):
    return Response({
        "message": "Smart Task Analyzer API",
        "endpoints": {
            "POST /api/tasks/analyze/": "Analyze and prioritize tasks",
            "GET /api/tasks/suggest/": "Get task suggestions"
        },
        "strategies": ["smart_balance", "fastest_wins", "high_impact", "deadline_driven"]
    })

@api_view(['POST'])
def analyze_tasks(request):
    strategy = request.data.get('strategy', 'smart_balance')
    tasks = request.data.get('tasks', [])
    
    if not tasks:
        return Response(
            {"error": "No tasks provided"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    validated_tasks = []
    for task_data in tasks:
        serializer = TaskSerializer(data=task_data)
        if serializer.is_valid():
            validated_tasks.append(serializer.validated_data)
        else:
            return Response(
                {"error": f"Invalid task data: {serializer.errors}"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    tasks_with_ids = [{'id': i, **task} for i, task in enumerate(tasks)]
    circular_deps = detect_circular_dependencies(tasks_with_ids)
    if circular_deps:
        return Response(
            {"error": f"Circular dependencies detected: {circular_deps}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    analyzed_tasks = []
    for task in validated_tasks:
        score = calculate_priority_score(task, strategy)
        analyzed_task = task.copy()
        analyzed_task['priority_score'] = score
        analyzed_tasks.append(analyzed_task)
    
    sorted_tasks = sorted(analyzed_tasks, key=lambda x: x['priority_score'], reverse=True)
    
    return Response({
        "strategy": strategy,
        "tasks": sorted_tasks,
        "total_tasks": len(sorted_tasks)
    })

@api_view(['GET'])
def suggest_tasks(request):
    suggestions = [
        {
            "task": "Complete urgent project proposal",
            "reason": "High importance (8/10) and due tomorrow",
            "priority": "High",
            "estimated_hours": 4
        },
        {
            "task": "Fix login bug",
            "reason": "Blocks other team members, quick win (2 hours)",
            "priority": "Medium", 
            "estimated_hours": 2
        },
        {
            "task": "Update documentation",
            "reason": "Low effort (1 hour) and improves team productivity",
            "priority": "Medium",
            "estimated_hours": 1
        }
    ]
    
    return Response({
        "suggestions": suggestions,
        "date": date.today().isoformat()
    })