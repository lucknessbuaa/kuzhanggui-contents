from django.core.urlresolvers import reverse  
from contents.models import Content,Option,Bigpicture
from tastypie import fields
from tastypie.constants import ALL,ALL_WITH_RELATIONS
from tastypie.resources import ModelResource
import logging
logger = logging.getLogger(__name__)



class ContentResource(ModelResource):
    bigpicture = fields.ToManyField('base.resources.BigpictureResource', 'bigpicture_set', related_name='content')
    article = fields.ToManyField('base.resources.OptionResource',
        attribute=lambda bundle: Option.objects.filter(type=1,content_id=bundle.obj.pk),
        full=True, null=True)
    image = fields.ToManyField('base.resources.OptionResource',        
        attribute=lambda bundle: Option.objects.filter(type=2,content_id=bundle.obj.pk),        
        full=True, null=True)
    video = fields.ToManyField('base.resources.OptionResource',                
        attribute=lambda bundle: Option.objects.filter(type=3,content_id=bundle.obj.pk),   
        full=True, null=True)
    class Meta:
        queryset = Content.objects.all()
        resource_name = 'content'



class OptionResource(ModelResource):
    class Meta:
        queryset = Option.objects.all()
        resource_name = 'option'

class ArticleResource(ModelResource):

    content = fields.ToOneField(ContentResource, 'content')    
    content = fields.ForeignKey(ContentResource,'content')
    class Meta:
        queryset = Option.objects.filter(type=1)        
        fields = ['name','image','description','contents']
        resource_name = 'article'
        filtering = {
            'content': ALL
        }
    def dehydrate(self,bundle):
        bundle.data['image']='d.heoh.me/media/'+bundle.obj.image
        return bundle

class ImageResource(ModelResource):
        
    content = fields.ForeignKey(ContentResource,'content')
    class Meta:
        queryset = Option.objects.filter(type=2)
        fields = ['name','image','description']
        resource_name = 'image'
        filtering = { 
            'content': ALL 
        }   
    def dehydrate(self,bundle):
        bundle.data['image']='d.heoh.me/media/'+bundle.obj.image
        return bundle

class VideoResource(ModelResource):
    
    content = fields.ForeignKey(ContentResource,'content')
    class Meta:
        queryset = Option.objects.filter(type=3)
        fields = ['name','image','description','url']
        resource_name = 'video'
        filtering = { 
            'content': ALL 
        }   
    def dehydrate(self,bundle):
        bundle.data['image']='d.heoh.me/media/'+bundle.obj.image
        return bundle
class BigpictureResource(ModelResource):
    
    content = fields.ForeignKey(ContentResource,'content')
    class Meta:
        queryset = Bigpicture.objects.all()
        fields = ['name','image','url']
        resource_name = 'bigpicture'
    def dehydrate(self,bundle):
        bundle.data['image']='d.heoh.me/media/'+bundle.obj.image
        if bundle.data['url']== "":
             bundle.data['url']= bundle.obj.contents.pk
        return bundle
