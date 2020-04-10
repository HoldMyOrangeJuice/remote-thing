from remoteApp.communication.values import Field
from remoteApp.models import PageData


class Message:

    def __init__(self, initiator, data, client):

        self.data = data
        self.initiator = initiator
        self.client = client

    def is_update(self):
        if 'update' in self.initiator:
            return True

    def is_command(self):
        if "command" in self.initiator:
            return True

    def updated_field(self):
        if self.is_update():
            for field in Field.__iter__():
                if field in self.initiator:
                    return field

        return False

