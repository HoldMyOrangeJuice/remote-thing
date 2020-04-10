import json
from remoteApp.communication.values import Update
from remoteApp.communication import Message

# ideas:
# server message can send only one data( {a: b, c: d} ) type at once


class ServerMessage(Message):
    def __init__(self, initiator, page, data, consumer=None, all_consumers=None, except_consumer=None):

        super.__init__(initiator, page, data)
        self.page = page

        if all_consumers:
            self.consumers = all_consumers
        elif consumer:
            self.consumers = [consumer]
        self.except_consumer = except_consumer

    async def send(self):
        for consumer in self.consumers:
            if consumer != self.except_consumer:
                formatted_object = dict()

                formatted_object["data"] = self.data
                formatted_object["initiator"] = self.initiator
                formatted_object["page"] = self.page

                await consumer.send({"type": "websocket.send", "text": json.dumps(formatted_object)})




