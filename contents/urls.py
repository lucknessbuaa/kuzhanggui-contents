from django.conf.urls import patterns, include, url 
from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
import contents.options.views

#from contents.options.views import add_option,edit_option,delete_option,add_bigpicture,edit_bigpicture,delete_bigpicture
#admin.autodiscover()
from contents.options.views import add_option,edit_option,delete_option,add_bigpicture,edit_bigpicture,delete_bigpicture

def index(request):
    return HttpResponse("hello contents")

urlpatterns = patterns('contents.views',
    url(r'^$','index'),
    url(r'^add$','add_content'),
    url(r'^edit$','edit_content'),
    url(r'^delete$','delete_content'),
    url(r'^(?P<content_id>\d+)/$', contents.options.views.index),
    url(r'^(?P<content_id>\d+)/editopt$', edit_option),
    url(r'^(?P<content_id>\d+)/addopt$', add_option),
    url(r'^(?P<content_id>\d+)/deleteopt$', delete_option),
    url(r'^(?P<content_id>\d+)/editbp$', edit_bigpicture),
    url(r'^(?P<content_id>\d+)/addbp$', add_bigpicture),
    url(r'^(?P<content_id>\d+)/deletebp$', delete_bigpicture),
)
