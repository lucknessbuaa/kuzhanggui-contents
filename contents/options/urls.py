from django.conf.urls import patterns, include, url 
from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
#admin.autodiscover()

def index(request):
    return HttpResponse("hello contents")

urlpatterns = patterns('',
    url(r'^$',index),
)
