from django.core.urlresolvers import reverse  
from contents.models import Like,Content,Option,Bigpicture
from django.views.decorators.http import require_POST,require_GET
from tastypie import fields
from django_render_json import render_json
from tastypie.constants import ALL,ALL_WITH_RELATIONS
from tastypie.resources import ModelResource
from r import redis
import time
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
        bundle.data['image'] = 'http://' + bundle.request.META.get('HTTP_HOST') + bundle.obj.image
        likes = Like.objects.filter(option_id=bundle.obj.id)
        count = 0 
        for like in likes :
            count = count + like.likes
        bundle.data['likes'] = count
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
        logger.debug(str(bundle.request.META))
        bundle.data['image'] = 'http://' + bundle.request.META.get('HTTP_HOST') + bundle.obj.image
        bundle.data['id'] = bundle.obj.pk
        likes = Like.objects.filter(option_id=bundle.obj.id)
        count = 0
        for like in likes :
            count = count + like.likes
        bundle.data['likes'] = count
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
        bundle.data['image'] = 'http://' + bundle.request.META.get('HTTP_HOST') + bundle.obj.image        
        likes = Like.objects.filter(option_id=bundle.obj.id)
        count = 0 
        for like in likes :
            count = count + like.likes
        bundle.data['likes'] = count
        return bundle


class BigpictureResource(ModelResource):
    
    content = fields.ForeignKey(ContentResource,'content')

    class Meta:
        queryset = Bigpicture.objects.all()
        fields = ['name','image','url']
        resource_name = 'bigpicture'

    def dehydrate(self,bundle):
        bundle.data['image'] = 'http://' + bundle.request.META.get('HTTP_HOST') + bundle.obj.image
        bundle.data['url'] = bundle.data['url'] or bundle.obj.contents.pk
        return bundle

@require_GET
def like(request):
    option_id = request.GET['option_id']
    options = Option.objects.filter(pk=option_id)
    judge = False
    if options.count()==1:
        like = Like.objects.filter(option_id=option_id)
        if like.count()==0:
            Like(option_id=option_id,likes=1).save()
            temp = like[0].id
            like = Like.objects.get(id=temp)
        else : 
            temp = like[0].id
            like = Like.objects.get(id=temp )
            temp = like.likes
            like.likes = temp+1
            like.save()
        judge = True 
    if judge:
        return render_json({
            'likes':like.likes,
            'ret_code':0
        })
    else : 
        return render_json({
            'ret_code':2001
        })

