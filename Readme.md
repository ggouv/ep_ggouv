# Plugin etherpad-lite pour ggouv

** A modifier dans etherpad **

Dans le fichier /src/static/js/collab_client.js, vers la ligne 433, remplacer :
`hooks.callAll('handleClientMessage_' + msg.type, {payload: msg.payload});`
par :
`hooks.callAll('handleClientMessage_' + msg.type, {payload: msg.payload, original_msg: msg});`