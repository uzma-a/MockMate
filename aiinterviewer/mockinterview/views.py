from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.template.loader import get_template
from django.http import HttpResponse
from xhtml2pdf import pisa
from .models import MockInterview
from django.contrib.auth.decorators import login_required

questions_by_topic = {
    'python': [
        "What are Python decorators?",
        "Explain the difference between list and tuple.",
        "What is a Python generator?",
        "What is the purpose of `__init__` in Python classes?",
        "How does exception handling work in Python?",
        "Explain list comprehension with an example.",
        "What is the GIL in Python?",
        "Difference between shallow copy and deep copy?",
        "What is lambda function in Python?",
        "What are Python's data types?"
    ],
    'django': [
        "What is Django ORM?",
        "Explain Django's MVT architecture.",
        "What are middleware in Django?",
        "How are static files managed in Django?",
        "What is the use of Django admin?",
        "What is the purpose of forms in Django?",
        "Explain the use of `@login_required`.",
        "What is a queryset in Django?",
        "How does URL routing work in Django?",
        "What is context in Django templates?"
    ],
    'javascript': [
        "What is event bubbling in JavaScript?",
        "Difference between `let`, `var`, and `const`?",
        "What is closure in JavaScript?",
        "Explain JavaScript promises.",
        "What is async/await?",
        "What is the DOM?",
        "Explain arrow functions.",
        "Difference between `==` and `===`?",
        "What is hoisting?",
        "What are JavaScript data types?"
    ],
    'react': [
        "What is a React component?",
        "What is the difference between props and state?",
        "What are hooks in React?",
        "Explain useEffect hook.",
        "What is JSX?",
        "What is virtual DOM?",
        "Explain React lifecycle methods.",
        "What is lifting state up?",
        "Difference between functional and class components?",
        "What is React Router?"
    ]
}

def home(request):
    return render(request, 'home.html')  

def about(request):
    return render(request, 'about.html')


def interview_list(request):
    return render(request, 'interview_list.html')


def start_interview(request, topic):
    request.session['question_number'] = 0
    request.session['answers'] = []
    request.session['score'] = 0
    return redirect('next_question', topic=topic)


@csrf_exempt
def next_question(request, topic):
    question_number = request.session.get('question_number', 0)
    questions = questions_by_topic.get(topic.lower(), [])

    if question_number >= len(questions):
        return redirect('interview_complete', topic=topic)

    question = questions[question_number]

    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'submit':
            user_answer = request.POST.get('answer', '').strip()
            answers = request.session.get('answers', [])
            answers.append({
                'question': question,
                'answer': user_answer,
                'score': 1 if user_answer else 0  # or custom scoring logic
            })
            request.session['answers'] = answers
        # if skipped, don't save anything for this question

        request.session['question_number'] = question_number + 1
        return redirect('next_question', topic=topic)

    return render(request, 'start_interview.html', {
        'topic': topic,
        'question': question,
        'question_number': question_number + 1,
        'total_questions': len(questions),
    })



@login_required
def interview_complete(request, topic):
    answers = request.session.get('answers', [])
    score = sum(item.get('score', 0) for item in answers)
    total = len(questions_by_topic.get(topic.lower(), []))

    # Save to DB
    MockInterview.objects.create(
        user=request.user,
        topic=topic,
        score=score,
        total_questions=total
    )

    return render(request, 'interview_complete.html', {
        'topic': topic,
        'answers': answers,
        'score': score,
        'total': total,
    })


def review_answers(request):
    answers = request.session.get('answers', [])
    return render(request, 'review_answers.html', {'answers': answers})


def export_pdf(request):
    answers = request.session.get('answers', [])
    template_path = 'export_pdf_template.html'
    context = {'answers': answers}

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="interview_review.pdf"'

    template = get_template(template_path)
    html = template.render(context)
    pisa_status = pisa.CreatePDF(html, dest=response)

    if pisa_status.err:
        return HttpResponse('Error generating PDF', status=500)
    return response

@login_required
def progress_view(request):
    interviews = MockInterview.objects.filter(user=request.user).order_by('-date_taken')

    # Progress by topic
    topic_summary = {}
    for interview in interviews:
        topic = interview.topic
        topic_data = topic_summary.get(topic, {'count': 0, 'total_score': 0, 'total_questions': 0})
        topic_data['count'] += 1
        topic_data['total_score'] += interview.score
        topic_data['total_questions'] += interview.total_questions
        topic_summary[topic] = topic_data

    for topic, data in topic_summary.items():
        data['average'] = round((data['total_score'] / data['total_questions']) * 100, 2)

    return render(request, 'progress.html', {
        'interviews': interviews,
        'topic_summary': topic_summary
    })

@login_required
def reset_progress(request):
    if request.method == 'POST':
        # Delete all interviews of the logged-in user
        MockInterview.objects.filter(user=request.user).delete()
    return redirect('progress')  # Redirect back to progress page