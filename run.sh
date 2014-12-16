NODEWEBKIT=`which nw` || `which nodewebkit`

while [ ! -f /tmp/herbie.lock ]; do
	echo 'Starting server...'
	./server.py &
	sleep 1
done
$NODEWEBKIT --enable-transparent-visuals --disable-gpu .
