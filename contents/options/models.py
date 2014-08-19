import logging
from django.db import models

logger = logging.getLogger(__name__)

class Content(models.Model):
    name = models.CharField(verbose_name=u'Title',max_length=50)
    
    spt_bp = models.BooleanField(default=False)
    spt_ar = models.BooleanField(default=False)
    spt_im = models.BooleanField(default=False)
    spt_vi = models.BooleanField(default=False)

    def article(self):
        return Option.objects.filter(content=self,type=1).count()

    def image(self):
        return Option.objects.filter(content=self,type=2).count()

    def video(self):
        return Option.objects.filter(content=self,type=3).count()

class Option(models.Model):
    content = models.ForeignKey(Content)
    type = models.IntegerField(default=0)
    name = models.CharField(verbose_name=u'Title',max_length=50)
    image = models.CharField(verbose_name=u'Cover',max_length=255)
    description = models.TextField(u'Description', blank=True)
    contents = models.TextField(u'Content', blank=True,default='contents')
    url = models.CharField(verbose_name=u'URL',max_length=100,default='url')


class Bigpicture(models.Model):
    choices = []
    for event in Option.objects.all():
        choices.append(event.name)
    content = models.ForeignKey(Content)
    name = models.CharField(verbose_name=u'Title',max_length=50)
    image = models.CharField(verbose_name=u'Image',max_length=255)
    url = models.CharField(verbose_name=u'URL',max_length=100,blank=Ture)
    contents = models.IntegerField(choices=choices, default = 1,blank=True)
