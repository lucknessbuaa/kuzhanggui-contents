#coding:utf-8
import logging
from django.db import models
from django.utils.translation import ugettext_lazy as _
from ckeditor.fields import RichTextField
from r import redis
import time

logger = logging.getLogger(__name__)

class Content(models.Model):
    name = models.CharField(verbose_name=_('name'), max_length=20)
    
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
    @property
    def key(self):
        return 'content-'+ str(self.pk)
    
    class Meta:
        db_table = u'contents'


class Option(models.Model):
    content = models.ForeignKey(Content)
    type = models.IntegerField(default=0)
    name = models.CharField(verbose_name=_('name'), max_length=20)
    image = models.CharField(verbose_name=_('cover'), help_text=u"大小不能超过1M",max_length=255)
    description = models.TextField(_('description'), blank=True)
    contents = RichTextField(verbose_name=_('content'), blank=True)
    url = models.CharField(verbose_name=_('url'), max_length=100,blank=True)
    create_time = models.DateTimeField(verbose_name=_('Create Time'), auto_now_add=True, editable=False)

    def __unicode__(self):
        return self.name

    @property
    def votes(self):
        result = redis.zscore(self.content.key,str(self.pk))
        return 0 if result is None else int(result)

    def addLike(self):
        redis.zincrby(self.content.key,str(self.pk))
        return self.votes


class Bigpicture(models.Model):
    content = models.ForeignKey(Content)
    name = models.CharField(verbose_name=_('name'), max_length=50)
    image = models.CharField(verbose_name=_('cover'), help_text=u"大小不能超过1M",max_length=255)
    url = models.CharField(verbose_name=_('url'), max_length=100, blank=True,null=True)
    contents = models.ForeignKey(Option,blank=True, null=True)


class Like(models.Model):
    option = models.ForeignKey(Option)
    likes = models.IntegerField(null=True,blank=True,default=0)


class Data(models.Model):
    uid = models.CharField(verbose_name=u'uid',max_length=255)
    option = models.ForeignKey(Option)
    date = models.CharField(max_length=255)

