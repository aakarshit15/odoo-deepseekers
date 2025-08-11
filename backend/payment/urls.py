# payments/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("payment/", views.index, name="index"),
]
