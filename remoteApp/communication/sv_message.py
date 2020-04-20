import json
from remoteApp.communication.values import Update
from remoteApp.communication.Message import Message


class ServerMessage:
    def __init__(self, page, commands=None, actions=None, consumer=None, all_consumers=None, except_consumer=None):

        if isinstance(actions, list):
            self.actions = actions
        else:
            self.actions = [actions]

        if isinstance(commands, list):
            self.commands = commands
        else:
            self.commands = [commands]

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
                if self.actions and self.actions[0]:
                    formatted_object["actions"] = self.actions
                if self.commands and self.commands[0]:

                    formatted_object["commands"] = self.commands
                formatted_object["page"] = self.page
                await consumer.send({"type": "websocket.send", "text": json.dumps(formatted_object)})




