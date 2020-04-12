from remoteApp.models import PageData
from channels.db import database_sync_to_async


class Page:

    def __init__(self, index):

        self.obj = PageData.objects.all().filter(page=index)
        if self.obj.count() == 0:
            # there is no page obj created for that page index
            self.obj = PageData.objects.create(page=index)

    def update_data(self, field, data):
        """ sets model field to exact value.
        for bg change pass full dict with all data,
        not only just updated """

        # could not work
        page = self.obj
        if not field:
            print("no field found")
            return

        print(page)
        #setattr(page, field, data)
        exec(f"page.update({field}={data})")
        print("SAVED")
        # not sure if it is necessary




    def get_data(self, field):
        return getattr(self.obj[0], field)


