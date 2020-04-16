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
from remoteApp.communication.Page import Page


class Consumer(AsyncConsumer):

    @classmethod
    def add_consumer(cls, ip, consumer):

        print('------- add_consumer called -------')
        if cls.someone_connected():
            print("added consumer with ip of", ip)
            cls.consumers[ip] = consumer
            print("now consumers are", Consumer.consumers)
        else:
            cls.consumers = dict()
            cls.consumers[ip] = consumer
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

        msg = ServerMessage(consumer=self, actions=action_pattern, page=Consumer.current_page)
        await msg.send()

    async def websocket_send(self, data):

        await self.send(
            {
                "type": "websocket.send",
                "text": data,
            })

    async def websocket_receive(self, event):

        client_msg = ClientMessage(event.get("text"))

        Consumer.add_consumer(client_msg.ip, self)

        #Consumer.consumers[client_msg.ip] = self

        # save to db or execute command
        print("received client message")
        await client_msg.handle_message()

        # send to users
        # echo message to consumers



    async def send_update_to_all(self, data, except_consumer=None):

        for consumer in self.get_consumers():
            if consumer == except_consumer:
                pass
            else:
                await consumer.websocket_send(json.dumps(data))

    @staticmethod
    def get_consumers():
        return list(Consumer.consumers.values())
    # call this func only if cl_msg.is_update()

    @database_sync_to_async
    def get_page_data(self):
        page = Page(Consumer.current_page)
        return page.get_actions()

    async def send_update_to_consumers(self, cl_msg):

        sv_msg = ServerMessage(
                               all_consumers=self.get_consumers(),
                               except_consumer=self,  # None cuz i have same id should be self
                               actions=cl_msg.actions,
                               page=Consumer.current_page)
        await sv_msg.send()

    async def websocket_disconnect(self, event):
        print("disconnected", event)
        to_del = []
        if Consumer.someone_connected():

            for ip in Consumer.consumers.keys():
                if Consumer.consumers[ip] == self:
                    to_del.append(ip)
            for ip in to_del:
                del Consumer.consumers[ip]
