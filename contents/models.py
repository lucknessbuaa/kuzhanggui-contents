#coding:utf8
import logging
from django.db import models
from ckeditor.fields import RichTextField


logger = logging.getLogger(__name__)

class Content(models.Model):
    name = models.CharField(verbose_name=u'Title',max_length=20)
    
    spt_bp = models.BooleanField(default=False)
    spt_ar = models.BooleanField(default=False)
    spt_im = models.BooleanField(default=False)
    spt_vi = models.BooleanField(default=False)

    @property
    def article(self):
        return Option.objects.filter(content=self,type=1).count()
    @property
    def image(self):
        return Option.objects.filter(content=self,type=2).count()
    @property
    def video(self):
        return Option.objects.filter(content=self,type=3).count()
    
    class Meta:
        db_table = u'contents'

class Option(models.Model):
    content = models.ForeignKey(Content)
    type = models.IntegerField(default=0)
    name = models.CharField(verbose_name=u'Title',max_length=20)
    image = models.CharField(verbose_name=u'Cover',help_text=u"大小不能超过1M",max_length=255)
    description = models.TextField(u'Description', blank=True)
    contents = RichTextField(verbose_name=u'Content',blank=True)
    url = models.CharField(verbose_name=u'URL',max_length=100,blank=True)
    create_time = models.DateTimeField(verbose_name='Create Time', auto_now_add=True, editable=False)

    def __unicode__(self):
        return self.name


class Bigpicture(models.Model):
    content = models.ForeignKey(Content)
    name = models.CharField(verbose_name=u'Title',max_length=50)
    image = models.CharField(verbose_name=u'Image',help_text=u"大小不能超过1M",max_length=255)
    url = models.CharField(verbose_name=u'URL',max_length=100, blank=True,null=True)
    contents = models.ForeignKey(Option,blank=True, null=True)
