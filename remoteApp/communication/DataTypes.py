import abc
from remoteApp.communication.values import Field, Commands, Initiator, CommandType
from remoteApp.consumers import Consumer
from remoteApp.communication.sv_message import ServerMessage

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


async def get(invoker_ip, data):
    # client asked for data from other clients. command contains request type
    invoker = Consumer.consumers[invoker_ip]
    sv_msg = ServerMessage(data=data,
                           initiator=Initiator.Commands.last_interaction,
                           page=invoker.current_page)

    await sv_msg.send()


async def send(invoker_ip, data):
    # send this consumer's id and data, data = {...}
    # client gives data for invoker client. command contains response
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

        self.command_type = cl_msg.data.get("command_type")
        self.invokerIP = cl_msg.ip

        # client message contains request (pre existing)
        if self.command_type == CommandType.get_from_client:
            self.command_data = cl_msg.data.get("command")

        # client message contains response (original)
        elif self.command_type == CommandType.send_to_invoker:
            self.command_data = cl_msg.data.get("command_response")

    def execute(self):
        handler = handlers.get(self.command_type)
        resp = {"data": self.command_data, "invoker_ip": self.invokerIP}
        handler(invoker_ip=self.invokerIP, data=resp)




