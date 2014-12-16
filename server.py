#!/usr/bin/env python
import socket
import os
import os.path

lock_filename = "/tmp/herbie.lock"
socket_filename = "/tmp/herbie"

if os.path.exists(lock_filename):
    raise Exception(
        "Daemon already running! If you're sure this is wrong, delete {}".format(
            lock_filename))

s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
s.bind(socket_filename)
s.listen(1)

try:
    with open(lock_filename, 'w+') as lock_file:
        while True:
            connection, client_address = s.accept()
            try:
                while True:
                    data = connection.recv(1024)
                    if data:
                        os.system(data)
                    else:
                        break
            finally:
                connection.close()
except:
    os.remove(lock_filename)
    os.remove(socket_filename)