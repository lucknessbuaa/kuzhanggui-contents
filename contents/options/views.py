#coding: utf-8
import time
import logging

from django.http import HttpResponse
from django.shortcuts import render, redirect
#from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_http_methods, require_POST
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.safestring import mark_safe
from django import forms

from django.utils.html import escape
from django.forms.models import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
import json

#from underscore import _ as us
from django_tables2 import RequestConfig 
import django_tables2 as tables
from django_render_json import json as as_json
#from django_render_json import render_json

from contents.models import Content, Option, Bigpicture
from ajax_upload.widgets import AjaxClearableFileInput
from ckeditor.widgets import CKEditorWidget

logger = logging.getLogger(__name__)

class OptionForm(forms.ModelForm):
    contents = forms.CharField(label='内容', widget=CKEditorWidget(), required = False)
    class Meta:
        model = Option
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',                
                'parsley-required': 'true'
            }), 
            'description': forms.Textarea(attrs={
                'class': 'form-control',                
                'rows' : '4'
            }), 
            'image': AjaxClearableFileInput(attrs={
                'class': 'form-control',
                'parsley-required': 'true'
            }),
            'url':forms.URLInput(attrs={
                'class': 'form-control',
                'parsley-required': 'true',
            }),
        }

class BigpictureForm(forms.ModelForm):
    contents = forms.ModelChoiceField(required=False,queryset=Option.objects.all(),label=u'content',
        widget=forms.Select(attrs={
            'class': 'form-control',
        }))   
    url = forms.CharField(required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
        })) 
    class Meta:
        model = Bigpicture
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',    
                'parsley-required': 'true'
            }),  
            'image': AjaxClearableFileInput(attrs={
                'class': 'form-control',
                'parsley-required': 'true'
            }), 
        }
        

class BigpictureTable(tables.Table):
    ops1 = tables.columns.TemplateColumn(verbose_name=u'ops', template_name='options/bigpicture_ops.html', orderable=False)
    url = tables.columns.Column(empty_values=()) 
    class Meta:
        model = Bigpicture
        fields = ('name', 'image','url')
        empty_text = u'No Big Pictures'
        orderable = False 
        attrs = { 
           'class': 'table table-bordered table-striped'
        }    

    def render_image(request,value):
        return mark_safe("<a href='/media/%s'><img class='img-thumbnail' src='/media/%s'></a>" % (value,value))
    
    def render_url(request,record):
        if record.contents is None :
            output = mark_safe('<span class="glyphicon glyphicon-link"></span><a href="%s" target="_blank">   %s</a>'%(record.url,record.url)) 
        else :
            temp = 'file' if record.contents.type==1 else "picture" if record.contents.type==2 else "film"
            output = mark_safe('<span class="glyphicon glyphicon-%s"></span>   %s'%(temp,record.contents.name))
        return output


class OptionTable(tables.Table):
    ops = tables.columns.TemplateColumn(verbose_name=u'ops', template_name='options/option_ops.html', orderable=False)
    type = tables.columns.Column(verbose_name=u'type')
    create_time = tables.columns.DateTimeColumn(verbose_name='Create Time',empty_values=(), format='Y-m-d H:i')
    user = tables.columns.Column(verbose_name=u'users',default = 0)
    visit = tables.columns.Column(verbose_name=u'visits',default = 0)
    
    def render_type(request, record):
       value = "Article" if record.type==1 else "Image" if record.type==2 else "Video"
       return value

    class Meta:
       model = Option
       fields = ('name','type','create_time','user','visit')  
       empty_text = u'No Contents'
       orderable =False
       attrs = {
           'class': 'table table-bordered table-striped'
       } 

@require_GET
@ensure_csrf_cookie
def index(request, content_id):

    content = Content.objects.get(pk=content_id)
    name = content.name
    options = Option.objects.filter(content_id=content_id)
    table = OptionTable(options)
    bigpicture = Bigpicture.objects.filter(content_id=content_id)
    table1 = BigpictureTable(bigpicture)    
    logger.debug("---------------------begin-------------------------") 
    logger.debug(BigpictureForm())
    logger.debug("---------------------end---------------------------")
    
    RequestConfig(request, paginate={"per_page": 10}).configure(table) 
    return render(request, "options/options.html",{
        'table1': table1,
        'table': table,
        'spt_bp':content.spt_bp,
        'spt_ar':content.spt_ar,
        'spt_vi':content.spt_vi,
        'spt_im':content.spt_im,
        'name':name,
        'form':OptionForm(),
        'form1':BigpictureForm(),
    })

@require_POST
@as_json
def add_option(request,content_id):
    data = request.POST.copy()
    data['content'] = content_id
    form = OptionForm(data)
    if not form.is_valid():
        logger.warn("form is invalid");
        logger.warn("error");
        logger.warn(form.errors);
        return {'ret_code': 1002}
    form.save()
    return {'ret_code':0}

@require_POST
@as_json
def edit_option(request,content_id):
    pk = request.POST.get("pk",None)
    if pk is None:
        return {'ret_code': 1002}
    instance = Option.objects.get(pk=pk)
    data = request.POST.copy()
    data['content']=content_id
    form = OptionForm(data,instance=instance)

    if not form.is_valid():
        logger.warn("form is invalid");
        return{'ret_code':1002}

    form.save()
    return {'ret_code':0}

@require_POST
@as_json
def delete_option(request,content_id):
    pk = request.POST.get("pk",'')
    Option.objects.filter(pk=pk).delete()
    return {'ret_code': 0}

@require_POST
@as_json
def add_bigpicture(request,content_id):
    data = request.POST.copy()
    data['content'] = content_id
    logger.debug(data)
    form = BigpictureForm(data)   
    logger.debug("---------------------begin-------------------------") 
    logger.debug(data)
    logger.debug(form)
    logger.debug("---------------------end---------------------------") 
    if not form.is_valid():        
        logger.warn("form is invalid");        
        logger.warn("error");
        logger.warn(form.errors);
        return {'ret_code': 1002}
    form.save()
    return {'ret_code':0}

@require_POST
@as_json
def edit_bigpicture(request,content_id):
    pk = request.POST.get("pk",None)
    if pk is None:
        return {'ret_code': 1002}
    instance = Bigpicture.objects.get(pk=pk)
    data = request.POST.copy()
    data['content']=content_id
    form = BigpictureForm(data,instance=instance)
    
    logger.debug("---------------------begin-------------------------") 
    logger.debug(form.errors)
    logger.debug(data)
    logger.debug(form)
    logger.debug("---------------------end---------------------------") 

    if not form.is_valid():
        logger.warn("form is invalid");
        return{'ret_code':1002}

    form.save()
    return {'ret_code':0}

@require_POST
@as_json
def delete_bigpicture(request,content_id):
    pk = request.POST.get("pk",'')
    Bigpicture.objects.filter(pk=pk).delete()
    return {'ret_code': 0}
    
