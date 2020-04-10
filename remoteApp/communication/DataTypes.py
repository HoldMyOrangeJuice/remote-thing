import abc
from remoteApp.communication.values import Field, Commands, Initiator, CommandType
from remoteApp.consumers import Consumer
from remoteApp.communication.sv_message import ServerMessage

FIELD = Field()

# class DataType:
#     def __init__(self):
#         pass
#
#     # @abc.abstractmethod
#     # def dump(self):
#     #     """ dump data to json-like dictionary and return it to save later """
#     #     return
#
#
# class CanvasData(DataType):
#
#     def __init__(self, data):
#         DataType.__init__(self)
#         self.data = data
#         self.field = FIELD.canvas
#
#     def dump(self):
#         return self.data
#
#
# class TextData(DataType):
#
#     def __init__(self, data):
#         DataType.__init__(self)
#         self.data = data
#
#     def dump(self):
#         return {"text": self.data}
#
#
# class BgData(DataType):
#
#     def __init__(self, data):
#         DataType.__init__(self)
#         self.data = data
#
#     def dump(self):
#         return {"url": self.data}

def get(invoker_ip, time):
    pass


def send(invoker_ip, data):
    # send this consumer's id and data, data = {...}
    consumer = Consumer.consumers[invoker_ip]
    sv_msg = ServerMessage(data=data,
                           initiator=Initiator.Commands.last_interaction,
                           page=consumer.current_page)
    await sv_msg.send()


handlers =\
    {
        CommandType.get_from_client: get,
        CommandType.send_to_invoker: send,
    }

class Command:
    def __init__(self, cl_msg):
        self.command = cl_msg.data.get("command")
        self.args = cl_msg.data.get("args")
        self.invokerIP = cl_msg.client_ip()

    def execute(self):
        handler = handlers.get(self.command)
        handler(invoker_ip=self.invokerIP, data=self.args)




