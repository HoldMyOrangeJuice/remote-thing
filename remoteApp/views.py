from django.shortcuts import render
import json
from django.http import HttpResponse
from remoteApp.models import Users
import os

page_data = {}
current_page = 0



def start_page(request):

    if request.GET.get("get_sound") and request.is_ajax():
        r = playAudioFile(request)
        print(r)
        return r

    if request.GET.get("get_username") and request.is_ajax():
        if Users.objects.all().filter(cookie=request.GET.get("get_username")).count() == 1:
            username = Users.objects.all().filter(cookie=request.GET.get("get_username"))[0].username
            return HttpResponse(json.dumps({"username": username}), content_type='application/json')

    return render(request, "start_page.html")



def playAudioFile(request):
        fname = f"remoteApp/static/{request.GET.get('get_sound')}.ogg"
        f = open(fname, "rb")
        response = HttpResponse()
        response.write(f.read())
        response['Content-Type'] = 'audio/mp3'
        response['Content-Length'] = os.path.getsize(fname)
        return response
