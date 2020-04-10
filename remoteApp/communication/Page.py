from remoteApp.models import PageData


class Page:
    def __init__(self, index):
        self.obj = PageData.objects.filter(page=index)
        if self.obj.count() == 0:
            # there is no page obj created for that page index
            self.obj = PageData.objects.create(page=index)

    def update_data(self, field, data):
        """ sets model field to exact value.
        for bg change pass full dict with all data,
        not only just updated """
        # could not work
        setattr(self.obj, field, data)
        # not sure if it is necessary
        self.obj.save()

    def get_data(self, field):
        return getattr(self.obj, field)


