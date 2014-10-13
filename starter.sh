#ª/bin/bash
if []
then 
	export PATH=/usr/local/bin:$PATH
	forever start --sourceDir /opt/medusa/api server.js
fi
