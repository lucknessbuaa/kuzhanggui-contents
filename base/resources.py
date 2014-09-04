from django.core.urlresolvers import reverse  
from contents.models import Data,Like,Content,Option,Bigpicture
from django.views.decorators.http import require_POST,require_GET
from tastypie import fields
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django_render_json import render_json
from tastypie.constants import ALL,ALL_WITH_RELATIONS
from tastypie.resources import ModelResource
from django.forms.models import model_to_dict
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
        fields = ['id','name','image','description','contents']
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
        fields = ['id','name','image','description']
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
        fields = ['id','name','image','description','url','create_time']
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
        fields = ['id','name','image','url','data[0]']
        resource_name = 'bigpicture'

    def dehydrate(self,bundle):
        bundle.data['image'] = 'http://' + bundle.request.META.get('HTTP_HOST') + bundle.obj.image
        if (bundle.data['url']) :
            bundle.data['url'] = bundle.data['url'] or bundle.obj.contents.pk
        else  :
            bundle.data['data'] = model_to_dict(Option.objects.get(id=bundle.obj.contents.pk))
        return bundle

@csrf_exempt
@require_POST
def like(request):
    option_id = request.POST['option_id']
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

@csrf_exempt
@require_POST
def logs(request):
    uid = request.POST['uid']
    option_id = request.POST['option_id']
    options = Option.objects.filter(pk=option_id)
    judge = 2001
    if options.count()==1:
        judge = 0
        timeStamp = int(time.time())
        Data(uid=uid,option_id=option_id,date=timeStamp).save()
    return render_json({
            'ret_code':judge
    })

@csrf_exempt
@require_POST
def chart(request):
    date_begin = request.POST['date_begin']
    date_end = request.POST['date_end']
    option_id = request.POST['option_id']
    begin = int(date_begin)
    end = int(date_end)
    list = []
    user = []
    visit = []
    link = begin
    while link<=end :
        list.append(time.strftime('%m-%d',time.localtime(link)))
        data = Data.objects.filter(option_id=option_id,date__gte=link,date__lt=min(link+86400,end))
        visit.append(data.count())
        user.append(data.values("uid").distinct().count())
        link = link+86400
    
    return render_json({
        'ret_code':0,
        'date':list,
        'user':user,
        'visit':visit
    })
        

        
