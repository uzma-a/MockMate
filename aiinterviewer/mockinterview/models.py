from django.db import models
from django.contrib.auth.models import User

class MockInterview(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.CharField(max_length=100)
    score = models.IntegerField()
    total_questions = models.IntegerField()
    date_taken = models.DateTimeField(auto_now_add=True)

    def percentage(self):
        return (self.score / self.total_questions) * 100
