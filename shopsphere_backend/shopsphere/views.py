from django.http import HttpResponse

def home(request):
    return HttpResponse("Shopsphere backend is running successfully!")