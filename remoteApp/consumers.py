import json
from channels.consumer import AsyncConsumer
from channels.db import database_sync_to_async
from remoteApp.models import PageData, Users
import datetime
import ast
from remoteApp.communication.Message import Message
from remoteApp.communication.sv_message import ServerMessage
from remoteApp.communication.cl_message import ClientMessage
from remoteApp.communication.values import Update, Field, Initiator
from remoteApp.communication.Page import Page
from remoteApp.communication.cl_message import get_messages
import asyncio

class Consumer(AsyncConsumer):

    @classmethod
    def add_consumer(cls, usr, consumer):

        print('------- add_consumer called -------')
        if cls.someone_connected():
            print("added consumer with ip of", usr)
            cls.consumers[usr] = consumer
            print("now consumers are", Consumer.consumers)
        else:
            cls.consumers = dict()
            cls.consumers[usr] = consumer
            print("created cons dict", Consumer.consumers)

    @classmethod
    def someone_connected(cls):
        try:
            return cls.consumers
        except:
            return False

    @classmethod
    def set_page(cls, page):
        cls.current_page = page

    async def websocket_connect(self, event):
        print("connected", event, datetime.datetime.now().strftime("%H:%M:%S"))

        # if we created consumers before
        try:
            Consumer.current_page
        except:
            print("Set page to 0")
            Consumer.set_page(0)
            print(Consumer.current_page)

        # accept connection
        await self.send({"type": "websocket.accept"})

        action_pattern = await self.get_page_data()
        print("sending init data")
        msg = ServerMessage(consumer=self, actions=action_pattern, page=Consumer.current_page)
        await msg.send()

        messages = await get_messages()
        print("messages", messages)
        if messages:
            msg = ServerMessage(consumer=self, commands=[{"command": {"messages": messages}}], page=Consumer.current_page)
            await msg.send()

    async def websocket_send(self, data):

        await self.send(
            {
                "type": "websocket.send",
                "text": data,
            })

    async def websocket_receive(self, event):

        client_msg = ClientMessage(event.get("text"))

        if client_msg.action and client_msg.action.get("connect"):

            result = await add_user(u=client_msg.username, c=client_msg.cookie)

            if result.get("error"):
                await self.send_status_to_client(f"server exception >>> {result.get('error')} \n connection aborted")
                await self.websocket_disconnect("session deleted due to connection error")
                raise Exception

            if result.get("username") and client_msg.username == "":
                await self.send_username_to_client(result.get("username"))
                Consumer.add_consumer(result.get("username"), self)
            else:
                Consumer.add_consumer(client_msg.username, self)

        await client_msg.handle_message()

    @staticmethod
    def get_consumers():
        return list(Consumer.consumers.values())
    # call this func only if cl_msg.is_update()

    @database_sync_to_async
    def get_page_data(self):
        page = Page(Consumer.current_page)
        return page.get_actions()

    async def websocket_disconnect(self, event):
        print("disconnected", event)
        to_del = []
        if Consumer.someone_connected():

            for usr in Consumer.consumers.keys():
                if Consumer.consumers[usr] == self:
                    to_del.append(usr)
            for usr in to_del:
                del Consumer.consumers[usr]

    async def send_status_to_client(self, data):
        await self.websocket_send(json.dumps({"status": data}))
    async def send_username_to_client(self, data):
        await self.websocket_send(json.dumps({"username": data}))




@database_sync_to_async
def add_user(u, c):
    if c:
        print("add user", u, c)
        if Users.objects.all().filter(cookie=c).count() == 0:
            # cookie is original
            if Users.objects.all().filter(username=u).count() == 0:
                # name is original, adding user
                Users.objects.all().create(username=u, cookie=c)
                print("actually added", u, c)
                return {"username": u, "cookie": c}
            if u == "":
                # cookie original no name provided by user
                return {"error": "provide username"}
            else:
                # no such cookie in db, user never logged in
                return {"error": "user never logged in"}
        else:
            # cookie is not original
            if u == "":
                # name is empty, get name by cookie
                if Users.objects.all().filter(cookie=c).count() > 0:
                    username = Users.objects.all().filter(cookie=c)[0].username
                    return {"username": username, "cookie": c}
            elif u != "" and Users.objects.all().filter(username=u, cookie=c).count()>0:
                # name and cookie provided by user are valid
                return {"username": u, "cookie": c}
            else:
                # name is invalid for that cookie
                return {"error": "name is invalid for that cookie leave name field empty"}

    else:
        # cookie not sent
        return {"error": "cookie not sent"}
