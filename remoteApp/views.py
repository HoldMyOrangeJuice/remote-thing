from django.shortcuts import render
import json
from django.http import HttpResponse


page_data = {}
current_page = 0



def start_page(request):

    global current_page, page_data
    if request.POST.get("update_canvas_image"):
        image = {"action": request.POST.get("action"),  "data": request.POST.get("data")}

        if page_data.get(current_page):
            page_data[current_page]["image"] = image
        else:
            page_data[current_page] = {}
            page_data[current_page]["image"] = image


    if request.POST.get("next_page"):
        current_page += 1

    if request.POST.get("prev_page"):
        current_page -= 1

    if request.POST.get("update_text"):
        text = request.POST.get("data")
        if page_data.get(current_page):
            page_data[current_page]["text"] = text
        else:
            page_data[current_page] = {}
            page_data[current_page]["text"] = text

    if request.POST.get("request_updates"):

        if page_data.get(current_page):
            image = page_data.get(current_page).get("image")
            text = page_data.get(current_page).get("text")

            if image:
                r = HttpResponse(json.dumps({"canvas_data": image.get("data"), "action": image.get("action"), "text_data": text, "page": current_page}), content_type="application/json")
                return r




    return render(request, "start_page.html")
