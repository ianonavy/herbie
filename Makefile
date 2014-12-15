BUILD_DIR = build
SRC_DIR = src
INSTALL_DIR = /usr/local/bin/

NODE_WEBKIT_DIR = /usr/lib/node-webkit
NODE_WEBKIT = /usr/bin/nw
MKDIR_P = mkdir -p
CHMOD = chmod
CAT = cat
RM_RF = rm -rf
CP = cp

all: directories herbie

directories: ${BUILD_DIR}

${BUILD_DIR}:
	@${MKDIR_P} ${BUILD_DIR}

dependencies:
	cd ${SRC_DIR}; npm install

herbie: dependencies
	cd ${SRC_DIR}; zip -r ../herbie.nw *
	${CAT} ${NODE_WEBKIT} herbie.nw > ${BUILD_DIR}/herbie
	${CHMOD} +x ${BUILD_DIR}/herbie
	${RM_RF} herbie.nw
	${CP} ${NODE_WEBKIT_DIR}/nw.pak ${BUILD_DIR}
	${CP} ${NODE_WEBKIT_DIR}/icudtl.dat ${BUILD_DIR}

install: herbie
	sudo install -m755 ${BUILD_DIR}/herbie ${INSTALL_DIR}/herbie
	sudo install -m755 ${BUILD_DIR}/nw.pak ${INSTALL_DIR}/nw.pak
	sudo install -m755 ${BUILD_DIR}/icudtl.dat ${INSTALL_DIR}/icudtl.dat

clean:
	${RM_RF} ${BUILD_DIR}/
	${RM_RF} ${SRC_DIR}/node_modules/

.PHONY: all directories dependencies herbie install clean
