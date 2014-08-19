from django.core.urlresolvers import reverse  
from contents.models import Content,Option,Bigpicture
from tastypie import fields
from tastypie.constants import ALL,ALL_WITH_RELATIONS
from tastypie.resources import ModelResource
import logging
logger = logging.getLogger(__name__)

class ContentResource(ModelResource):
    
    class Meta:
        queryset = Content.objects.all()
        resource_name = 'content'

class OptionResource(ModelResource):
    
    class Meta:
        queryset = Option.objects.all()
        resource_name = 'option'

class ArticleResource(ModelResource):
    
    content = fields.ForeignKey(ContentResource,'content')
    class Meta:
        queryset = Option.objects.filter(type=1)
        
        fields = ['name','image','description','contents']
        resource_name = 'article'

class ImageResource(ModelResource):
        
    content = fields.ForeignKey(ContentResource,'content')
    class Meta:
        queryset = Option.objects.filter(type=2)
        fields = ['name','image','description']
        resource_name = 'image'

class VideoResource(ModelResource):
    
    content = fields.ForeignKey(ContentResource,'content')
    class Meta:
        queryset = Option.objects.filter(type=3)
        fields = ['name','image','description','url']
        resource_name = 'video'

class BigpictureResource(ModelResource):
    
    content = fields.ForeignKey(ContentResource,'content')
    class Meta:
        queryset = Bigpicture.objects.all()
        fields = ['name','image','url']
        resource_name = 'bigpicture'
    def dehydrate(self,bundle):
        if bundle.data['url']== "":
             bundle.data['url']= bundle.obj.contents.pk
        return bundle
