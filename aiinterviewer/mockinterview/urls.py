from django.contrib.auth import views as auth_views
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('interview/', views.interview_list, name='interview_list'),
    path('interview/<str:topic>/', views.start_interview, name='start_interview'),
    path('interview/<str:topic>/question/', views.next_question, name='next_question'),
    path('interview/<str:topic>/complete/', views.interview_complete, name='interview_complete'),
    path('review/', views.review_answers, name='review_answers'),
    path('review/export-pdf/', views.export_pdf, name='export_pdf'),
    path('progress/', views.progress_view, name='progress'),

    path('progress/', views.progress_view, name='progress_view'),

    # ✅ Login/Logout URLs
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='/'), name='logout'),
]
