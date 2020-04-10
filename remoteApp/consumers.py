import json
from channels.consumer import AsyncConsumer
from channels.db import database_sync_to_async
from remoteApp.models import PageData
import datetime
import ast
from remoteApp.communication.sv_message import ServerMessage
from remoteApp.communication.cl_message import ClientMessage
from remoteApp.communication.values import Update, Field

# {initiator: page_data_update, data: text_data, page}

# ip: consumer class



class Consumer(AsyncConsumer):

    consumers = {}

    async def websocket_connect(self, event):
        print("connected", event, datetime.datetime.now().strftime("%H:%M:%S"))

        # if we created consumers before
        if Consumer.consumers:
            self.current_page = list(Consumer.consumers.values())[0].current_page
        else:
            self.current_page = 0



        # accept connection
        await self.send({"type": "websocket.accept"})

        cv_data = await self.get_page_data("canvas_image", self.current_page)
        txt_data = await self.get_page_data("text", self.current_page)
        bg_data = await self.get_parsed_bg_data()  # bg_data is a stringified json stored in db.

        # send every type of data on connect
        msg = ServerMessage(consumer=self, initiator="page_data_update", data=cv_data, page=self.current_page)
        await msg.send()
        msg = ServerMessage(consumer=self, initiator="page_data_update", data=txt_data, page=self.current_page)
        await msg.send()
        msg = ServerMessage(consumer=self, initiator="page_data_update", data=bg_data, page=self.current_page)
        await msg.send()

    async def websocket_send(self, data):

        await self.send(
            {
                "type": "websocket.send",
                "text": data,
            })

    async def websocket_receive(self, event):

        client_msg = ClientMessage(event.get("text"))

        Consumer.consumers[client_msg.client_ip()] = self

        if client_msg.is_update():
            # save to db
            client_msg.save_changes(to_page=self.current_page)

            # send to users
            self.send_update_to_consumers(client_msg)

        if client_msg.is_command():
            perform_command(client_msg.data)


        if client_msg.initiator == Update.client_canvas_update:

            if client_msg.data:
                # first save changes made by user
                await self.add_page_data(field="canvas_image", data=client_msg.data, page_index=self.current_page)

                # then send them to all clients
                msg = ServerMessage(all_consumers=consumers, initiator=client_msg.initiator, data=client_msg.data, page=self.current_page, except_consumer=self)
                await msg.send()

        if client_msg.initiator == Update.client_text_update:

            if client_msg.data:
                await self.add_page_data("text", client_msg.data, page_index=self.current_page)

                await self.send_update_to_all(data={
                    "reason": "page_data_update", "text": data.get("text_data"), "page": self.current_page
                }, except_consumer=self)

        if client_msg.initiator == Update.client_bg_update:

            # save to db
            await self.save_msg_data(client_msg)

            # send to users
            try:
                bg_images_data = ast.literal_eval(await self.get_page_data("bg_images", self.current_page))
            except:
                bg_images_data = []

            await self.send_update_to_all(data=
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

        if data.get("play_sound"):
            await self.send_update_to_all(data=
            {
                "reason": "play-sound",
                "sound": data.get("link"),
                "page": self.current_page,
            }, except_consumer=None)

        if data.get("log"):
            await self.send_update_to_all(data=
            {
                "reason": "log",
                "msg": data.get("msg"),
                "page": self.current_page,
            }, except_consumer=self)

        if data.get("last-interaction"):
            print("last-interaction")
            await self.send_update_to_all( data=
            {
                "reason": "last-interaction",
                "time": data.get("time"),
                "page": self.current_page,
            }, except_consumer=self)

        if data.get("command"):

            if data.get("cont") == "send-last-inter":

                await self.send_update_to_all(data=
                {
                    "reason": "execute",
                    "data": "send_last_inter",
                    "page": self.current_page,
                }, except_consumer=self)

        if data.get("page-update"):
            if data.get("page-update") == "next":

                for consumer in consumers:
                    consumer.current_page += 1
                #current_page +=1
            if data.get("page-update") == "prev":

                for consumer in consumers:
                    consumer.current_page -= 1
                #current_page -= 1


            await self.send_update_to_all( data=
            {
                "reason": "page_data_update",
                "canvas_data": await self.get_page_data(field="canvas_image", page_index=self.current_page),
                "text": await self.get_page_data(field="text", page_index=self.current_page),
                "bg_images_data": await self.get_parsed_bg_data(),  # bg_data is a stringified json stored in db.
                "page": self.current_page,

            }, except_consumer=None)

    async def send_update_to_all(self, data, except_consumer=None):

        for consumer in Consumer.consumers:
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

        if page_object.count() > 0:
                existing_data = self.sync_get_page_data("bg_images", self.current_page)
                # big mess
                if existing_data:

                    # string back to list

                    current_images_data = ast.literal_eval(existing_data)

                    for item in existing_data:
                        if item.get("url") == data.get("url"):
                            # avoid duplicated images because this is only way thy get deleted.
                            # Otherwise images getting duplicated in database every time client moves them
                            # this is where server-client async happens
                            existing_data.remove(item)

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

    @database_sync_to_async
    def save_msg_data(self, msg):

        # todo:
        # database stores field data as dictionary
        # example: canvas_data filed = {"url": "base64"}
        page_obj = PageData.objects.filter(page=self.current_page)
        if page_obj.count() > 0:
            existing_data = {}
        if msg.updated_field() != self.Update.client_bg_update:
            # override data
            await self.set_page_data(field=msg.updated_field, data=msg.data, page=self.current_page)
        else:
            # add data to existing
            await self.add_page_data(field=msg.updated_field, data=msg.data, page=self.current_page)

    # call this func only if cl_msg.is_update()

    def send_update_to_consumers(self, cl_msg):

        sv_msg = ServerMessage(initiator=cl_msg.initiator,
                               all_consumers=consumers,
                               except_consumer=self,
                               data=cl_msg.data,
                               page=self.current_page)
        await sv_msg.send()



        await self.send_update_to_all(data=
        {
            "reason": "execute",
            "data": "send_last_inter",
            "page": self.current_page,
        }, except_consumer=self)

    async def websocket_disconnect(self, event):
        print("disconnected", event)
        for ip in Consumer.consumers.keys():
            if Consumer.consumers[ip] == self:
                del Consumer.consumers[ip]

    def perform_command(self, command_data):
        # command data is {...}
        command = command_data.get("command")
