#coding: utf-8
import time
import logging

from django.shortcuts import render,redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_http_methods, require_POST
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.translation import ugettext_lazy as _
from django.utils.safestring import mark_safe
from django import forms

from django_tables2 import RequestConfig 
import django_tables2 as tables
from django_render_json import json as as_json
from django_render_json import render_json

from contents.models import Content,Option

logger = logging.getLogger(__name__)

class ContentTable(tables.Table):
    ops = tables.columns.TemplateColumn(verbose_name=_('ops'),template_name='content_ops.html',orderable=False)
    article = tables.columns.Column(verbose_name=_('articles'),orderable=False)
    image = tables.columns.Column(verbose_name=_('images'),orderable=False)
    video = tables.columns.Column(verbose_name=_('videos'),orderable=False)

    def render_article(self,record):
        return record.article

    def render_image(self,record):
        return record.image

    def render_video(self,record):
        return record.video
    
    class Meta:
        model=Content
        fields=("name","article","image","video") 
        empty_text=_('No Contents')
        orderable=False
        attrs = {
            'class': 'table table-bordered table-striped'
        }


@require_GET
@ensure_csrf_cookie
def index(request):
    data = Content.objects.all().order_by('-pk');
    
    table = ContentTable(data)
    RequestConfig(request, paginate={"per_page": 10}).configure(table)
    return render(request,"contents.html",{
        'table':table
    })

class ContentForm(forms.ModelForm):
    name = forms.CharField(label=u'Hello', max_length=255) 
    
    class Meta:
        model = Content
        
@require_POST
@as_json
def add_content(request):
    form = ContentForm(request.POST)
    if not form.is_valid():
        logger.warn("form is invalid");
        logger.warn(form.errors);
        return { 'ret_code': 1002 }
    
    form.save()
    return {'ret_code':0}

@require_POST
@as_json
def edit_content(request):
    pk = request.POST.get("pk",None)
    if pk is None:
        return { 'ret_code':1002 }

    instance = Content.objects.get(pk=pk)
    form = ContentForm(request.POST, instance=instance)
    
    if not form.is_valid():
        logger.warn("form is invalid");
        return {'ret_code':1002} 

    form.save()
    return { 'ret_code': 0 }   

@require_POST
@as_json
def delete_content(request):
    pk = request.POST.get("pk", '')
    Content.objects.filter(pk=pk).delete()
    return {'ret_code': 0}



