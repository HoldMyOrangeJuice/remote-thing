import asyncio
import json
from django.contrib.auth import get_user_model
from channels.consumer import AsyncConsumer
from channels.db import database_sync_to_async
#from .models import Thread, ChatMessage
from remoteApp.models import PageData
import datetime
import ast
from asgiref.sync import sync_to_async

# {reason:page_data_update, canvas_data: text_data, page}


consumers = []

class Consumer(AsyncConsumer):

    async def websocket_connect(self, event):
        print("connected", event, datetime.datetime.now().strftime("%H:%M:%S"))

        # if we created consumers before
        if consumers:
            self.current_page = consumers[0].current_page
        else:
            self.current_page = 0

        consumers.append(self)


        await self.send(
            {
                "type": "websocket.accept"
            })
        # bg_data = await self.get_page_data("bg_images", current_page)
        #
        # try:
        #     loaded_bg_data = ast.literal_eval(bg_data)
        # except:
        #     loaded_bg_data = []

        data = json.dumps({
            "reason": "page_data_update",
            "canvas_data": await self.get_page_data("canvas_image", self.current_page),
            "text": await self.get_page_data("text", self.current_page),
            "bg_images_data": await self.get_parsed_bg_data(),  # bg_data is a stringified json stored in db.
            "page": self.current_page
        })

        await self.websocket_send(data)

    async def websocket_send(self, data):

        await self.send(
            {
                "type": "websocket.send",
                "text": data,
            })

    async def websocket_receive(self, event):

        data = json.loads(event.get("text"))
        if data.get("client-canvas-update"):
            if data.get("canvas-image"):
                await self.add_page_data(field="canvas_image", data=data.get("canvas-image"), page_index=self.current_page)

                await self.send_update_to_all(consumers, data={
                    "reason": "page_data_update", "canvas_data": data.get("canvas-image"), "page": self.current_page
                }, except_consumer=self)

        if data.get("client-text-update"):
            if data.get("text_data"):
                await self.add_page_data("text", data.get("text_data")), "weird func"

                await self.send_update_to_all(consumers, data={
                    "reason": "page_data_update", "text": data.get("text_data"), "page": self.current_page
                }, except_consumer=self)

        if data.get("bg-image-update"):

            # save to db

            await self.add_page_data("bg_images", data.get("bg_image_data"), self.current_page)

            # send to users
            try:
                bg_images_data = ast.literal_eval(await self.get_page_data("bg_images", self.current_page))
            except:
                bg_images_data = []

            await self.send_update_to_all(consumers, data=
            {
                "reason": "page_data_update",
                "bg_images_data": bg_images_data,
                "page": self.current_page,
            }, except_consumer=self)
        
        if data.get("bg-image-update-delete"):
            url = data.get("bg_image_data").get("url")
            try:
                bg_images_data = ast.literal_eval(await self.get_page_data("bg_images", self.current_page))
            except:
                bg_images_data = []
                
            if bg_images_data:
                for item in bg_images_data:
                    if item.get("url") == url:
                        bg_images_data.remove(item)
                        self.set_page_data("bg_images", bg_images_data, self.current_page)
                        
            
        
        if data.get("page-update"):
            if data.get("page-update") == "next":

                for consumer in consumers:
                    consumer.current_page += 1
                #current_page +=1
            if data.get("page-update") == "prev":

                for consumer in consumers:
                    consumer.current_page -= 1
                #current_page -= 1


            await self.send_update_to_all(consumers=consumers, data=
            {
                "reason": "page_data_update",
                "canvas_data": await self.get_page_data(field="canvas_image", page_index=self.current_page),
                "text": await self.get_page_data(field="text", page_index=self.current_page),
                "bg_images_data": await self.get_parsed_bg_data(),  # bg_data is a stringified json stored in db.
                "page": self.current_page,

            }, except_consumer=None)

    async def send_update_to_all(self, consumers, data, except_consumer=None):

        for consumer in consumers:
            if consumer == except_consumer:
                pass
            else:
                await consumer.websocket_send(json.dumps(data))


    async def get_parsed_bg_data(self):
        bg_data = await self.get_page_data("bg_images", self.current_page)

        try:
            loaded_bg_data = ast.literal_eval(bg_data)
        except:
            loaded_bg_data = []

        return loaded_bg_data

    @database_sync_to_async
    def set_page_data(self, field, data, page_index):
        page_object = PageData.objects.filter(page=page_index)
        if page_object.count() > 0:
            if field == "canvas_image":
                page_object.update(canvas_image=data)
            elif field == "text":
                page_object.update(text=data)
            elif field == "bg_images":
                # data = stringified
                page_object.update(bg_images=data)

    @database_sync_to_async
    def add_page_data(self, field, data, page_index):
        page_object = PageData.objects.filter(page=page_index)
        #print("is page existing?", page_object)
        if page_object.count() > 0:
            if field == "canvas_image":
                page_object.update(canvas_image=data)
            elif field == "text":
                page_object.update(text=data)
            elif field == "bg_images":

                existing_data = self.sync_get_page_data("bg_images", self.current_page)

                if existing_data:

                    # string back to list

                    current_images_data = ast.literal_eval(existing_data)

                    for item in current_images_data:
                        if item.get("url") == data.get("url"):
                            # avoid duplicated images because this is only way thy get deleted.
                            # Otherwise images getting duplicated in database every time client moves them
                            # this is where server-client async happens
                            current_images_data.remove(item)

                else:
                    current_images_data = []
                # appending data = {"url":base64, "coordinates":{"x":1, "y":1}}

                current_images_data.append(data)

                page_object.update(bg_images=json.dumps(current_images_data), page=self.current_page)

        else:
            if field == "canvas_image":
                PageData.objects.create(canvas_image=data, page=self.current_page)
            elif field == "text":
                PageData.objects.create(text=data, page=self.current_page)
            elif field == "bg_images":
                PageData.objects.create(bg_images=json.dumps([data]), page=self.current_page)

    @database_sync_to_async
    def get_page_data(self, field, page_index):
        page = PageData.objects.all().filter(page=page_index)
        if page.count() > 0:
            page = page[0]

            return page.__getattribute__(field)

    def sync_get_page_data(self, field, page_index):
        page = PageData.objects.all().filter(page=page_index)
        if page.count() > 0:
            page = page[0]
            return page.__getattribute__(field)




    async def websocket_disconnect(self, event):
        print("disconnected", event)
        consumers.remove(self)

