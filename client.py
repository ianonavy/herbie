import socket
s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
s.connect('/tmp/herbie')
while True:
	x = input('> ')
	if x:
		s.send(bytes(x, "utf-8"))
	else:
		break
s.close()