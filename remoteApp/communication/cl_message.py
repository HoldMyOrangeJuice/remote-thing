import json
from remoteApp.communication.values import Update, Field
from remoteApp.communication import Message
from remoteApp.communication.Page import Page


class ClientMessage(Message):
    # {"initiator": .initiator, "data":.data }

    def __init__(self, obj):

        data = json.loads(obj)

        self.initiator = data.get("initiator")
        # object, contains full event data. can be multi-layered
        self.data = data.get("data")
        self.client = data.get("client")
        super().__init__(initiator=self.initiator, data=self.data, client=self.client)

    def save_changes(self, to_page):
        if super().is_update():
            page = Page(to_page)
            if super().updated_field() == Field.bg:
                # [{}, {}, {}]
                data = page.get_data(Field.bg)
                updated_data = data.append(self.data)

                self.data = updated_data

            page.update_data(data=self.data, field=super().updated_field())

    def client_ip(self):
        return self.client.get("ip")








