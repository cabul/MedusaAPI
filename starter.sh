#ª/bin/bash
if [ $(ps -e -o uid,cmd | grep $UID | grep node | grep -v grep | wc -l | tr -s "\n") -eq 0 ]
then 
	export PATH=/usr/local/bin:$PATH
	forever start --sourceDir /opt/medusa/api server.js
fi
