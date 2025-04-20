from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CurrentUserView

router = DefaultRouter()
router.register(r'', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('me/', CurrentUserView.as_view(), name='current-user'),
]