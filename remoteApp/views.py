from django.shortcuts import render
import json
from django.http import HttpResponse
import  os

page_data = {}
current_page = 0



def start_page(request):

    if request.GET.get("get_sound") and request.is_ajax():
        r = playAudioFile(request)
        print(r)
        return r

    return render(request, "start_page.html")


def playAudioFile(request):
        fname = f"remoteApp/static/{request.GET.get('get_sound')}.ogg"
        f = open(fname, "rb")
        response = HttpResponse()
        response.write(f.read())
        response['Content-Type'] = 'audio/mp3'
        response['Content-Length'] = os.path.getsize(fname)
        return response
