import pytz
import datetime


def convert_datetime_timezone(dt, input_fmt, tz1, tz2="Europe/Athens"):
    tz1 = pytz.timezone(tz1)
    tz2 = pytz.timezone(tz2)

    dt = datetime.datetime.strptime(dt, input_fmt)
    dt = tz1.localize(dt)
    dt = dt.astimezone(tz2)

    # output format
    # dt = dt.strftime("%Y-%m-%d %H:%M:%S %p %Z")
    return dt
