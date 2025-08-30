from django.urls import path
from .views import SearchScholarView, TextClassifierView, SampleTextView
urlpatterns = [
    path("sample/<str:category>/", SampleTextView.as_view(), name="sample-text"),
    path("search/", SearchScholarView.as_view(), name="search"),
    path("classify/", TextClassifierView.as_view(), name="classify"),
]