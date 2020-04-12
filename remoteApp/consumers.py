import json
from channels.consumer import AsyncConsumer
from channels.db import database_sync_to_async
from remoteApp.models import PageData
import datetime
import ast
from remoteApp.communication.Message import Message
from remoteApp.communication.sv_message import ServerMessage
from remoteApp.communication.cl_message import ClientMessage
from remoteApp.communication.values import Update, Field, Initiator


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

        cv_data = await self.get_page_data(Field.canvas, self.current_page)
        txt_data = await self.get_page_data(Field.text, self.current_page)
        bg_data = await self.get_page_data(Field.bg, self.current_page) # bg_data is a stringified json stored in db.

        # send every type of data on connect
        print("sending init updates", Initiator.Update.DataBaseUpdate.AdditionUpdate.client_canvas_update)
        msg = ServerMessage(consumer=self,
                            initiator=Initiator.Update.DataBaseUpdate.AdditionUpdate.client_canvas_update,
                            data=cv_data, page=self.current_page)
        await msg.send()
        msg = ServerMessage(consumer=self,
                            initiator=Initiator.Update.DataBaseUpdate.AdditionUpdate.client_text_update,
                            data=txt_data, page=self.current_page)
        await msg.send()
        msg = ServerMessage(consumer=self,
                            initiator=Initiator.Update.DataBaseUpdate.AdditionUpdate.client_bg_update,
                            data=bg_data, page=self.current_page)
        await msg.send()

    async def websocket_send(self, data):

        await self.send(
            {
                "type": "websocket.send",
                "text": data,
            })

    async def websocket_receive(self, event):

        client_msg = ClientMessage(event.get("text"))

        Consumer.consumers[client_msg.ip] = self
        print("added consumer with ip of", client_msg.ip)

        if client_msg.is_addition() or client_msg.is_deletion():

            # save to db

            coro = client_msg.save_changes(to_page=self.current_page)
            await coro

            # send to users
            await self.send_update_to_consumers(client_msg)

        if client_msg.is_command():
            command = Command(client_msg)
            command.execute()

        # todo:
        #  deletion of bg images -> server-side and client-side request +
        #  play sound command -> client-side (add types on server-side) +
        #  log command -> client-side (add types on server-side)        +
        #  page update -> server-side and client-side request           +


    async def send_update_to_all(self, data, except_consumer=None):

        for consumer in self.get_consumers():
            if consumer == except_consumer:
                pass
            else:
                await consumer.websocket_send(json.dumps(data))

    async def get_parsed_bg_data(self):
        bg_data = await self.get_page_data(Field.bg, self.current_page)


        return bg_data

    #@database_sync_to_async
    def set_page_data(self, field, data, page_index):
        page_object = PageData.objects.filter(page=page_index)
        if page_object.count() > 0:
            exec(f"page_object.update({field}={data})")


    #@database_sync_to_async
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
            if field == "canvas":
                PageData.objects.create(canvas_image=data, page=self.current_page)
            elif field == "text":
                PageData.objects.create(text=data, page=self.current_page)
            elif field == "bg":
                PageData.objects.create(bg_images=json.dumps([data]), page=self.current_page)

    @database_sync_to_async
    def get_page_data(self, field, page_index):
        pages = PageData.objects.all().filter(page=page_index)
        if pages.count() > 0:
            page = pages[0]

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
        if msg.updated_field() != Update.DataBaseUpdate.client_bg_update:
            # override data
            self.set_page_data(field=msg.updated_field, data=msg.data, page_index=self.current_page)
        else:
            # add data to existing
            self.add_page_data(field=msg.updated_field, data=msg.data, page_index=self.current_page)

    def get_consumers(self):
        print("getting consumers", list(Consumer.consumers.values()))
        return list(Consumer.consumers.values())
    # call this func only if cl_msg.is_update()

    async def send_update_to_consumers(self, cl_msg):
        print("send updates to consumers")
        sv_msg = ServerMessage(initiator= cl_msg.initiator,
                               all_consumers= self.get_consumers(),
                               except_consumer=self, # None cuz i have same id should be self
                               data=cl_msg.data,
                               page=self.current_page)
        await sv_msg.send()



        # await self.send_update_to_all(data=
        # {
        #     "reason": "execute",
        #     "data": "send_last_inter",
        #     "page": self.current_page,
        # }, except_consumer=self)

    async def websocket_disconnect(self, event):
        print("disconnected", event)
        to_del = []
        for ip in Consumer.consumers.keys():
            if Consumer.consumers[ip] == self:
                to_del.append(ip)
        for ip in to_del:
            del Consumer.consumers[ip]

    def perform_command(self, command_data):
        # command data is {...}
        command = command_data.get("command")


from remoteApp.communication.DataTypes import Command
