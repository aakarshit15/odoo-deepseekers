from django.shortcuts import render
from django.conf import settings

# Create your views here.

def index(request):
    context = {
        'paypal_client_id': settings.PAYPAL_CLIENT_ID,
        'paypal_currency': settings.PAYPAL_CURRENCY,
    }
    return render(request, 'payment/index.html', context)