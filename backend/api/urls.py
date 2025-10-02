# api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('question/', views.get_question, name='get_question'),
    path('answer/', views.submit_answer, name='submit_answer'),
    path('end/', views.end_interview, name='end_interview'),
    path('api/test-assemblyai/', views.test_assemblyai),
]