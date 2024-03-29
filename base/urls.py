from django.conf.urls import patterns, include, url
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.shortcuts import redirect
from resources import *
from tastypie.api import Api

def index(request):
    return redirect('/contents/backend');

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
    url(r'^contents/ajax-upload/', include('ajax_upload.urls')),
    url(r'^contents/backend/',include('contents.urls')),
    url(r'^contents/API/',include(v.urls)),
    url(r'^contents/API/likes$',like),
    url(r'^contents/API/logs$',logs),
    url(r'^contents/API/chart$',chart),
    url(r'^contents/API/',include(v.urls)),
    url(r'^contents/API/likes$',like)
)
urlpatterns = urlpatterns + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
if settings.DEBUG:
    urlpatterns += patterns('',
        (r'^media/(?P<path>.*)$','django.views.static.serve',{'document_root': settings.MEDIA_ROOT}))
