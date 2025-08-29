from django.urls import path
from .views import SearchScholarView
urlpatterns = [
    path("search/", SearchScholarView.as_view(), name="search"),
]