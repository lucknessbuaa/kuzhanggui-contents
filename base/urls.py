from django.conf.urls import patterns, include, url
from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
from resources import *
from tastypie.api import Api

def index(request):
    return HttpResponse("hello world")

v = Api(api_name = 'output')
v.register(ContentResource())
v.register(OptionResource())
v.register(ArticleResource())
v.register(VideoResource())
v.register(ImageResource())
v.register(BigpictureResource())
urlpatterns = patterns('',
    url(r'^$',index),
    (r'^ckeditor/', include('ckeditor.urls')),
    url(r'^ajax-upload/', include('ajax_upload.urls')),
    url(r'^contents/backend/',include('contents.urls')),
    url(r'^contents/API/',include(v.urls)),
    url(r'^contents/API/likes$',like)
)
if settings.DEBUG:
    urlpatterns += patterns('',
        (r'^media/(?P<path>.*)$','django.views.static.serve',{'document_root': settings.MEDIA_ROOT}))
