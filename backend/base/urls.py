from django.urls import path
from .views_auth import *
from .views_owner import *
from .views_admin import *
from .views import *

urlpatterns = [
    # Authentication
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/logout-all/', LogoutAllView.as_view(), name='logout-all'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change-password'),

    # Facility Owner
    path('owner/venues/', OwnerVenueCreateView.as_view(), name='owner-add-venue'),
    path('owner/venues/<int:pk>/', OwnerVenueUpdateView.as_view(), name='owner-edit-venue'),
    path('owner/venues/<int:pk>/photos/', OwnerVenuePhotoUploadView.as_view(), name='owner-upload-venue-photo'),

    path('owner/courts/', OwnerCourtCreateView.as_view(), name='owner-add-court'),
    path('owner/courts/<int:pk>/', OwnerCourtUpdateView.as_view(), name='owner-edit-court'),

    path('owner/courts/<int:pk>/availability/', OwnerAvailabilityCreateView.as_view(), name='owner-add-availability'),
    path('owner/availability/<int:pk>/', OwnerAvailabilityUpdateView.as_view(), name='owner-edit-availability'),

    path('owner/courts/<int:pk>/block/', OwnerBlockSlotView.as_view(), name='owner-block-slot'),

    path('owner/bookings/', OwnerBookingsListView.as_view(), name='owner-bookings'),
    path('owner/dashboard/', OwnerDashboardView.as_view(), name='owner-dashboard'),

    # Admin
    path('admin/dashboard/', AdminDashboardView.as_view()),

    path('admin/venues/pending/', AdminPendingVenuesListView.as_view()),
    path('admin/venues/<int:pk>/approve/', AdminApproveVenueView.as_view()),
    path('admin/venues/<int:pk>/reject/', AdminRejectVenueView.as_view()),

    path('admin/users/', AdminUsersListView.as_view()),
    path('admin/users/<int:pk>/ban/', AdminBanUserView.as_view()),
    path('admin/users/<int:pk>/unban/', AdminUnbanUserView.as_view()),
    path('admin/users/<int:user_id>/bookings/', AdminUserBookingHistoryView.as_view()),

    path('admin/reports/', AdminReportsListView.as_view()),
    path('admin/reports/<int:pk>/resolve/', AdminResolveReportView.as_view()),
]
