import json
from remoteApp.communication.values import Update
from remoteApp.communication.Message import Message


class ServerMessage:
    def __init__(self, page, actions, consumer=None, all_consumers=None, except_consumer=None):



        self.actions = actions
        self.page = page

        if all_consumers:
            self.consumers = all_consumers
        elif consumer:
            self.consumers = [consumer]
        self.except_consumer = except_consumer


    async def send(self):

        # print("sending to", self.consumers, "except", self.except_consumer)
        for consumer in self.consumers:
            if consumer != self.except_consumer:
                formatted_object = dict()

                formatted_object["actions"] = self.actions
                formatted_object["page"] = self.page
                await consumer.send({"type": "websocket.send", "text": json.dumps(formatted_object)})




