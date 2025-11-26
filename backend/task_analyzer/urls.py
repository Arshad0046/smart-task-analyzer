from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/tasks/', include('tasks.urls')),
    path('api/tasks', RedirectView.as_view(url='/api/tasks/', permanent=True)),
]